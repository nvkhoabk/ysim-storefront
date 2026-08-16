#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TERMINAL_STATUSES = new Set([
  "ORDER_SUCCESS",
  "SUCCESS",
  "PAID",
  "ORDER_FAILED",
  "FAILED",
  "ORDER_CANCELLED",
  "ORDER_CANCELED",
  "CANCELLED",
  "CANCELED",
  "ORDER_EXPIRED",
  "EXPIRED",
]);

function parseArguments(argv) {
  const values = {};

  for (const argument of argv) {
    if (!argument.startsWith("--") || !argument.includes("=")) {
      throw new Error(`Invalid argument: ${argument}`);
    }

    const [name, ...parts] = argument.slice(2).split("=");
    values[name] = parts.join("=");
  }

  return values;
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function positiveInteger(value, name) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function normalizeStatus(value) {
  return (
    String(value ?? "")
      .trim()
      .toUpperCase() || "UNKNOWN"
  );
}

async function readJsonResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `HTTP ${response.status} returned non-JSON: ${text.slice(0, 500)}`,
    );
  }
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = await readJsonResponse(response);

  if (!response.ok) {
    const error = new Error(
      body?.error?.message ||
        body?.message ||
        `HTTP ${response.status} from ${url}`,
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function preflight(baseUrl) {
  const webhookUrl = `${baseUrl}/api/payments/gpay/webhook`;
  const returnUrl = `${baseUrl}/checkout/gpay/return`;

  const health = await fetchJson(webhookUrl);
  const returnResponse = await fetch(returnUrl, {
    method: "GET",
    redirect: "manual",
    cache: "no-store",
  });

  const checks = {
    webhookHttpReady:
      health?.service === "YSim GPay webhook" && health?.status === "ready",
    sandboxEnvironment: health?.environment === "sandbox",
    queryReconciliation: health?.reconciliationMode === "query",
    automationDisabled: health?.commerceAutomationMode === "disabled",
    queryRequired: health?.commerceAutomationRequiresQuery === true,
    returnRouteReachable:
      returnResponse.status === 200 ||
      returnResponse.status === 301 ||
      returnResponse.status === 302 ||
      returnResponse.status === 307 ||
      returnResponse.status === 308,
  };

  console.log(
    JSON.stringify(
      {
        webhookUrl,
        returnUrl,
        health,
        checks,
      },
      null,
      2,
    ),
  );

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Preflight failed: ${failed.join(", ")}`);
  }

  console.log("PASS: GPay Gateway T01 preflight is ready.");
}

function wooAuthorizationHeader() {
  const key = requiredEnvironment("WOOCOMMERCE_CONSUMER_KEY");
  const secret = requiredEnvironment("WOOCOMMERCE_CONSUMER_SECRET");

  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function getWooOrder(orderId) {
  const wooBaseUrl = normalizeBaseUrl(
    requiredEnvironment("NEXT_PUBLIC_WOOCOMMERCE_URL"),
  );
  const response = await fetch(
    `${wooBaseUrl}/wp-json/wc/v3/orders/${orderId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: wooAuthorizationHeader(),
      },
      cache: "no-store",
    },
  );
  const body = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      body?.message ||
        `WooCommerce HTTP ${response.status} for order ${orderId}`,
    );
  }

  return body;
}

function validateWooOrder(order) {
  const status = String(order.status ?? "")
    .trim()
    .toLowerCase();
  const currency = String(order.currency ?? "")
    .trim()
    .toUpperCase();
  const amount = Number(order.total);
  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];

  if (!["pending", "on-hold"].includes(status)) {
    throw new Error(
      `Order ${order.id} must be pending or on-hold, received ${order.status}.`,
    );
  }

  if (order.date_paid || order.date_paid_gmt) {
    throw new Error(`Order ${order.id} is already paid.`);
  }

  if (currency !== "VND") {
    throw new Error(`Order ${order.id} currency must be VND.`);
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      `Order ${order.id} total must be a positive integer VND amount.`,
    );
  }

  if (lineItems.length === 0) {
    throw new Error(`Order ${order.id} has no line items.`);
  }

  if (!String(order.order_key ?? "").trim()) {
    throw new Error(`Order ${order.id} has no order_key.`);
  }

  return {
    amount,
    currency,
    lineItemCount: lineItems.length,
  };
}

function sessionFileName(orderId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(
    "artifacts",
    `gpay-gateway-e2e-order-${orderId}-${timestamp}.json`,
  );
}

