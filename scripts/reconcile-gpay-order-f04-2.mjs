#!/usr/bin/env node

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((value) => value.startsWith("--"))
    .map((value) => {
      const [key, ...parts] = value.slice(2).split("=");
      return [key, parts.join("=")];
    }),
);

const orderId = Number.parseInt(args["order-id"] || "", 10);
const action = args.action || "status";
const baseUrl = (
  args["base-url"] ||
  process.env.YSIM_LOCAL_BASE_URL ||
  "http://127.0.0.1:3001"
).replace(/\/+$/, "");
const secret = process.env.GPAY_RECONCILIATION_SECRET?.trim();

if (!Number.isInteger(orderId) || orderId <= 0) {
  console.error("FAIL: --order-id must be a positive integer.");
  process.exit(1);
}

if (!secret) {
  console.error("FAIL: GPAY_RECONCILIATION_SECRET is missing.");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/payments/gpay/reconciliation`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-ysim-reconciliation-secret": secret,
  },
  body: JSON.stringify({
    orderId,
    action,
    force: args.force === "true",
  }),
});
const body = await response.json();

console.log(JSON.stringify(body, null, 2));

if (!response.ok || !body?.success) {
  console.error(
    `FAIL: reconciliation operator returned HTTP ${response.status}.`,
  );
  process.exit(2);
}

console.log(
  `PASS: reconciliation ${action} completed for Woo order ${orderId}.`,
);
