#!/usr/bin/env node

const arg = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const found = process.argv.find((value) => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const positiveInteger = (value, fallback, max) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
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

const basicAuth = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;

const readMeta = (order, key) => {
  const entry = Array.isArray(order.meta_data)
    ? order.meta_data.find((item) => item?.key === key)
    : null;
  const value = entry?.value;
  return value == null ? "" : String(value).trim();
};

const due = (order) => {
  const state = readMeta(order, "_ysim_gpay_reconciliation_state");
  if (!activeStates.has(state)) return false;

  const nextAt = readMeta(order, "_ysim_gpay_reconciliation_next_at");
  if (!nextAt) return true;

  const timestamp = Date.parse(nextAt);
  return Number.isNaN(timestamp) || timestamp <= Date.now();
};

async function listOrders(page) {
  const url = new URL(`${wooUrl}/wp-json/wc/v3/orders`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: basicAuth,
    },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `WooCommerce order sweep failed: HTTP ${response.status} ${text.slice(0, 300)}`,
    );
  }
  const body = text ? JSON.parse(text) : [];
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
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok || !body?.success) {
    throw new Error(
      `Reconciliation process failed for order ${orderId}: HTTP ${response.status} ${JSON.stringify(body)}`,
    );
  }
  return body.result;
}

const candidates = [];
for (let page = 1; page <= pages && candidates.length < limit; page += 1) {
  const orders = await listOrders(page);
  for (const order of orders) {
    if (candidates.length >= limit) break;
    if (Number.isInteger(order?.id) && due(order)) {
      candidates.push({
        orderId: order.id,
        state: readMeta(order, "_ysim_gpay_reconciliation_state"),
        nextAttemptAt:
          readMeta(order, "_ysim_gpay_reconciliation_next_at") || null,
      });
    }
  }
  if (orders.length < perPage) break;
}

console.log(
  JSON.stringify(
    {
      success: true,
      dryRun,
      scannedPages: pages,
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
        previousState: candidate.state,
        state: result?.state ?? null,
        nextAttemptAt: result?.nextAttemptAt ?? null,
        success: true,
      }),
    );
  } catch (error) {
    failed += 1;
    console.error(
      JSON.stringify({
        orderId: candidate.orderId,
        success: false,
        message: error instanceof Error ? error.message : "unknown error",
      }),
    );
  }
}

if (failed > 0) {
  throw new Error(
    `GPay reconciliation sweep completed with ${failed} failed order(s).`,
  );
}

console.log("PASS: F06.1B-1 durable reconciliation sweep completed.");