async function saveSession(filePath, session) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(session, null, 2)}\n`, "utf8");
}

async function loadSession(filePath) {
  const text = await readFile(path.resolve(filePath), "utf8");
  const value = JSON.parse(text);

  if (
    value?.schemaVersion !== "ysim-gpay-gateway-e2e-t01" ||
    !value?.gpayBillId ||
    !value?.merchantOrderId
  ) {
    throw new Error("Invalid T01 session file.");
  }

  return value;
}

async function initPayment(baseUrl, orderId, paymentMethod) {
  const order = await getWooOrder(orderId);
  const validation = validateWooOrder(order);
  const testKey = requiredEnvironment("GPAY_SANDBOX_TEST_API_KEY");
  const requestId = `YSIMT01-${order.id}-${Date.now()}`
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 80);
  const webhookUrl = `${baseUrl}/api/payments/gpay/webhook`;
  const callbackUrl = `${baseUrl}/checkout/gpay/return`;
  const embedData = JSON.stringify({
    source: "ysim-storefront",
    testSuite: "gpay-gateway-e2e-t01",
    orderId: order.id,
    orderNumber: String(order.number),
    orderKey: order.order_key,
    paymentProvider: "gpay_gateway_all",
    merchantOrderId: requestId,
    amount: validation.amount,
    currency: validation.currency,
  });
  const body = {
    requestId,
    amount: validation.amount,
    callbackUrl,
    webhookUrl,
    customerId: String(order.id),
    customerName:
      [order.billing?.first_name, order.billing?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "YSIM SANDBOX CUSTOMER",
    email: order.billing?.email || undefined,
    phone: order.billing?.phone || undefined,
    description: `YSim GPay E2E T01 - Woo order ${order.number}`,
    title: `Thanh toán YSim #${order.number}`,
    embedData,
    paymentType: "IMMEDIATE",
    ...(paymentMethod ? { paymentMethod } : {}),
    forceTokenRefresh: true,
  };
  const response = await fetchJson(
    `${baseUrl}/api/payments/gpay/test-gateway-init-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ysim-test-key": testKey,
      },
      body: JSON.stringify(body),
    },
  );
  const providerOrder = response?.order;

  if (
    !response?.success ||
    !providerOrder?.billId ||
    !providerOrder?.billUrl ||
    !providerOrder?.requestId
  ) {
    throw new Error("GPay init-order response is incomplete.");
  }

  const session = {
    schemaVersion: "ysim-gpay-gateway-e2e-t01",
    createdAt: new Date().toISOString(),
    baseUrl,
    webhookUrl,
    callbackUrl,
    orderId: order.id,
    orderNumber: String(order.number),
    amount: validation.amount,
    currency: validation.currency,
    lineItemCount: validation.lineItemCount,
    merchantOrderId: providerOrder.requestId,
    gpayBillId: providerOrder.billId,
    billUrl: providerOrder.billUrl,
    expiresAt: providerOrder.expiredTime,
    providerCreatedAt: providerOrder.createdAt,
    paymentMethod: paymentMethod || "ALL_ACTIVE_METHODS",
  };
  const filePath = sessionFileName(order.id);

  await saveSession(filePath, session);

  console.log(
    JSON.stringify(
      {
        success: true,
        sessionFile: filePath,
        orderId: session.orderId,
        orderNumber: session.orderNumber,
        amount: session.amount,
        currency: session.currency,
        merchantOrderId: session.merchantOrderId,
        gpayBillId: session.gpayBillId,
        billUrl: session.billUrl,
        expiresAt: session.expiresAt,
        webhookUrl: session.webhookUrl,
        callbackUrl: session.callbackUrl,
      },
      null,
      2,
    ),
  );
  console.log(`SESSION_FILE=${filePath}`);
  console.log(`BILL_URL=${session.billUrl}`);
  console.log("PASS: GPay bill was created. Open BILL_URL to pay.");
}

async function queryPayment(baseUrl, session) {
  const testKey = requiredEnvironment("GPAY_SANDBOX_TEST_API_KEY");
  const response = await fetchJson(
    `${baseUrl}/api/payments/gpay/test-gateway-query-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ysim-test-key": testKey,
      },
      body: JSON.stringify({
        gpayBillId: session.gpayBillId,
        merchantOrderId: session.merchantOrderId,
      }),
    },
  );

  if (!response?.success || !response?.order) {
    throw new Error("GPay query-order response is incomplete.");
  }

  const status = normalizeStatus(response.order.status);

  return {
    queriedAt: new Date().toISOString(),
    status,
    gpayTransactionId: response.order.gpayTransactionId ?? null,
    userPaymentMethod: response.order.userPaymentMethod ?? null,
    embedDataMatches:
      response.order.embedData == null ||
      response.order.embedData.includes(session.merchantOrderId),
    raw: response.order,
  };
}

