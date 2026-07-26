import fs from "node:fs";
import process from "node:process";

function readOption(name, fallback = null) {
  const equalsPrefix = `${name}=`;
  const equalsValue = process.argv.find((arg) => arg.startsWith(equalsPrefix));

  if (equalsValue) {
    return equalsValue.slice(equalsPrefix.length);
  }

  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1]
    ? process.argv[index + 1]
    : fallback;
}

const baseUrl = readOption("--base-url", "http://localhost:3000").replace(
  /\/$/,
  "",
);
const orderId = Number.parseInt(readOption("--order-id", "0"), 10);
const action = readOption("--action", "status");
const expect = readOption("--expect", "any");
const force = process.argv.includes("--force");
const secret = process.env.GPAY_RECONCILIATION_SECRET?.trim();

if (!Number.isInteger(orderId) || orderId <= 0) {
  console.error("FAIL: --order-id must be a positive integer.");
  process.exitCode = 1;
} else if (action !== "status" && action !== "process") {
  console.error("FAIL: --action must be status or process.");
  process.exitCode = 1;
} else if (!secret) {
  console.error("FAIL: GPAY_RECONCILIATION_SECRET is required.");
  process.exitCode = 1;
} else {
  console.log(`TARGET=${baseUrl}`);
  console.log(`ORDER_ID=${orderId}`);
  console.log(`ACTION=${action}`);
  console.log(`EXPECT=${expect}`);

  const response = await fetch(`${baseUrl}/api/payments/gpay/reconciliation`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-ysim-reconciliation-secret": secret,
    },
    body: JSON.stringify({ orderId, action, force }),
  });
  const body = await response.json();

  console.log(`HTTP=${response.status}`);
  console.log(JSON.stringify(body, null, 2));

  if (!response.ok || body.success !== true || !body.result) {
    console.error("FAIL: F04.3.2 reconciliation request failed.");
    process.exitCode = 1;
  } else {
    const result = body.result;
    const validExpectations = new Set([
      "any",
      "pending-fulfillment",
      "succeeded",
      "action-required",
    ]);

    if (!validExpectations.has(expect)) {
      console.error("FAIL: unsupported --expect value.");
      process.exitCode = 1;
    } else if (expect !== "any" && result.state !== expect) {
      console.error(`FAIL: Expected ${expect}, received ${result.state}.`);
      process.exitCode = 1;
    } else if (
      result.state === "pending-fulfillment" &&
      !(
        result.providerConfirmed === true &&
        result.result?.paymentRecorded === true &&
        result.result?.fulfillmentAttempted === true &&
        result.result?.fulfillmentSucceeded === null
      )
    ) {
      console.error("FAIL: pending-fulfillment invariants were not met.");
      process.exitCode = 1;
    } else if (
      result.state === "succeeded" &&
      result.automationMode === "fulfill" &&
      result.result?.fulfillmentSucceeded !== true
    ) {
      console.error(
        "FAIL: succeeded fulfill job lacks Delivered confirmation.",
      );
      process.exitCode = 1;
    } else {
      console.log(
        `PASS: F04.3.2 reconciliation state=${result.state} for Woo order ${orderId}.`,
      );
    }
  }
}
