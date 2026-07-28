#!/usr/bin/env node
// F06.1B-1_R5_1_CANONICAL_RECONCILIATION_CONVERGENCE_V1

const arg = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const found = process.argv.find((value) => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const positiveInteger = (value, fallback, max) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return !Number.isInteger(parsed) || parsed <= 0
    ? fallback
    : Math.min(parsed, max);
};

const baseUrl = (
  arg("base-url", process.env.GPAY_RECONCILIATION_BASE_URL) ||
  "http://127.0.0.1:3001"
).replace(/\/$/, "");
const wooUrl = required("NEXT_PUBLIC_WOOCOMMERCE_URL").replace(/\/$/, "");
const consumerKey = required("WOOCOMMERCE_CONSUMER_KEY");
const consumerSecret = required("WOOCOMMERCE_CONSUMER_SECRET");
const reconciliationSecret = required("GPAY_RECONCILIATION_SECRET");
const pages = positiveInteger(
  arg("pages", process.env.GPAY_RECONCILIATION_SWEEP_PAGES),
  3,
  20,
);
const perPage = positiveInteger(
  arg("per-page", process.env.GPAY_RECONCILIATION_SWEEP_PER_PAGE),
  50,
  100,
);
const limit = positiveInteger(
  arg("limit", process.env.GPAY_RECONCILIATION_SWEEP_LIMIT),
  20,
  100,
);
const dryRun = process.argv.includes("--dry-run");

const activeStates = new Set([
  "pending",
  "processing",
  "provider-confirmed",
  "pending-commerce",
  "pending-fulfillment",
]);
const knownStates = new Set([
  ...activeStates,
  "action-required",
  "succeeded",
  "failed",
  "mismatch",
  "exhausted",
]);
const basicAuth = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
const sensitiveValues = [
  consumerKey,
  consumerSecret,
  reconciliationSecret,
  basicAuth,
].filter(Boolean);

const redact = (value) => {
  let output = String(value ?? "");
  for (const secret of sensitiveValues) {
    output = output.split(secret).join("[REDACTED]");
  }
  return output;
};

const metaEntry = (order, key) =>
  Array.isArray(order.meta_data)
    ? (order.meta_data.find((item) => item?.key === key) ?? null)
    : null;

const metaValue = (order, key) => metaEntry(order, key)?.value;

const readMeta = (order, key) => {
  const value = metaValue(order, key);
  return value == null ? "" : String(value).trim();
};

const norm = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const parseCanonicalJob = (order) => {
  const raw = metaValue(order, "_ysim_gpay_reconciliation_job");
  if (raw == null || raw === "") return null;

  let parsed;
  try {
    if (typeof raw === "string") {
      parsed = JSON.parse(raw);
    } else if (typeof raw === "object" && !Array.isArray(raw)) {
      parsed = raw;
    } else {
      return null;
    }
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const state = norm(parsed.state);
  if (!knownStates.has(state)) return null;

  const hasNextAttemptAt = Object.prototype.hasOwnProperty.call(
    parsed,
    "nextAttemptAt",
  );
  const rawNextAttemptAt = hasNextAttemptAt ? parsed.nextAttemptAt : undefined;
  const nextAttemptAt =
    rawNextAttemptAt == null || String(rawNextAttemptAt).trim() === ""
      ? null
      : String(rawNextAttemptAt).trim();

  return {
    state,
    hasNextAttemptAt,
    nextAttemptAt,
  };
};

const reconciliationView = (order) => {
  const canonical = parseCanonicalJob(order);
  const flatState = norm(readMeta(order, "_ysim_gpay_reconciliation_state"));
  const flatNextAttemptAt =
    readMeta(order, "_ysim_gpay_reconciliation_next_at") || null;

  return {
    state: canonical?.state ?? flatState,
    nextAttemptAt:
      canonical?.hasNextAttemptAt === true
        ? canonical.nextAttemptAt
        : flatNextAttemptAt,
    source: canonical ? "canonical" : "flat",
  };
};

const terminalPayment = (order) =>
  Boolean(order?.date_paid || order?.date_paid_gmt) ||
  norm(readMeta(order, "_ysim_payment_status")) === "success";

const terminalFulfillment = (order) => {
  const values = [
    readMeta(order, "_ysim_gigago_recovery_state"),
    readMeta(order, "_ysim_gigago_auto_result"),
    readMeta(order, "_ysim_gigago_order_status"),
    readMeta(order, "_ysim_esim_delivery_status"),
  ].map(norm);

  return (
    values.includes("succeeded") ||
    values.includes("delivered") ||
    values.includes("completed") ||
    values.includes("ready")
  );
};

const terminalEvidence = (order) =>
  terminalPayment(order) && terminalFulfillment(order);

const due = (order, view) => {
  if (!activeStates.has(view.state)) return false;
  if (terminalEvidence(order)) return true;
  if (!view.nextAttemptAt) return true;

  const timestamp = Date.parse(view.nextAttemptAt);
  return Number.isNaN(timestamp) || timestamp <= Date.now();
};

const responseSummary = (body) => {
  if (!body || typeof body !== "object") return redact(body);
  const summary = {};
  for (const key of ["code", "message", "error", "status"]) {
    if (typeof body[key] === "string" || typeof body[key] === "number") {
      summary[key] = body[key];
    }
  }
  return redact(
    Object.keys(summary).length > 0
      ? JSON.stringify(summary)
      : JSON.stringify(body).slice(0, 300),
  );
};

async function readJson(response, label) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `${label} returned invalid JSON: ${redact(text.slice(0, 300))}`,
    );
  }
}