async function runQuery(baseUrl, sessionFile) {
  const session = await loadSession(sessionFile);
  const query = await queryPayment(baseUrl, session);

  session.lastQuery = query;
  await saveSession(path.resolve(sessionFile), session);

  console.log(JSON.stringify(query, null, 2));
  console.log(`PASS: query-order returned ${query.status}.`);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function watchPayment(
  baseUrl,
  sessionFile,
  intervalSeconds,
  timeoutSeconds,
) {
  const session = await loadSession(sessionFile);
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt <= timeoutSeconds * 1000) {
    attempt += 1;
    const query = await queryPayment(baseUrl, session);

    console.log(
      `[${query.queriedAt}] attempt=${attempt} status=${query.status}`,
    );

    session.lastQuery = query;
    await saveSession(path.resolve(sessionFile), session);

    if (TERMINAL_STATUSES.has(query.status)) {
      console.log(JSON.stringify(query, null, 2));
      console.log(`PASS: terminal GPay status ${query.status}.`);
      return;
    }

    await sleep(intervalSeconds * 1000);
  }

  throw new Error(
    `Timed out after ${timeoutSeconds}s without a terminal GPay status.`,
  );
}

function dateCandidates() {
  const result = [];

  for (let offset = 0; offset <= 1; offset += 1) {
    const date = new Date(Date.now() - offset * 86_400_000);
    result.push(date.toISOString().slice(0, 10));
  }

  return result;
}

async function debugEvidence(sessionFile) {
  const session = await loadSession(sessionFile);
  const logDirectory =
    process.env.GPAY_DEBUG_LOG_DIR?.trim() || "/var/log/ysim/gpay";
  const evidence = [];

  for (const day of dateCandidates()) {
    const filePath = path.join(logDirectory, `gpay-${day}.jsonl`);

    try {
      const text = await readFile(filePath, "utf8");

      for (const line of text.split(/\r?\n/)) {
        if (
          !line ||
          (!line.includes(session.merchantOrderId) &&
            !line.includes(session.gpayBillId))
        ) {
          continue;
        }

        try {
          const entry = JSON.parse(line);
          evidence.push({
            timestamp: entry.timestamp,
            type: entry.type,
            operation: entry.operation,
            requestId: entry.requestId,
            verified: entry.data?.verified,
            normalizedStatus: entry.data?.normalizedStatus,
            reconciliationConfirmed: entry.data?.reconciliationConfirmed,
            reconciliationMode: entry.data?.reconciliationMode,
            commerceAutomationMode: entry.data?.commerceAutomationMode,
            commerceAutomationReason: entry.data?.commerceAutomationReason,
            status: entry.data?.status,
          });
        } catch {
          // Ignore malformed diagnostic lines.
        }
      }
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        logDirectory,
        merchantOrderId: session.merchantOrderId,
        gpayBillId: session.gpayBillId,
        evidence,
      },
      null,
      2,
    ),
  );

  const parsed = evidence.some((item) => item.type === "webhook.parsed");
  const responded = evidence.some((item) => item.type === "webhook.response");

  if (!parsed || !responded) {
    throw new Error(
      "Webhook evidence is incomplete. Confirm GPAY_DEBUG_ENABLED=true and wait for GPay callback.",
    );
  }

  console.log("PASS: GPay webhook parsed and response events were found.");
}

const options = parseArguments(process.argv.slice(2));
const action = options.action || "preflight";
const baseUrl = normalizeBaseUrl(
  options["base-url"] ||
    process.env.GPAY_STOREFRONT_BASE_URL ||
    "https://sandbox.ysim.vn",
);

try {
  if (action === "preflight") {
    await preflight(baseUrl);
  } else if (action === "init") {
    const orderId = positiveInteger(options["order-id"], "--order-id");
    await initPayment(baseUrl, orderId, options["payment-method"]);
  } else if (action === "query") {
    if (!options["session-file"]) {
      throw new Error("--session-file is required.");
    }
    await runQuery(baseUrl, options["session-file"]);
  } else if (action === "watch") {
    if (!options["session-file"]) {
      throw new Error("--session-file is required.");
    }
    await watchPayment(
      baseUrl,
      options["session-file"],
      positiveInteger(options["interval-seconds"] || 5, "--interval-seconds"),
      positiveInteger(options["timeout-seconds"] || 600, "--timeout-seconds"),
    );
  } else if (action === "debug") {
    if (!options["session-file"]) {
      throw new Error("--session-file is required.");
    }
    await debugEvidence(options["session-file"]);
  } else {
    throw new Error(
      "--action must be preflight, init, query, watch, or debug.",
    );
  }
} catch (error) {
  console.error(
    `FAIL: ${error instanceof Error ? error.message : String(error)}`,
  );

  if (error?.body) {
    console.error(JSON.stringify(error.body, null, 2));
  }

  process.exit(1);
}
