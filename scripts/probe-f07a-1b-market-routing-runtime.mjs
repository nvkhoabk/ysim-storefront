// F07A-1B_MARKET_ROUTING_R4

import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";
import net from "node:net";

const args = new Map(
  process.argv.slice(2).map((value) => {
    const [key, ...rest] = value.split("=");
    return [key, rest.join("=")];
  }),
);

const originBaseUrl = new URL(
  args.get("--origin-base-url") || "http://127.0.0.1:3001",
);
const publicBaseUrl = args.has("--public-base-url")
  ? new URL(args.get("--public-base-url"))
  : null;
const forwardedHost =
  args.get("--forwarded-host") || publicBaseUrl?.hostname || null;
const localNginxIp = args.get("--local-nginx-ip") || null;

function responseHeader(response, name) {
  const value = response.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : (value ?? null);
}

function request(url, { headers = {}, lookupAddress = null } = {}) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: "GET",
      headers,
    };

    if (lookupAddress) {
      const family = net.isIP(lookupAddress);
      if (family === 0) {
        reject(new Error(`INVALID_LOOKUP_ADDRESS:${lookupAddress}`));
        return;
      }
      options.lookup = (_hostname, _options, callback) => {
        callback(null, lookupAddress, family);
      };
    }

    const req = client.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function urlAt(base, pathname) {
  return new URL(pathname, base);
}

function locationPath(response, base) {
  const location = responseHeader(response, "location");
  if (!location) return null;
  return new URL(location, base).pathname;
}

function assertHealthyLocalizedResponse(response, label) {
  assert.equal(response.status, 200, `${label} returned ${response.status}`);
  assert.doesNotMatch(
    response.body,
    /Internal Server Error|wrong version number|EPROTO/i,
    `${label} returned a transport failure body`,
  );
}

for (const [country, locale] of [
  ["VN", "vi"],
  ["LA", "lo"],
  ["US", "en"],
]) {
  const response = await request(urlAt(originBaseUrl, "/"), {
    headers: { "CF-IPCountry": country },
  });
  assert.equal(response.status, 307);
  assert.equal(locationPath(response, originBaseUrl), `/${locale}`);
  assert.equal(responseHeader(response, "set-cookie"), null);
  console.log(`PASS origin country simulation: ${country} -> /${locale}`);
}

const cookieResponse = await request(urlAt(originBaseUrl, "/esim"), {
  headers: {
    "CF-IPCountry": "VN",
    Cookie: "ysim_market=lo-la",
  },
});
assert.equal(cookieResponse.status, 307);
assert.equal(locationPath(cookieResponse, originBaseUrl), "/lo/esim");
console.log("PASS explicit cookie overrides origin country simulation");

for (const locale of ["vi", "en", "lo"]) {
  const response = await request(urlAt(originBaseUrl, `/${locale}/esim`), {
    headers: {
      "CF-IPCountry": "VN",
      Cookie: "ysim_market=lo-la",
    },
  });
  assertHealthyLocalizedResponse(response, `direct origin /${locale}/esim`);
  console.log(`PASS direct origin localized route: /${locale}/esim`);
}

if (forwardedHost) {
  for (const locale of ["vi", "en", "lo"]) {
    const response = await request(urlAt(originBaseUrl, `/${locale}/esim`), {
      headers: {
        Host: forwardedHost,
        "X-Forwarded-Host": forwardedHost,
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Port": "443",
        "CF-IPCountry": "VN",
        Cookie: "ysim_market=lo-la",
      },
    });
    assertHealthyLocalizedResponse(
      response,
      `forwarded public host /${locale}/esim`,
    );
    const rewrite = responseHeader(response, "x-middleware-rewrite");
    assert.ok(rewrite, `missing x-middleware-rewrite for /${locale}/esim`);
    const rewriteUrl = new URL(rewrite);
    assert.equal(rewriteUrl.protocol, "http:");
    assert.ok(
      new Set(["localhost", "127.0.0.1", "[::1]"]).has(rewriteUrl.hostname),
      `unexpected rewrite host: ${rewriteUrl.hostname}`,
    );
    assert.equal(rewriteUrl.port, originBaseUrl.port || "3001");
    assert.equal(rewriteUrl.pathname, "/esim");
    console.log(
      `PASS forwarded HTTPS host uses HTTP loopback rewrite: /${locale}/esim`,
    );
  }
} else {
  console.log("SKIP forwarded-host probe: --forwarded-host not provided");
}

if (forwardedHost && localNginxIp) {
  const localNginxBaseUrl = new URL(`https://${forwardedHost}`);
  for (const locale of ["vi", "en", "lo"]) {
    const response = await request(
      urlAt(localNginxBaseUrl, `/${locale}/esim`),
      {
        headers: { Cookie: "ysim_market=lo-la" },
        lookupAddress: localNginxIp,
      },
    );
    assertHealthyLocalizedResponse(response, `local Nginx /${locale}/esim`);
    console.log(`PASS local Nginx HTTPS route: /${locale}/esim`);
  }
} else {
  console.log(
    "SKIP local-Nginx probe: --forwarded-host and --local-nginx-ip are required",
  );
}

if (publicBaseUrl) {
  for (const locale of ["vi", "en", "lo"]) {
    const response = await request(urlAt(publicBaseUrl, `/${locale}/esim`), {
      headers: { Cookie: "ysim_market=lo-la" },
    });
    assertHealthyLocalizedResponse(response, `public /${locale}/esim`);
    console.log(`PASS public HTTPS route: /${locale}/esim`);
  }
} else {
  console.log("SKIP public probe: --public-base-url not provided");
}

const originApiResponse = await request(
  urlAt(originBaseUrl, "/api/payments/gpay/webhook"),
);
assert.equal(originApiResponse.status, 200);
console.log("PASS origin payment webhook bypass remains healthy");

if (publicBaseUrl) {
  const publicApiResponse = await request(
    urlAt(publicBaseUrl, "/api/payments/gpay/webhook"),
  );
  assert.equal(publicApiResponse.status, 200);
  console.log("PASS public payment webhook bypass remains healthy");
}

console.log(
  "PASS: F07A-1B R4 origin, forwarded-host, Nginx and public routing contract.",
);
