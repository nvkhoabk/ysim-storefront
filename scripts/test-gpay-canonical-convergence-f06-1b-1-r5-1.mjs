#!/usr/bin/env node
// F06.1B-1_R5_1_CANONICAL_RECONCILIATION_CONVERGENCE_V1

import { createServer } from "node:http";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceSweep = path.join(
  here,
  "run-gpay-reconciliation-sweep-f06-1b-1.mjs",
);
const tempRoot = await mkdtemp(
  path.join(tmpdir(), "ysim r5 1 canonical test "),
);
const sweep = path.join(tempRoot, "sweep script with spaces.mjs");
await copyFile(sourceSweep, sweep);

const secrets = {
  consumerKey: "ck_R5_1_CONSUMER_KEY_SHOULD_NOT_LEAK",
  consumerSecret: "cs_R5_1_CONSUMER_SECRET_SHOULD_NOT_LEAK",
  reconciliationSecret: "R5_1_RECONCILIATION_SECRET_SHOULD_NOT_LEAK",
};
const basicAuth = `Basic ${Buffer.from(
  `${secrets.consumerKey}:${secrets.consumerSecret}`,
).toString("base64")}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function meta(key, value) {
  return { id: Math.floor(Math.random() * 100000) + 1, key, value };
}

function makeOrder({
  id,
  canonical = undefined,
  flatState = "",
  flatNextAttemptAt = "",
  paymentTerminal = false,
  fulfillmentTerminal = false,
}) {
  const metaData = [];
  if (canonical !== undefined) {
    metaData.push(
      meta(
        "_ysim_gpay_reconciliation_job",
        typeof canonical === "string" ? canonical : JSON.stringify(canonical),
      ),
    );
  }
  if (flatState !== undefined) {
    metaData.push(meta("_ysim_gpay_reconciliation_state", flatState));
  }
  if (flatNextAttemptAt !== undefined) {
    metaData.push(meta("_ysim_gpay_reconciliation_next_at", flatNextAttemptAt));
  }
  if (paymentTerminal) {
    metaData.push(meta("_ysim_payment_status", "SUCCESS"));
  }
  if (fulfillmentTerminal) {
    metaData.push(meta("_ysim_gigago_recovery_state", "succeeded"));
  }

  return {
    id,
    status: paymentTerminal ? "completed" : "pending",
    date_paid: paymentTerminal ? new Date().toISOString() : null,
    date_paid_gmt: paymentTerminal ? new Date().toISOString() : null,
    meta_data: metaData,
  };
}

function parseFirstJson(text) {
  const start = text.indexOf("{");
  if (start < 0) throw new Error(`No JSON object found in output:\n${text}`);

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(text.slice(start, index + 1));
      }
    }
  }
  throw new Error(`Unterminated JSON object in output:\n${text}`);
}

function parseSingleLineJsonObjects(text) {
  const objects = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
    try {
      objects.push(JSON.parse(trimmed));
    } catch {
      // Pretty-printed summary lines are intentionally ignored.
    }
  }
  return objects;
}

async function startMock({
  orders,
  operatorStatus = 200,
  operatorBody = null,
}) {
  const calls = {
    wooGet: 0,
    wooPut: 0,
    operator: 0,
    operatorBodies: [],
  };

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const bodyText = Buffer.concat(chunks).toString("utf8");

    if (request.method === "GET" && url.pathname === "/wp-json/wc/v3/orders") {
      calls.wooGet += 1;
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(orders));
      return;
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/payments/gpay/reconciliation"
    ) {
      calls.operator += 1;
      calls.operatorBodies.push(bodyText ? JSON.parse(bodyText) : null);
      response.writeHead(operatorStatus, {
        "Content-Type": "application/json",
      });
      response.end(
        JSON.stringify(
          operatorBody ?? {
            success: operatorStatus >= 200 && operatorStatus < 300,
            action: "process",
            result: {
              state: "succeeded",
              nextAttemptAt: null,
              providerConfirmed: true,
            },
          },
        ),
      );
      return;
    }

    if (
      request.method === "PUT" &&
      url.pathname.startsWith("/wp-json/wc/v3/orders/")
    ) {
      calls.wooPut += 1;
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: false,
          code: "DIRECT_WOO_PUT_FORBIDDEN_IN_R5_1_TEST",
        }),
      );
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ success: false, code: "NOT_FOUND" }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Mock server did not expose a TCP port.");
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    calls,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function runSweep(origin, { dryRun = false } = {}) {
  const args = [
    sweep,
    `--base-url=${origin}`,
    "--pages=1",
    "--per-page=50",
    "--limit=20",
  ];
  if (dryRun) args.push("--dry-run");

  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: tempRoot,
      shell: false,
      env: {
        ...process.env,
        NEXT_PUBLIC_WOOCOMMERCE_URL: origin,
        WOOCOMMERCE_CONSUMER_KEY: secrets.consumerKey,
        WOOCOMMERCE_CONSUMER_SECRET: secrets.consumerSecret,
        GPAY_RECONCILIATION_SECRET: secrets.reconciliationSecret,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr, combined: `${stdout}\n${stderr}` });
    });
  });
}

function assertNoSecrets(output) {
  for (const secret of [
    secrets.consumerKey,
    secrets.consumerSecret,
    secrets.reconciliationSecret,
    basicAuth,
  ]) {
    assert(
      !output.includes(secret),
      `Sensitive value leaked in output: ${secret}`,
    );
  }
}

async function withMock(config, callback) {
  const mock = await startMock(config);
  try {
    return await callback(mock);
  } finally {
    await mock.close();
  }
}

try {
  const past = new Date(Date.now() - 60_000).toISOString();
  const future = new Date(Date.now() + 3_600_000).toISOString();

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8101,
          canonical: { state: "pending-fulfillment", nextAttemptAt: past },
          flatState: "succeeded",
          flatNextAttemptAt: "",
          paymentTerminal: true,
          fulfillmentTerminal: true,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin, { dryRun: true });
      assert(run.code === 0, `Case A dry-run failed:\n${run.combined}`);
      const summary = parseFirstJson(run.stdout);
      assert(summary.candidateCount === 1, "Case A must select one candidate.");
      assert(
        summary.candidates[0].state === "pending-fulfillment",
        "Case A must use canonical pending state over flat succeeded.",
      );
      assert(
        summary.candidates[0].stateSource === "canonical",
        "Case A must report canonical state source.",
      );
      assert(
        summary.candidates[0].action === "process-terminal-evidence",
        "Case A must use process-terminal-evidence.",
      );
      assert(mock.calls.operator === 0, "Dry-run must not call operator API.");
      assert(
        mock.calls.wooPut === 0,
        "Dry-run must not issue WooCommerce PUT.",
      );
      assertNoSecrets(run.combined);
      console.log("PASS canonical pending overrides flat succeeded");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8102,
          canonical: { state: "pending-fulfillment", nextAttemptAt: past },
          flatState: "succeeded",
          paymentTerminal: true,
          fulfillmentTerminal: true,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin);
      assert(run.code === 0, `Case B live run failed:\n${run.combined}`);
      assert(
        mock.calls.operator === 1,
        "Case B must call operator exactly once.",
      );
      assert(mock.calls.wooPut === 0, "Case B must not issue WooCommerce PUT.");
      assert(
        mock.calls.operatorBodies[0]?.action === "process" &&
          mock.calls.operatorBodies[0]?.force === true,
        "Case B operator request must be action=process and force=true.",
      );
      const resultLines = parseSingleLineJsonObjects(run.stdout);
      const result = resultLines.find((entry) => entry.orderId === 8102);
      assert(result?.state === "succeeded", "Case B must report succeeded.");
      assert(
        result?.terminalized === true,
        "Case B must report terminalized=true.",
      );
      assertNoSecrets(run.combined);
      console.log("PASS terminal evidence uses operator process");
      console.log("PASS no WooCommerce PUT");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8103,
          canonical: { state: "succeeded", nextAttemptAt: null },
          flatState: "succeeded",
          paymentTerminal: true,
          fulfillmentTerminal: true,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin, { dryRun: true });
      assert(run.code === 0, `Case C failed:\n${run.combined}`);
      assert(
        parseFirstJson(run.stdout).candidateCount === 0,
        "Case C must skip succeeded job.",
      );
      assert(mock.calls.wooPut === 0, "Case C must not issue WooCommerce PUT.");
      assertNoSecrets(run.combined);
      console.log("PASS canonical succeeded is skipped");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8104,
          canonical: undefined,
          flatState: "pending",
          flatNextAttemptAt: past,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin);
      assert(run.code === 0, `Case D failed:\n${run.combined}`);
      assert(mock.calls.operator === 1, "Case D must call operator once.");
      assert(mock.calls.wooPut === 0, "Case D must not issue WooCommerce PUT.");
      const summary = parseFirstJson(run.stdout);
      assert(
        summary.candidates[0]?.stateSource === "flat",
        "Case D must fall back to flat state.",
      );
      assert(
        summary.candidates[0]?.action === "process",
        "Case D must use process action.",
      );
      assertNoSecrets(run.combined);
      console.log("PASS missing canonical falls back to flat");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8105,
          canonical: "{invalid-json",
          flatState: "pending-commerce",
          flatNextAttemptAt: past,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin, { dryRun: true });
      assert(run.code === 0, `Case E failed:\n${run.combined}`);
      const summary = parseFirstJson(run.stdout);
      assert(
        summary.candidateCount === 1,
        "Case E must select flat fallback candidate.",
      );
      assert(
        summary.candidates[0]?.stateSource === "flat",
        "Case E must safely fall back to flat.",
      );
      assert(mock.calls.wooPut === 0, "Case E must not issue WooCommerce PUT.");
      assertNoSecrets(run.combined);
      console.log("PASS invalid canonical falls back safely");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8106,
          canonical: { state: "pending-fulfillment", nextAttemptAt: future },
          flatState: "pending-fulfillment",
          flatNextAttemptAt: past,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin, { dryRun: true });
      assert(run.code === 0, `Case F failed:\n${run.combined}`);
      assert(
        parseFirstJson(run.stdout).candidateCount === 0,
        "Case F must respect canonical future nextAttemptAt.",
      );
      assert(mock.calls.wooPut === 0, "Case F must not issue WooCommerce PUT.");
      assertNoSecrets(run.combined);
      console.log("PASS future canonical nextAttemptAt is respected");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8107,
          canonical: { state: "pending-fulfillment", nextAttemptAt: future },
          flatState: "pending-fulfillment",
          flatNextAttemptAt: future,
          paymentTerminal: true,
          fulfillmentTerminal: true,
        }),
      ],
    },
    async (mock) => {
      const run = await runSweep(mock.origin, { dryRun: true });
      assert(run.code === 0, `Case G failed:\n${run.combined}`);
      const summary = parseFirstJson(run.stdout);
      assert(
        summary.candidateCount === 1,
        "Case G terminal evidence must override future schedule.",
      );
      assert(
        summary.candidates[0]?.action === "process-terminal-evidence",
        "Case G must use process-terminal-evidence.",
      );
      assert(mock.calls.wooPut === 0, "Case G must not issue WooCommerce PUT.");
      assertNoSecrets(run.combined);
      console.log("PASS terminal evidence forces convergence");
    },
  );

  await withMock(
    {
      orders: [
        makeOrder({
          id: 8108,
          canonical: { state: "pending", nextAttemptAt: past },
          flatState: "pending",
        }),
      ],
      operatorStatus: 500,
      operatorBody: {
        success: false,
        code: "MOCK_OPERATOR_FAILURE",
        message: `Failure without leaking ${secrets.reconciliationSecret}`,
      },
    },
    async (mock) => {
      const run = await runSweep(mock.origin);
      assert(run.code !== 0, "Case H must exit non-zero on operator failure.");
      assert(mock.calls.operator === 1, "Case H must call operator once.");
      assert(mock.calls.wooPut === 0, "Case H must not issue WooCommerce PUT.");
      assert(
        run.combined.includes("8108"),
        "Case H must report affected order.",
      );
      assert(
        run.combined.includes("MOCK_OPERATOR_FAILURE"),
        "Case H must report safe error code.",
      );
      assertNoSecrets(run.combined);
      console.log("PASS operator failure exits non-zero");
    },
  );

  console.log("PASS secrets are not exposed");
  console.log(`PASS paths with spaces via process.execPath: ${sweep}`);
  console.log(
    `PASS cross-platform Node execution contract: platform=${process.platform}`,
  );
  console.log("PASS: F06.1B-1 R5.1 canonical convergence contract.");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
