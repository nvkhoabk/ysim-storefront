#!/usr/bin/env node

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((value) => value.startsWith("--"))
    .map((value) => {
      const [key, ...parts] = value.slice(2).split("=");
      return [key, parts.join("=")];
    }),
);

const orderId = Number.parseInt(args["order-id"] || "", 10);
const action = args.action || "status";
const baseUrl = (
  args["base-url"] ||
  process.env.YSIM_LOCAL_BASE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");
const secret = process.env.GIGAGO_TEST_SECRET?.trim();

if (!Number.isInteger(orderId) || orderId <= 0) {
  console.error("FAIL: --order-id must be a positive integer.");
  process.exit(1);
}

if (!secret) {
  console.error("FAIL: GIGAGO_TEST_SECRET is missing.");
  process.exit(1);
}

const response = await fetch(
  `${baseUrl}/api/payments/gpay/test-delayed-reconciliation`,
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ysim-test-secret": secret,
    },
    body: JSON.stringify({
      orderId,
      action,
      automationMode: args.mode || "record",
      fulfillmentMode: args["fulfillment-mode"] || "demo",
      providerStatus: args["provider-status"],
    }),
  },
);

const text = await response.text();
let body;

try {
  body = text ? JSON.parse(text) : null;
} catch {
  console.error(text);
  console.error(`FAIL: non-JSON HTTP ${response.status}.`);
  process.exit(2);
}

console.log(JSON.stringify(body, null, 2));

if (!response.ok || !body?.success) {
  console.error(`FAIL: F04.2 test returned HTTP ${response.status}.`);
  process.exit(3);
}

console.log(`PASS: F04.2 ${action} completed for Woo order ${orderId}.`);
