#!/usr/bin/env node
// F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
const arg = (name, fallback = null) => {
  const p = `--${name}=`;
  const f = process.argv.find((v) => v.startsWith(p));
  return f ? f.slice(p.length) : fallback;
};
const required = (name) => {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
};
const positiveInteger = (value, fallback, max) => {
  const p = Number.parseInt(String(value ?? ""), 10);
  return !Number.isInteger(p) || p <= 0 ? fallback : Math.min(p, max);
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
const metaEntry = (order, key) =>
  Array.isArray(order.meta_data)
    ? (order.meta_data.find((i) => i?.key === key) ?? null)
    : null;
const readMeta = (order, key) => {
  const v = metaEntry(order, key)?.value;
  return v == null ? "" : String(v).trim();
};
const norm = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();
const terminalPayment = (o) =>
  Boolean(o?.date_paid || o?.date_paid_gmt) ||
  norm(readMeta(o, "_ysim_payment_status")) === "success";
const terminalFulfillment = (o) => {
  const vals = [
    readMeta(o, "_ysim_gigago_recovery_state"),
    readMeta(o, "_ysim_gigago_auto_result"),
    readMeta(o, "_ysim_gigago_order_status"),
    readMeta(o, "_ysim_esim_delivery_status"),
  ].map(norm);
  return (
    vals.includes("succeeded") ||
    vals.includes("delivered") ||
    vals.includes("completed") ||
    vals.includes("ready")
  );
};
const terminalEvidence = (o) => terminalPayment(o) && terminalFulfillment(o);
const due = (o) => {
  const s = readMeta(o, "_ysim_gpay_reconciliation_state");
  if (!activeStates.has(s)) return false;
  if (terminalEvidence(o)) return true;
  const n = readMeta(o, "_ysim_gpay_reconciliation_next_at");
  if (!n) return true;
  const t = Date.parse(n);
  return Number.isNaN(t) || t <= Date.now();
};
async function readJson(r, label) {
  const t = await r.text();
  try {
    return t ? JSON.parse(t) : null;
  } catch {
    throw new Error(`${label} returned invalid JSON: ${t.slice(0, 300)}`);
  }
}
async function listOrders(page) {
  const u = new URL(`${wooUrl}/wp-json/wc/v3/orders`);
  u.searchParams.set("page", String(page));
  u.searchParams.set("per_page", String(perPage));
  u.searchParams.set("orderby", "date");
  u.searchParams.set("order", "desc");
  const r = await fetch(u, {
    headers: { Accept: "application/json", Authorization: basicAuth },
    cache: "no-store",
  });
  const b = await readJson(r, "WooCommerce order sweep");
  if (!r.ok)
    throw new Error(
      `WooCommerce order sweep failed: HTTP ${r.status} ${JSON.stringify(b)}`,
    );
  if (!Array.isArray(b))
    throw new Error("WooCommerce order sweep response is not an array.");
  return b;
}
const metaPatch = (o, k, v) => {
  const e = metaEntry(o, k);
  return e?.id ? { id: e.id, key: k, value: v } : { key: k, value: v };
};
async function terminalizeOrder(o) {
  const r = await fetch(`${wooUrl}/wp-json/wc/v3/orders/${o.id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: basicAuth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meta_data: [
        metaPatch(o, "_ysim_gpay_reconciliation_state", "succeeded"),
        metaPatch(o, "_ysim_gpay_reconciliation_next_at", ""),
        metaPatch(o, "_ysim_gpay_reconciliation_last_error", ""),
        metaPatch(o, "_ysim_gpay_reconciliation_last_status", "SUCCESS"),
      ],
    }),
  });
  const b = await readJson(r, `WooCommerce terminalization for order ${o.id}`);
  if (!r.ok || !b?.id)
    throw new Error(
      `WooCommerce terminalization failed for order ${o.id}: HTTP ${r.status} ${JSON.stringify(b)}`,
    );
  return { state: "succeeded", nextAttemptAt: null, terminalized: true };
}
async function processOrder(orderId) {
  const r = await fetch(`${baseUrl}/api/payments/gpay/reconciliation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ysim-reconciliation-secret": reconciliationSecret,
    },
    body: JSON.stringify({ action: "process", orderId, force: true }),
  });
  const b = await readJson(r, `Reconciliation process for order ${orderId}`);
  if (!r.ok || !b?.success)
    throw new Error(
      `Reconciliation process failed for order ${orderId}: HTTP ${r.status} ${JSON.stringify(b)}`,
    );
  return b.result;
}
const candidates = [];
let scannedPages = 0;
for (let page = 1; page <= pages && candidates.length < limit; page += 1) {
  const orders = await listOrders(page);
  scannedPages += 1;
  for (const order of orders) {
    if (candidates.length >= limit) break;
    if (Number.isInteger(order?.id) && due(order)) {
      candidates.push({
        order,
        orderId: order.id,
        state: readMeta(order, "_ysim_gpay_reconciliation_state"),
        nextAttemptAt:
          readMeta(order, "_ysim_gpay_reconciliation_next_at") || null,
        action: terminalEvidence(order) ? "terminalize" : "process",
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
      scannedPages,
      candidateCount: candidates.length,
      candidates: candidates.map((candidate) => ({
        orderId: candidate.orderId,
        state: candidate.state,
        nextAttemptAt: candidate.nextAttemptAt,
        action: candidate.action,
      })),
    },
    null,
    2,
  ),
);
if (dryRun) process.exit(0);
let failed = 0;
for (const c of candidates) {
  try {
    const result =
      c.action === "terminalize"
        ? await terminalizeOrder(c.order)
        : await processOrder(c.orderId);
    console.log(
      JSON.stringify({
        orderId: c.orderId,
        action: c.action,
        previousState: c.state,
        state: result?.state ?? null,
        nextAttemptAt: result?.nextAttemptAt ?? null,
        terminalized: result?.terminalized === true,
        success: true,
      }),
    );
  } catch (error) {
    failed += 1;
    console.error(
      JSON.stringify({
        orderId: c.orderId,
        action: c.action,
        success: false,
        message: error instanceof Error ? error.message : "unknown error",
      }),
    );
  }
}
if (failed > 0)
  throw new Error(
    `GPay reconciliation sweep completed with ${failed} failed order(s).`,
  );
console.log("PASS: F06.1B-1 R5 durable reconciliation sweep completed.");