async function listOrders(page) {
  const url = new URL(`${wooUrl}/wp-json/wc/v3/orders`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");

  const response = await fetch(url, {
    headers: { Accept: "application/json", Authorization: basicAuth },
    cache: "no-store",
  });
  const body = await readJson(response, "WooCommerce order sweep");
  if (!response.ok) {
    throw new Error(
      `WooCommerce order sweep failed: HTTP ${response.status} ${responseSummary(body)}`,
    );
  }
  if (!Array.isArray(body)) {
    throw new Error("WooCommerce order sweep response is not an array.");
  }
  return body;
}

async function processOrder(orderId) {
  const response = await fetch(`${baseUrl}/api/payments/gpay/reconciliation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ysim-reconciliation-secret": reconciliationSecret,
    },
    body: JSON.stringify({ action: "process", orderId, force: true }),
  });
  const body = await readJson(
    response,
    `Reconciliation process for order ${orderId}`,
  );
  if (!response.ok || !body?.success) {
    throw new Error(
      `Reconciliation process failed for order ${orderId}: HTTP ${response.status} ${responseSummary(body)}`,
    );
  }
  return body.result;
}

const candidates = [];
let scannedPages = 0;

for (let page = 1; page <= pages && candidates.length < limit; page += 1) {
  const orders = await listOrders(page);
  scannedPages += 1;

  for (const order of orders) {
    if (candidates.length >= limit) break;
    if (!Number.isInteger(order?.id)) continue;

    const view = reconciliationView(order);
    if (!due(order, view)) continue;

    candidates.push({
      orderId: order.id,
      state: view.state,
      nextAttemptAt: view.nextAttemptAt,
      stateSource: view.source,
      action: terminalEvidence(order) ? "process-terminal-evidence" : "process",
    });
  }

  if (orders.length < perPage) break;
}

console.log(
  JSON.stringify(
    {
      success: true,
      dryRun,
      scannedPages,
      candidateCount: candidates.length,
      candidates,
    },
    null,
    2,
  ),
);

if (dryRun) process.exit(0);

let failed = 0;
for (const candidate of candidates) {
  try {
    const result = await processOrder(candidate.orderId);
    console.log(
      JSON.stringify({
        orderId: candidate.orderId,
        action: candidate.action,
        previousState: candidate.state,
        state: result?.state ?? null,
        nextAttemptAt: result?.nextAttemptAt ?? null,
        terminalized:
          candidate.action === "process-terminal-evidence" &&
          result?.state === "succeeded",
        success: true,
      }),
    );
  } catch (error) {
    failed += 1;
    console.error(
      JSON.stringify({
        orderId: candidate.orderId,
        action: candidate.action,
        success: false,
        message: redact(
          error instanceof Error ? error.message : "unknown error",
        ),
      }),
    );
  }
}

if (failed > 0) {
  throw new Error(
    `GPay reconciliation sweep completed with ${failed} failed order(s).`,
  );
}

console.log(
  "PASS: F06.1B-1 R5.1 canonical reconciliation convergence sweep completed.",
);
