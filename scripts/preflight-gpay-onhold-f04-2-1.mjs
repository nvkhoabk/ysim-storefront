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

async function readJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new CliError(
      `Preflight returned non-JSON HTTP ${response.status}.`,
      text.slice(0, 1000),
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = normalizeBaseUrl(
    args["base-url"] ||
      process.env.YSIM_LOCAL_BASE_URL ||
      "http://localhost:3000",
  );
  const endpoint = `${baseUrl}/api/payments/gpay/test-delayed-reconciliation`;

  console.log(`TARGET=${baseUrl}`);

  let response;

  try {
    response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    throw new CliError(
      `Cannot connect to ${endpoint}. Start the matching Next.js app or pass the correct --base-url.`,
      error instanceof Error ? error.message : String(error),
    );
  }

  const body = await readJson(response);

  if (!response.ok) {
    throw new CliError(`Preflight returned HTTP ${response.status}.`, body);
  }

  const requiredActions = ["prepare-on-hold", "enqueue", "process", "status"];
  const actions = Array.isArray(body?.actions) ? body.actions : [];
  const missingActions = requiredActions.filter(
    (action) => !actions.includes(action),
  );
  const compatible =
    body?.contractVersion === "gpay-onhold-recovery-f04-2-1-r2" &&
    missingActions.length === 0;

  console.log(JSON.stringify(body, null, 2));

  if (!compatible) {
    throw new CliError(
      [
        "Target server is not running the F04.2.1-r2 test route.",
        "You probably applied the package on the dev machine but called the older sandbox deployment.",
        "For local testing: run `npm run dev` and use `--base-url=http://localhost:3000`.",
        "For sandbox testing: commit, push, deploy the branch, rebuild/restart PM2, then use `--base-url=https://sandbox.ysim.vn`.",
      ].join(" "),
      {
        expectedContractVersion: "gpay-onhold-recovery-f04-2-1-r2",
        actualContractVersion: body?.contractVersion ?? null,
        missingActions,
      },
    );
  }

  console.log("PASS: F04.2.1-r2 target preflight is compatible.");
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
