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

const baseUrlValue = readArg("--base-url", "http://localhost:3000");
const orderIdValue = readArg("--order-id");
const expected = readArg("--expect", "ready");
const secret = process.env.GIGAGO_TEST_SECRET;

const baseUrl = String(baseUrlValue ?? "")
  .trim()
  .replace(/\/$/, "");
const orderId = Number(String(orderIdValue ?? "").trim());

if (!baseUrl) {
  console.error("FAIL: --base-url must not be empty.");
  process.exitCode = 1;
} else if (!Number.isSafeInteger(orderId) || orderId <= 0) {
  console.error(
    `FAIL: --order-id must be a positive integer. Received=${JSON.stringify(orderIdValue)}`,
  );
  process.exitCode = 1;
} else if (!["ready", "blocked"].includes(expected)) {
  console.error("FAIL: --expect must be ready or blocked.");
  process.exitCode = 1;
} else if (!secret) {
  console.error("FAIL: GIGAGO_TEST_SECRET is missing.");
  process.exitCode = 1;
} else {
  try {
    console.log(`TARGET=${baseUrl}`);
    console.log(`ORDER_ID=${orderId}`);
    console.log(`EXPECT=${expected}`);

    const response = await fetch(
      `${baseUrl}/api/fulfillment/gigago/test-readiness`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-ysim-test-secret": secret,
        },
        body: JSON.stringify({ orderId, action: "check", mode: "block" }),
      },
    );

    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }

    console.log(`HTTP=${response.status}`);
    console.log(JSON.stringify(body, null, 2));

    const ready = response.ok && body?.result?.ready === true;
    const blocked = body?.result?.ready === false;

    if (expected === "ready" && !ready) {
      throw new Error("Expected readiness ready.");
    }

    if (expected === "blocked" && !blocked) {
      throw new Error("Expected readiness blocked.");
    }

    console.log(`PASS: F04.3 readiness ${expected} for Woo order ${orderId}.`);
  } catch (error) {
    console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
