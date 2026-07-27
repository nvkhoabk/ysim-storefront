#!/usr/bin/env node

function argumentValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));

  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(`--${name}`);

  if (index >= 0 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }

  return fallback;
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

function positiveOrderId(value) {
  const parsed = Number.parseInt(String(value || ""), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("--order-id must be a positive integer.");
  }

  return parsed;
}

const baseUrl = argumentValue("base-url", "http://localhost:3000").replace(
  /\/$/,
  "",
);
const action = argumentValue("action", "preflight");
const expect = argumentValue("expect", "any");
const orderId =
  action === "preflight" ? null : positiveOrderId(argumentValue("order-id"));

console.log(`TARGET=${baseUrl}`);
console.log(`ACTION=${action}`);
console.log(`EXPECT=${expect}`);

if (orderId) {
  console.log(`ORDER_ID=${orderId}`);
}

const endpoint = `${baseUrl}/api/fulfillment/gigago/test-delivery-snapshot`;
const response =
  action === "preflight"
    ? await fetch(endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
      })
    : await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-ysim-test-secret": requiredEnvironment("GIGAGO_TEST_SECRET"),
        },
        body: JSON.stringify({
          orderId,
          action,
        }),
      });

const text = await response.text();
let body = null;

try {
  body = text ? JSON.parse(text) : null;
} catch {
  body = text;
}

console.log(`HTTP=${response.status}`);
console.log(JSON.stringify(body, null, 2));

if (!response.ok) {
  throw new Error(`F05.1A request failed with HTTP ${response.status}.`);
}

if (action === "preflight") {
  if (
    body?.contractVersion !== "f05.1a-secure-delivery-snapshot-v1" ||
    body?.returnsSensitiveDeliveryData !== false
  ) {
    throw new Error("F05.1A target preflight is incompatible.");
  }

  console.log("PASS: F05.1A target preflight is compatible.");
  process.exit(0);
}

const result = body?.result;
const status = action === "status" ? result : result?.status;

if (!status) {
  throw new Error("F05.1A response did not include safe delivery status.");
}

if (expect !== "any" && status.status !== expect) {
  throw new Error(
    `Expected delivery status ${expect}, received ${status.status ?? "null"}.`,
  );
}

for (const item of status.items ?? []) {
  if (
    typeof item.iccid === "string" ||
    typeof item.qrCode === "string" ||
    typeof item.shortLink === "string"
  ) {
    throw new Error("F05.1A safe status leaked sensitive delivery data.");
  }
}

if (action === "persist-fixture") {
  const orchestrationAware = status.mailOrchestrationVersion === "f05.1b2-v1";
  const acceptedAutomaticEmailStates = new Set([
    "pending",
    "queued",
    "sending",
    "sent",
  ]);
  const emailStatesValid = orchestrationAware
    ? acceptedAutomaticEmailStates.has(status.customerEmailStatus) &&
      acceptedAutomaticEmailStates.has(status.adminEmailStatus)
    : status.customerEmailStatus === "pending" &&
      status.adminEmailStatus === "pending";

  if (
    result?.assessment?.ready !== true ||
    status.status !== "ready" ||
    !emailStatesValid
  ) {
    throw new Error("F05.1A fixture was not persisted as a ready snapshot.");
  }
}

console.log(
  `PASS: F05.1A action=${action} deliveryStatus=${status.status} for Woo order ${orderId}.`,
);
