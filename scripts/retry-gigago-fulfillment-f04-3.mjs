#!/usr/bin/env node

const args = process.argv.slice(2);

function readArg(name, fallback = null) {
  const prefix = `${name}=`;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === name) {
      const next = args[index + 1];
      return next && !next.startsWith("--") ? next : "";
    }

    if (argument.startsWith(prefix)) {
      const inlineValue = argument.slice(prefix.length);
      if (inlineValue) return inlineValue;

      const next = args[index + 1];
      return next && !next.startsWith("--") ? next : "";
    }
  }

  return fallback;
}

const baseUrl = String(readArg("--base-url", "http://localhost:3000") ?? "")
  .trim()
  .replace(/\/$/, "");
const orderIdValue = readArg("--order-id");
const orderId = Number(String(orderIdValue ?? "").trim());
const mode = readArg("--mode", "live");
const action = readArg("--action", "retry-fulfillment");
const secret = process.env.GIGAGO_TEST_SECRET;

if (!baseUrl) {
  console.error("FAIL: --base-url must not be empty.");
  process.exitCode = 1;
} else if (!Number.isSafeInteger(orderId) || orderId <= 0) {
  console.error(
    `FAIL: --order-id must be a positive integer. Received=${JSON.stringify(orderIdValue)}`,
  );
  process.exitCode = 1;
} else if (!["live", "demo"].includes(mode)) {
  console.error("FAIL: --mode must be live or demo.");
  process.exitCode = 1;
} else if (!["status", "lifecycle", "retry-fulfillment"].includes(action)) {
  console.error(
    "FAIL: --action must be status, lifecycle, or retry-fulfillment.",
  );
  process.exitCode = 1;
} else if (!secret) {
  console.error("FAIL: GIGAGO_TEST_SECRET is missing.");
  process.exitCode = 1;
} else {
  try {
    console.log(`TARGET=${baseUrl}`);
    console.log(`ORDER_ID=${orderId}`);
    console.log(`ACTION=${action}`);
    console.log(`MODE=${mode}`);

    const response = await fetch(`${baseUrl}/api/fulfillment/gigago/recovery`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-ysim-test-secret": secret,
      },
      body: JSON.stringify({ orderId, action, mode }),
    });

    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }

    console.log(`HTTP=${response.status}`);
    console.log(JSON.stringify(body, null, 2));

    if (!response.ok || body?.success !== true) {
      throw new Error(body?.message || `HTTP ${response.status}`);
    }

    console.log(`PASS: F04.3 ${action} completed for Woo order ${orderId}.`);
  } catch (error) {
    console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
