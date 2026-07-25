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

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

async function parseJsonResponse(response, operation) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new CliError(
      `${operation} returned non-JSON HTTP ${response.status}.`,
      text.slice(0, 1000),
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const orderId = Number.parseInt(args["order-id"] || "", 10);
  const mode = args.mode || "record";
  const fulfillmentMode = args["fulfillment-mode"] || "demo";
  const includePending = args["include-pending"] !== "false";
  const baseUrl = normalizeBaseUrl(
    args["base-url"] ||
      process.env.YSIM_LOCAL_BASE_URL ||
      "http://localhost:3000",
  );
  const secret = process.env.GIGAGO_TEST_SECRET?.trim();
  const endpoint = `${baseUrl}/api/payments/gpay/test-delayed-reconciliation`;

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new CliError("--order-id must be a positive integer.");
  }

  if (mode !== "record" && mode !== "fulfill") {
    throw new CliError("--mode must be record or fulfill.");
  }

  if (fulfillmentMode !== "demo" && fulfillmentMode !== "live") {
    throw new CliError("--fulfillment-mode must be demo or live.");
  }

  if (mode === "fulfill" && fulfillmentMode === "live") {
    throw new CliError(
      "This protected scenario refuses live fulfillment. Use demo.",
    );
  }

  if (!secret) {
    throw new CliError("GIGAGO_TEST_SECRET is missing.");
  }

  console.log(`TARGET=${baseUrl}`);
  console.log(`ORDER_ID=${orderId}`);
  console.log(`MODE=${mode}`);
  console.log(`FULFILLMENT_MODE=${fulfillmentMode}`);

  let healthResponse;

  try {
    healthResponse = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    throw new CliError(
      `Cannot connect to ${endpoint}. Start the matching Next.js app or pass the correct --base-url.`,
      error instanceof Error ? error.message : String(error),
    );
  }

  const health = await parseJsonResponse(healthResponse, "preflight");
  const requiredActions = ["prepare-on-hold", "enqueue", "process", "status"];
  const actions = Array.isArray(health?.actions) ? health.actions : [];
  const missingActions = requiredActions.filter(
    (action) => !actions.includes(action),
  );

  if (
    !healthResponse.ok ||
    health?.contractVersion !== "gpay-onhold-recovery-f04-2-1-r2" ||
    missingActions.length > 0
  ) {
    throw new CliError(
      [
        "The target does not have the F04.2.1-r2 route deployed.",
        "Do not test a locally patched branch against the older sandbox URL.",
        "Use localhost after `npm run dev`, or deploy/rebuild/restart the sandbox branch first.",
      ].join(" "),
      {
        httpStatus: healthResponse.status,
        expectedContractVersion: "gpay-onhold-recovery-f04-2-1-r2",
        actualContractVersion: health?.contractVersion ?? null,
        service: health?.service ?? null,
        missingActions,
      },
    );
  }

  console.log("PASS: target preflight is compatible.");

  async function call(action, extra = {}) {
    let response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-ysim-test-secret": secret,
        },
        body: JSON.stringify({
          orderId,
          action,
          automationMode: mode,
          fulfillmentMode,
          ...extra,
        }),
      });
    } catch (error) {
      throw new CliError(
        `${action} could not connect to ${endpoint}.`,
        error instanceof Error ? error.message : String(error),
      );
    }

    const body = await parseJsonResponse(response, action);

    if (!response.ok || !body?.success) {
      throw new CliError(`${action} returned HTTP ${response.status}.`, body);
    }

    console.log(`\n=== ${action.toUpperCase()} ===`);
    console.log(JSON.stringify(body, null, 2));

    return body.result;
  }

  const prepared = await call("prepare-on-hold");

  if (
    prepared.status !== "on-hold" ||
    prepared.paid !== false ||
    prepared.datePaidPresent !== false ||
    prepared.lineItemCount < 1
  ) {
    throw new CliError("prepare-on-hold acceptance failed.", prepared);
  }

  const enqueued = await call("enqueue");

  if (
    enqueued.state !== "pending" ||
    enqueued.providerAttempts !== 0 ||
    enqueued.commerceAttempts !== 0 ||
    enqueued.automationMode !== mode
  ) {
    throw new CliError("enqueue acceptance failed.", enqueued);
  }

  if (includePending) {
    const pending = await call("process", {
      providerStatus: "PENDING",
    });

    if (
      pending.state !== "pending" ||
      pending.providerAttempts !== 1 ||
      pending.commerceAttempts !== 0 ||
      pending.lastQueriedStatus !== "PENDING"
    ) {
      throw new CliError("PENDING retry acceptance failed.", pending);
    }
  }

  const succeeded = await call("process", {
    providerStatus: "SUCCESS",
  });
  const expectedProviderAttempts = includePending ? 2 : 1;
  const diagnostic = succeeded.result?.paymentDiagnostic;

  if (
    succeeded.state !== "succeeded" ||
    succeeded.providerConfirmed !== true ||
    succeeded.providerAttempts !== expectedProviderAttempts ||
    succeeded.commerceAttempts !== 1 ||
    succeeded.lastQueriedStatus !== "SUCCESS" ||
    succeeded.result?.paymentRecorded !== true ||
    diagnostic?.pendingBridgeApplied !== true ||
    diagnostic?.confirmedDatePaidPresent !== true ||
    !["processing", "completed"].includes(diagnostic?.confirmedStatus)
  ) {
    throw new CliError("SUCCESS/on-hold bridge acceptance failed.", succeeded);
  }

  if (
    mode === "record" &&
    (succeeded.result.fulfillmentAttempted !== false ||
      succeeded.result.fulfillmentSucceeded !== null)
  ) {
    throw new CliError(
      "record mode unexpectedly attempted fulfillment.",
      succeeded,
    );
  }

  if (
    mode === "fulfill" &&
    (succeeded.result.fulfillmentAttempted !== true ||
      succeeded.result.fulfillmentSucceeded !== true)
  ) {
    throw new CliError("fulfill-demo acceptance failed.", succeeded);
  }

  const repeated = await call("process", {
    providerStatus: "SUCCESS",
  });

  if (
    repeated.state !== "succeeded" ||
    repeated.providerAttempts !== succeeded.providerAttempts ||
    repeated.commerceAttempts !== succeeded.commerceAttempts
  ) {
    throw new CliError("terminal idempotency acceptance failed.", repeated);
  }

  console.log(
    `\nPASS: F04.2.1-r2 on-hold ${mode} scenario completed for Woo order ${orderId}.`,
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
