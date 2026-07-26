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

if (!baseUrl) {
  console.error("FAIL: --base-url must not be empty.");
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(
      `${baseUrl}/api/fulfillment/gigago/test-readiness`,
      { headers: { Accept: "application/json" } },
    );
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }

    console.log(`TARGET=${baseUrl}`);
    console.log(`HTTP=${response.status}`);
    console.log(JSON.stringify(body, null, 2));

    if (
      !response.ok ||
      body?.contractVersion !== "gigago-readiness-recovery-f04-3-v1"
    ) {
      throw new Error("F04.3 target contract is not compatible.");
    }

    console.log("PASS: F04.3 target preflight is compatible.");
  } catch (error) {
    console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
