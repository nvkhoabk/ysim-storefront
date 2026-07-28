#!/usr/bin/env node

const arg = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const found = process.argv.find((value) => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const baseUrl = (arg("base-url", "http://localhost:3000") || "").replace(
  /\/$/,
  "",
);
const orderIdValue = arg("order-id", "");
const orderId = /^\d+$/.test(orderIdValue)
  ? Number.parseInt(orderIdValue, 10)
  : null;

const healthResponse = await fetch(`${baseUrl}/api/payments/gpay/webhook`, {
  headers: { Accept: "application/json" },
  cache: "no-store",
});
const health = await healthResponse.json();
assert(
  healthResponse.ok,
  `Webhook health failed: HTTP ${healthResponse.status}`,
);
assert(
  health.unifiedWebhookDispatch === true,
  "Unified webhook dispatch is not enabled.",
);
assert(
  health.fastAck?.version === "f06.1b.1-v1",
  "F06.1B-1 fast ACK health marker is missing.",
);
assert(
  typeof health.fastAck?.enabled === "boolean",
  "Fast ACK enabled flag is missing.",
);
console.log(`PASS webhook health: fastAck.enabled=${health.fastAck.enabled}`);

if (orderId) {
  const secret = process.env.GPAY_RECONCILIATION_SECRET?.trim();
  assert(secret, "GPAY_RECONCILIATION_SECRET is required with --order-id.");
  const response = await fetch(`${baseUrl}/api/payments/gpay/reconciliation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ysim-reconciliation-secret": secret,
    },
    body: JSON.stringify({ action: "status", orderId }),
  });
  const body = await response.json();
  assert(
    response.ok && body.success,
    `Durability status failed: HTTP ${response.status} ${JSON.stringify(body)}`,
  );
  assert(body.result, `Order ${orderId} has no durable reconciliation job.`);
  console.log(
    JSON.stringify(
      {
        orderId,
        state: body.result.state,
        automationMode: body.result.automationMode,
        providerConfirmed: body.result.providerConfirmed,
        nextAttemptAt: body.result.nextAttemptAt,
      },
      null,
      2,
    ),
  );
}

console.log("PASS: F06.1B-1 fast ACK health and durability contract.");
