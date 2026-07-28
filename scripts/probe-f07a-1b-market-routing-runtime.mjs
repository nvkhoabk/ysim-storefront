// F07A-1B_MARKET_ROUTING_R3

import assert from "node:assert/strict";

const args = new Map(
  process.argv.slice(2).map((value) => {
    const [key, ...rest] = value.split("=");
    return [key, rest.join("=")];
  }),
);

const originBaseUrl = (
  args.get("--origin-base-url") || "http://127.0.0.1:3001"
).replace(/\/$/, "");

async function request(pathname, options = {}) {
  const response = await fetch(`${originBaseUrl}${pathname}`, {
    redirect: "manual",
    ...options,
  });
  return response;
}

function locationPath(response) {
  const location = response.headers.get("location");
  if (!location) return null;
  return new URL(location, originBaseUrl).pathname;
}

for (const [country, locale] of [
  ["VN", "vi"],
  ["LA", "lo"],
  ["US", "en"],
]) {
  const response = await request("/", {
    headers: { "CF-IPCountry": country },
  });
  assert.equal(response.status, 307);
  assert.equal(locationPath(response), `/${locale}`);
  assert.equal(response.headers.get("set-cookie"), null);
  console.log(`PASS origin country simulation: ${country} -> /${locale}`);
}

const cookieResponse = await request("/esim", {
  headers: {
    "CF-IPCountry": "VN",
    Cookie: "ysim_market=lo-la",
  },
});
assert.equal(cookieResponse.status, 307);
assert.equal(locationPath(cookieResponse), "/lo/esim");
console.log("PASS explicit cookie overrides origin country simulation");

for (const locale of ["vi", "en", "lo"]) {
  const response = await request(`/${locale}/esim`, {
    headers: {
      "CF-IPCountry": "VN",
      Cookie: "ysim_market=lo-la",
    },
  });
  assert.equal(
    response.status,
    200,
    `${locale} localized route returned ${response.status}`,
  );
  console.log(
    `PASS localized route is terminal and does not recurse: /${locale}/esim`,
  );
}

const apiResponse = await request("/api/payments/gpay/webhook");
assert.equal(apiResponse.status, 200);
console.log("PASS payment webhook bypass remains healthy");

console.log(
  "PASS: F07A-1B R3 runtime origin routing and localized rewrite contract.",
);
