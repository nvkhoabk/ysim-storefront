#!/usr/bin/env node

function valueAfter(name) {
  const equal = process.argv.find((item) => item.startsWith(`--${name}=`));
  if (equal) return equal.slice(name.length + 3);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const baseUrl = (valueAfter("base-url") ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const action = valueAfter("action") ?? "preflight";
const orderId = Number.parseInt(valueAfter("order-id") ?? "", 10);
const secret = process.env.GIGAGO_TEST_SECRET?.trim();

if (!secret) {
  throw new Error("Missing GIGAGO_TEST_SECRET.");
}

if (action !== "preflight" && (!Number.isInteger(orderId) || orderId <= 0)) {
  throw new Error("--order-id is required for status/persist-fixture.");
}

const endpoint = `${baseUrl}/api/fulfillment/gigago/test-delivery-snapshot`;
const body =
  action === "preflight" ? undefined : JSON.stringify({ action, orderId });
const response = await fetch(endpoint, {
  method: body ? "POST" : "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-ysim-gigago-test-secret": secret,
  },
  body,
});
const payload = await response.json();

console.log(`TARGET=${baseUrl}`);
console.log(`ACTION=${action}`);
if (Number.isInteger(orderId)) console.log(`ORDER_ID=${orderId}`);
console.log(`HTTP=${response.status}`);
console.log(JSON.stringify(payload, null, 2));

if (!response.ok || payload?.success === false) {
  throw new Error(
    `F05.1B2 marker request failed with HTTP ${response.status}.`,
  );
}

if (action === "preflight") {
  if (payload?.contractVersion !== "f05.1a-secure-delivery-snapshot-v1") {
    throw new Error("Unexpected F05.1A protected route contract.");
  }
  console.log("PASS: F05.1B2 marker preflight compatible.");
  process.exit(0);
}

const result = payload?.result;
const status = action === "persist-fixture" ? result?.status : result;

if (status?.status !== "ready") {
  throw new Error(
    `Expected delivery status ready, received ${status?.status ?? "missing"}.`,
  );
}

if (status?.mailOrchestrationVersion !== "f05.1b2-v1") {
  throw new Error("Missing f05.1b2 orchestration version marker.");
}

if (status?.mailOrchestrationStatus !== "requested") {
  throw new Error(
    `Expected orchestration requested, received ${status?.mailOrchestrationStatus ?? "missing"}.`,
  );
}

if (status?.mailOrchestrationRequestMatchesDeliveryHash !== true) {
  throw new Error("Orchestration request hash does not match delivery hash.");
}

console.log(
  `PASS: F05.1B2 orchestration marker ready for Woo order ${orderId}.`,
);
