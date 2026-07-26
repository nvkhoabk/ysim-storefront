#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";

function argument(name, fallback = null) {
  const prefix = `${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));

  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(name);

  return index >= 0 && index + 1 < process.argv.length
    ? process.argv[index + 1]
    : fallback;
}

function positiveInteger(value) {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return parsed > 0 ? parsed : null;
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return { response, body };
}

function stateMatches(actual, expected) {
  if (expected === "any") {
    return true;
  }

  if (expected === "pending-or-succeeded") {
    return actual === "pending-fulfillment" || actual === "succeeded";
  }

  return actual === expected;
}

const baseUrl = argument("--base-url", "http://localhost:3000").replace(
  /\/$/,
  "",
);
const action = argument("--action", "preflight");
const orderId = positiveInteger(argument("--order-id"));
const fulfillmentMode = argument("--fulfillment-mode", "demo");
const expected = argument("--expect", "any");
const endpoint = `${baseUrl}/api/payments/gpay/test-immediate-success-durability`;

console.log(`TARGET=${baseUrl}`);
console.log(`ACTION=${action}`);
console.log(`EXPECT=${expected}`);

if (action === "preflight") {
  const { response, body } = await requestJson(endpoint);

  console.log(`HTTP=${response.status}`);
  console.log(JSON.stringify(body, null, 2));

  if (
    !response.ok ||
    body?.contractVersion !== "gpay-immediate-success-durability-f04-3-3-1-v1"
  ) {
    throw new Error("F04.3.3.1 preflight failed.");
  }

  console.log("PASS: F04.3.3.1 target preflight is compatible.");
  process.exit(0);
}

if (!orderId) {
  throw new Error("--order-id must be a positive integer.");
}

console.log(`ORDER_ID=${orderId}`);

const headers = {
  "content-type": "application/json",
  "x-ysim-test-secret": requiredEnvironment("GIGAGO_TEST_SECRET"),
};
const body = {
  orderId,
  action,
  fulfillmentMode,
};
let before = null;

if (action === "process") {
  const statusResponse = await requestJson(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ orderId, action: "status" }),
  });
  before = statusResponse.body?.result ?? null;
}

const { response, body: resultBody } = await requestJson(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify(body),
});

console.log(`HTTP=${response.status}`);
console.log(JSON.stringify(resultBody, null, 2));

if (!response.ok || resultBody?.success !== true) {
  throw new Error(
    resultBody?.message ||
      `F04.3.3.1 action failed with HTTP ${response.status}.`,
  );
}

if (action === "prepare-on-hold") {
  if (resultBody.result?.status !== "on-hold") {
    throw new Error("Expected Woo order status on-hold.");
  }

  console.log(`PASS: F04.3.3.1 prepared Woo order ${orderId}.`);
  process.exit(0);
}

const durability =
  action === "simulate" ? resultBody.result?.durability : resultBody.result;
const actualState = durability?.state ?? null;

if (!stateMatches(actualState, expected)) {
  throw new Error(`Expected ${expected}, received ${actualState}.`);
}

if (action === "simulate") {
  const automation = resultBody.result?.automation;

  if (
    automation?.paymentRecorded !== true ||
    durability?.providerConfirmed !== true ||
    durability?.providerAttempts !== 1 ||
    durability?.commerceAttempts !== 1
  ) {
    throw new Error("Immediate-success durable job counters are invalid.");
  }

  if (
    actualState === "pending-fulfillment" &&
    (automation.fulfillmentSucceeded !== null ||
      durability.fulfillmentPollAttempts !== 1 ||
      !durability.nextAttemptAt)
  ) {
    throw new Error("Pending fulfillment durability state is invalid.");
  }
}

if (action === "process" && before) {
  if (durability.providerAttempts !== before.providerAttempts) {
    throw new Error("Provider attempts changed during fulfillment-only poll.");
  }

  if (
    before.state === "pending-fulfillment" &&
    durability.commerceAttempts !== before.commerceAttempts
  ) {
    throw new Error("Commerce attempts changed during fulfillment-only poll.");
  }
}

console.log(
  `PASS: F04.3.3.1 action=${action} state=${actualState} for Woo order ${orderId}.`,
);
