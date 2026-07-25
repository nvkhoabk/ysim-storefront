#!/usr/bin/env node

class CliError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "CliError";
    this.details = details;
  }
}

function parseArgs(argv) {
  return Object.fromEntries(
    argv
      .filter((value) => value.startsWith("--"))
      .map((value) => {
        const [key, ...parts] = value.slice(2).split("=");
        return [key, parts.join("=")];
      }),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const orderId = Number.parseInt(args["order-id"] || "", 10);
  const baseUrl = (
    args["base-url"] ||
    process.env.YSIM_LOCAL_BASE_URL ||
    "http://127.0.0.1:3001"
  ).replace(/\/+$/, "");
  const secret = process.env.GPAY_RECONCILIATION_SECRET?.trim();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new CliError("--order-id must be a positive integer.");
  }

  if (!secret) {
    throw new CliError("GPAY_RECONCILIATION_SECRET is missing.");
  }

  async function operator(action, force = false) {
    const endpoint = `${baseUrl}/api/payments/gpay/reconciliation`;
    let response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-ysim-reconciliation-secret": secret,
        },
        body: JSON.stringify({ orderId, action, force }),
      });
    } catch (error) {
      throw new CliError(
        `${action} could not connect to ${endpoint}.`,
        error instanceof Error ? error.message : String(error),
      );
    }

    const text = await response.text();
    let body;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      throw new CliError(
        `${action} returned non-JSON HTTP ${response.status}.`,
        text.slice(0, 1000),
      );
    }

    if (!response.ok || !body?.success) {
      throw new CliError(`${action} returned HTTP ${response.status}.`, body);
    }

    console.log(`\n=== ${action.toUpperCase()} ===`);
    console.log(JSON.stringify(body, null, 2));

    return body.result;
  }

  const before = await operator("status");

  if (before?.state === "succeeded") {
    console.log(`PASS: Woo order ${orderId} was already recovered.`);
    return;
  }

  if (
    before?.state !== "exhausted" ||
    before?.lastQueriedStatus !== "SUCCESS" ||
    before?.providerConfirmed !== true
  ) {
    throw new CliError(
      "Recovery requires an exhausted job whose provider status is SUCCESS.",
      before,
    );
  }

  const processed = await operator("process", true);

  if (
    processed?.state !== "succeeded" ||
    processed?.result?.paymentRecorded !== true ||
    processed?.lastQueriedStatus !== "SUCCESS"
  ) {
    throw new CliError("Forced commerce recovery did not succeed.", processed);
  }

  const after = await operator("status");

  if (after?.state !== "succeeded") {
    throw new CliError("Recovered state was not persisted.", after);
  }

  console.log(
    `\nPASS: exhausted GPay reconciliation recovered for Woo order ${orderId}.`,
  );
}

main().catch((error) => {
  console.error(
    `FAIL: ${error instanceof Error ? error.message : String(error)}`,
  );

  if (error instanceof CliError && error.details !== undefined) {
    console.error(
      typeof error.details === "string"
        ? error.details
        : JSON.stringify(error.details, null, 2),
    );
  }

  process.exitCode = 1;
});
