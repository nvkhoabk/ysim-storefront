#!/usr/bin/env node

const baseUrl = (
  process.env.GIGAGO_BASE_URL || "https://sandbox-partners-api.gigago.com"
).replace(/\/+$/, "");
const apiKey = process.env.GIGAGO_API_KEY?.trim();
const requestId =
  process.argv
    .slice(2)
    .find((value) => value.startsWith("--request-id="))
    ?.slice("--request-id=".length) || `ysim-query-probe-${Date.now()}`;

if (!apiKey) {
  console.error("FAIL: GIGAGO_API_KEY is missing.");
  process.exit(1);
}

const payload = JSON.stringify({
  columnFilters: {
    request_id: requestId,
  },
  sort: [],
  page: 1,
  pageSize: 100,
});

async function probe(pathname, method) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      apiKey,
    },
    body: payload,
    signal: AbortSignal.timeout(
      Number.parseInt(process.env.GIGAGO_TIMEOUT_MS || "15000", 10),
    ),
  });

  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text.slice(0, 500);
  }

  return {
    pathname,
    method,
    status: response.status,
    allow: response.headers.get("allow"),
    body,
  };
}

const results = [];

for (const method of ["POST", "PUT"]) {
  results.push(await probe("/api/partner/getMyOrdersAgency", method));
}

results.push(await probe("/api/partner/getOrderDetailAgency", "POST"));

for (const result of results) {
  console.log(
    `${result.method} ${result.pathname}: HTTP ${result.status}` +
      `${result.allow ? ` · Allow=${result.allow}` : ""}`,
  );
  console.log(JSON.stringify(result.body, null, 2));
}

const myOrdersPost = results.find(
  (result) =>
    result.pathname.endsWith("/getMyOrdersAgency") && result.method === "POST",
);

if (myOrdersPost?.status === 200) {
  console.log(
    "PASS: sandbox accepts POST for getMyOrdersAgency; F02.1 adaptive query is applicable.",
  );
  process.exit(0);
}

console.error(
  "FAIL: sandbox did not accept POST for getMyOrdersAgency. Send this probe output to Gigago.",
);
process.exit(2);
