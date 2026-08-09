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
const expect = valueAfter("expect") ?? "any";
const orderId = Number.parseInt(valueAfter("order-id") ?? "", 10);
const secret = process.env.GIGAGO_TEST_SECRET?.trim();

if (!secret) {
  throw new Error("Missing GIGAGO_TEST_SECRET.");
}

if (action !== "preflight" && (!Number.isInteger(orderId) || orderId <= 0)) {
  throw new Error("--order-id is required for status/request-existing.");
}

if (!["preflight", "status", "request-existing"].includes(action)) {
  throw new Error("--action must be preflight, status, or request-existing.");
}

const endpoint = `${baseUrl}/api/fulfillment/gigago/test-action-required-alert`;
const body =
  action === "preflight" ? undefined : JSON.stringify({ action, orderId });
const response = await fetch(endpoint, {
  method: body ? "POST" : "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-ysim-test-secret": secret,
  },
  body,
});
const payload = await response.json();

console.log(`TARGET=${baseUrl}`);
console.log(`ACTION=${action}`);
console.log(`EXPECT=${expect}`);
if (Number.isInteger(orderId)) console.log(`ORDER_ID=${orderId}`);
console.log(`HTTP=${response.status}`);
console.log(JSON.stringify(payload, null, 2));

if (!response.ok || payload?.success === false) {
  throw new Error(
    `F05.1B3 action-required marker request failed with HTTP ${response.status}.`,
  );
}

if (action === "preflight") {
  if (payload?.contractVersion !== "f05.1b3-supplier-action-required-v1") {
    throw new Error("Unexpected F05.1B3 protected route contract.");
  }
  console.log("PASS: F05.1B3 supplier alert preflight compatible.");
  process.exit(0);
}

const result = payload?.result;
const acceptedStates = {
  any: [
    "",
    "requested",
    "queued",
    "sending",
    "retrying",
    "sent",
    "failed",
    "paused",
    "obsolete",
    "enqueue-failed",
  ],
  requested: ["requested"],
  "requested-or-later": ["requested", "queued", "sending", "retrying", "sent"],
  queued: ["queued", "sending", "retrying", "sent"],
  sent: ["sent"],
  failed: ["failed"],
};
const expectedStates = acceptedStates[expect];

if (!expectedStates) {
  throw new Error(`Unsupported --expect=${expect}.`);
}

if (result?.reconciliationState !== "action-required") {
  throw new Error(
    `Expected reconciliation action-required, received ${result?.reconciliationState ?? "missing"}.`,
  );
}

if (action === "request-existing") {
  if (result?.version !== "f05.1b3-v1") {
    throw new Error("Missing f05.1b3 action-required version marker.");
  }

  if (result?.incidentHashMatchesJob !== true) {
    throw new Error("Action-required incident hash does not match job.");
  }
}

if (!expectedStates.includes(result?.status ?? "")) {
  throw new Error(
    `Expected marker state ${expect}, received ${result?.status ?? "missing"}.`,
  );
}

console.log(
  `PASS: F05.1B3 supplier alert marker state=${result?.status || "absent"} for Woo order ${orderId}.`,
);
