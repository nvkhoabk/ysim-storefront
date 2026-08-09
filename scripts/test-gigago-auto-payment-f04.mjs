#!/usr/bin/env node

const args = process.argv.slice(2);

function argument(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = args.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const orderId = Number.parseInt(argument("order-id", ""), 10);
const action = argument("action", "record");
const fulfillmentMode = argument("fulfillment-mode", "demo");
const baseUrl = (
  argument("base-url") ||
  process.env.YSIM_LOCAL_BASE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");
const testSecret = process.env.GIGAGO_TEST_SECRET?.trim();

if (!Number.isInteger(orderId) || orderId <= 0) {
  console.error("FAIL: --order-id must be a positive integer.");
  process.exit(1);
}

if (action !== "record" && action !== "fulfill") {
  console.error("FAIL: --action must be record or fulfill.");
  process.exit(1);
}

if (fulfillmentMode !== "demo" && fulfillmentMode !== "live") {
  console.error("FAIL: --fulfillment-mode must be demo or live.");
  process.exit(1);
}

if (!testSecret) {
  console.error("FAIL: GIGAGO_TEST_SECRET is missing.");
  process.exit(1);
}

const response = await fetch(
  `${baseUrl}/api/fulfillment/gigago/test-auto-payment`,
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ysim-test-secret": testSecret,
    },
    body: JSON.stringify({ orderId, action, fulfillmentMode }),
  },
);
const text = await response.text();
let body;

try {
  body = text ? JSON.parse(text) : null;
} catch {
  console.error(text);
  console.error(`FAIL: non-JSON response (HTTP ${response.status}).`);
  process.exit(2);
}

console.log(JSON.stringify(body, null, 2));

if (!response.ok || !body?.success) {
  console.error(`FAIL: F04 test returned HTTP ${response.status}.`);
  process.exit(3);
}

const result = body.result;

if (action === "record") {
  if (!result?.paymentRecorded || result?.fulfillmentAttempted) {
    console.error("FAIL: record action did not stop before fulfillment.");
    process.exit(4);
  }
} else if (
  !result?.paymentRecorded ||
  !result?.fulfillmentAttempted ||
  result?.fulfillmentSucceeded !== true
) {
  console.error("FAIL: fulfill action did not complete successfully.");
  process.exit(5);
}

console.log(
  `PASS: F04 ${action} completed for Woo order ${orderId}` +
    `${action === "fulfill" ? ` (${fulfillmentMode})` : ""}.`,
);
