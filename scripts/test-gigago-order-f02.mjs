#!/usr/bin/env node

function argument(name, fallback = null) {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((item) => item.startsWith(prefix));

  return value ? value.slice(prefix.length) : fallback;
}

const baseUrl = (argument("base-url", "http://localhost:3000") || "").replace(
  /\/+$/,
  "",
);
const action = argument("action", "preview");
const mode = argument("mode", "demo");
const orderId = Number.parseInt(argument("order-id", "") || "", 10);
const testSecret = process.env.GIGAGO_TEST_SECRET?.trim();

if (!Number.isInteger(orderId) || orderId <= 0) {
  console.error("FAIL: --order-id=<WooCommerce order ID> is required.");
  process.exit(1);
}

if (!["preview", "submit", "status"].includes(action)) {
  console.error("FAIL: --action must be preview, submit or status.");
  process.exit(1);
}

if (!["live", "demo"].includes(mode)) {
  console.error("FAIL: --mode must be live or demo.");
  process.exit(1);
}

if (!testSecret) {
  console.error("FAIL: GIGAGO_TEST_SECRET is missing.");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/fulfillment/gigago/test-order`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-ysim-test-secret": testSecret,
  },
  body: JSON.stringify({
    orderId,
    action,
    mode,
  }),
});

const text = await response.text();
let body;

try {
  body = text ? JSON.parse(text) : null;
} catch {
  console.error(`FAIL: endpoint returned non-JSON: ${text.slice(0, 500)}`);
  process.exit(1);
}

console.log(JSON.stringify(body, null, 2));

if (!response.ok || body?.success !== true) {
  console.error(`FAIL: HTTP ${response.status}`);
  process.exit(1);
}

if (action === "preview" && body?.result?.eligibleForSubmit !== true) {
  console.error("FAIL: preview is not eligible for submit.");
  process.exit(2);
}

console.log(
  `PASS: Gigago F02 ${action} (${mode}) completed for Woo order ${orderId}.`,
);
