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
  const baseUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL?.replace(/\/$/, "");
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new CliError("--order-id must be a positive integer.");
  }

  if (!baseUrl || !key || !secret) {
    throw new CliError("WooCommerce environment variables are missing.");
  }

  const authorization = `Basic ${Buffer.from(`${key}:${secret}`).toString(
    "base64",
  )}`;
  let response;

  try {
    response = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new CliError(
      `Cannot connect to WooCommerce at ${baseUrl}.`,
      error instanceof Error ? error.message : String(error),
    );
  }

  const text = await response.text();
  let order;

  try {
    order = text ? JSON.parse(text) : null;
  } catch {
    throw new CliError(
      `WooCommerce returned non-JSON HTTP ${response.status}.`,
      text.slice(0, 1000),
    );
  }

  if (!response.ok) {
    throw new CliError(`WooCommerce returned HTTP ${response.status}.`, order);
  }

  const safeKeys = new Set([
    "_ysim_payment_provider",
    "_ysim_payment_status",
    "_ysim_gpay_automation_mode",
    "_ysim_gpay_automation_source",
    "_ysim_gpay_reconciliation_state",
    "_ysim_gpay_reconciliation_attempts",
    "_ysim_gpay_reconciliation_last_status",
    "_ysim_gpay_reconciliation_last_error",
  ]);
  const metadata = Object.fromEntries(
    (order.meta_data ?? [])
      .filter((item) => safeKeys.has(item.key))
      .map((item) => [item.key, item.value]),
  );
  const summary = {
    id: order.id,
    number: order.number,
    status: order.status,
    currency: order.currency,
    total: order.total,
    lineItemCount: order.line_items?.length ?? 0,
    datePaidPresent: Boolean(order.date_paid || order.date_paid_gmt),
    transactionIdPresent: Boolean(order.transaction_id),
    paymentMethod: order.payment_method,
    paymentMethodTitle: order.payment_method_title,
    metadata,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (
    args["expect-paid"] === "true" &&
    (!summary.datePaidPresent ||
      !["processing", "completed"].includes(summary.status))
  ) {
    throw new CliError("Expected a paid processing/completed order.", summary);
  }

  if (
    args["expect-unpaid-on-hold"] === "true" &&
    (summary.datePaidPresent || summary.status !== "on-hold")
  ) {
    throw new CliError("Expected an unpaid on-hold order.", summary);
  }

  console.log(`PASS: Woo order ${orderId} inspection completed.`);
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
