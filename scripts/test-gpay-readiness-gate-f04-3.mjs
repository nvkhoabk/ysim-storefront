#!/usr/bin/env node

import { readFile } from "node:fs/promises";

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
const payloadFile = String(readArg("--payload-file", "") ?? "").trim();
const expected = readArg("--expect", "blocked");

if (!baseUrl) {
  console.error("FAIL: --base-url must not be empty.");
  process.exitCode = 1;
} else if (!payloadFile || !["blocked", "created"].includes(expected)) {
  console.error(
    "FAIL: use --payload-file=<json> and --expect=blocked|created.",
  );
  process.exitCode = 1;
} else {
  try {
    console.log(`TARGET=${baseUrl}`);
    console.log(`PAYLOAD_FILE=${payloadFile}`);
    console.log(`EXPECT=${expected}`);

    const payload = JSON.parse(await readFile(payloadFile, "utf8"));
    const response = await fetch(`${baseUrl}/api/payments/create`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

    if (expected === "blocked") {
      const code = body?.code ?? body?.error?.code;
      if (response.status !== 422 || code !== "FULFILLMENT_MAPPING_INVALID") {
        throw new Error(
          "Expected HTTP 422 FULFILLMENT_MAPPING_INVALID before GPay init-order.",
        );
      }
    } else if (!response.ok || !body?.redirectUrl) {
      throw new Error("Expected payment session with redirectUrl.");
    }

    console.log(`PASS: F04.3 payment gate expected=${expected}.`);
  } catch (error) {
    console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
