import type {
  GPayCallbackReconciliationResult,
  GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";
import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";

import {
  submitGigagoFulfillment,
  type GigagoFulfillmentMode,
  type GigagoFulfillmentSubmission,
} from "./gigago-fulfillment-service";

export type GPayCommerceAutomationMode = "disabled" | "record" | "fulfill";

export interface GPayCommerceAutomationOptions {
  modeOverride?: GPayCommerceAutomationMode;
  fulfillmentModeOverride?: GigagoFulfillmentMode;
  source?: "gpay-webhook" | "protected-test";
}

export interface GPayCommerceAutomationResult {
  mode: GPayCommerceAutomationMode;
  attempted: boolean;
  paymentRecorded: boolean;
  commerceStateChanged: boolean;
  fulfillmentAttempted: boolean;
  fulfillmentSucceeded: boolean | null;
  duplicatePaymentEvent: boolean;
  orderId: number | null;
  reason: string;
  fulfillment?: GigagoFulfillmentSubmission;
  fulfillmentError?: {
    name: string;
    message: string;
  };
}

interface GPayEmbedData {
  source: string;
  orderId: number;
  orderNumber: string;
  orderKey: string;
  paymentProvider: string;
  merchantOrderId: string;
  amount: number;
  currency: string;
}

const PAYMENT_META = {
  provider: "_ysim_payment_provider",
  status: "_ysim_payment_status",
  merchantTransactionId: "_ysim_merchant_transaction_id",
  providerTransactionId: "_ysim_provider_transaction_id",
  gpayBillId: "_ysim_gpay_bill_id",
  callbackSha256: "_ysim_gpay_callback_sha256",
  paidAt: "_ysim_gpay_paid_at",
  automationMode: "_ysim_gpay_automation_mode",
  reconciliationReason: "_ysim_gpay_reconciliation_reason",
  automationSource: "_ysim_gpay_automation_source",
  fulfillmentAttemptedAt: "_ysim_gigago_auto_attempted_at",
  fulfillmentResult: "_ysim_gigago_auto_result",
  fulfillmentError: "_ysim_gigago_auto_error",
} as const;

const DEFAULT_ALLOWED_ORDER_STATUSES = [
  "pending",
  "on-hold",
  "processing",
  "completed",
] as const;

const inFlight = new Map<number, Promise<GPayCommerceAutomationResult>>();

function configuredMode(): GPayCommerceAutomationMode {
  const value = process.env.GPAY_COMMERCE_AUTOMATION_MODE?.trim().toLowerCase();

  if (value === "record" || value === "fulfill") {
    return value;
  }

  return "disabled";
}

export function getGPayCommerceAutomationMode(): GPayCommerceAutomationMode {
  return configuredMode();
}

function queryConfirmationRequired(): boolean {
  return (
    process.env.GPAY_COMMERCE_AUTOMATION_REQUIRE_QUERY?.trim().toLowerCase() !==
    "false"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);

    return parsed > 0 ? parsed : null;
  }

  return null;
}

function allowedOrderStatuses(): Set<string> {
  const configured = process.env.GPAY_COMMERCE_ALLOWED_ORDER_STATUSES?.trim();
  const values = configured
    ? configured
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : [...DEFAULT_ALLOWED_ORDER_STATUSES];

  return new Set(values);
}

function parseWooVndTotal(value: string): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function isWooCommerceOrderPaid(order: WooCommerceAdminOrder): boolean {
  return (
    Boolean(order.date_paid) ||
    Boolean(order.date_paid_gmt) ||
    order.status === "processing" ||
    order.status === "completed"
  );
}

export function assertGPayCommerceOrderEligible(
  order: WooCommerceAdminOrder,
  expectation: {
    amount: number;
    currency: string;
    requireLineItems?: boolean;
  },
): void {
  const status = order.status.trim().toLowerCase();

  if (!allowedOrderStatuses().has(status)) {
    throw new Error(
      `WooCommerce order trạng thái ${order.status} không được phép tự động ghi nhận payment.`,
    );
  }

  const currency = order.currency.trim().toUpperCase();
  const expectedCurrency = expectation.currency.trim().toUpperCase();
  const wooTotal = parseWooVndTotal(order.total);

  if (currency !== "VND" || expectedCurrency !== "VND") {
    throw new Error("GPay commerce automation chỉ chấp nhận Woo order VND.");
  }

  if (!wooTotal) {
    throw new Error(
      "WooCommerce order phải có tổng tiền VND nguyên lớn hơn 0.",
    );
  }

  if (
    !Number.isInteger(expectation.amount) ||
    expectation.amount <= 0 ||
    expectation.amount !== wooTotal
  ) {
    throw new Error(
      `Số tiền GPay ${expectation.amount} không khớp Woo order ${wooTotal}.`,
    );
  }

  if (
    expectation.requireLineItems !== false &&
    (!Array.isArray(order.line_items) || order.line_items.length === 0)
  ) {
    throw new Error(
      "WooCommerce order phải có ít nhất một line item trước fulfillment.",
    );
  }
}

function parseEmbedData(
  verification: GPayGatewayCallbackVerification,
): GPayEmbedData {
  const value = verification.parsedEmbedData;

  if (!isRecord(value)) {
    throw new Error("GPay embed_data không phải object hợp lệ.");
  }

  const orderId = parsePositiveInteger(value.orderId);
  const orderNumber = cleanString(value.orderNumber);
  const orderKey = cleanString(value.orderKey);
  const paymentProvider = cleanString(value.paymentProvider);
  const merchantOrderId = cleanString(value.merchantOrderId);
  const amount = parsePositiveInteger(value.amount);
  const currency = cleanString(value.currency)?.toUpperCase() ?? null;
  const source = cleanString(value.source);

  if (
    !orderId ||
    !orderNumber ||
    !orderKey ||
    !paymentProvider ||
    !merchantOrderId ||
    !amount ||
    !currency ||
    source !== "ysim-storefront"
  ) {
    throw new Error("GPay embed_data thiếu định danh WooCommerce bắt buộc.");
  }

  if (merchantOrderId !== verification.callback.merchantOrderId) {
    throw new Error("GPay merchant_order_id không khớp embed_data đã ký.");
  }

  return {
    source,
    orderId,
    orderNumber,
    orderKey,
    paymentProvider,
    merchantOrderId,
    amount,
    currency,
  };
}

function validateOrderIdentity(
  order: WooCommerceAdminOrder,
  embed: GPayEmbedData,
): void {
  if (
    order.id !== embed.orderId ||
    order.number !== embed.orderNumber ||
    order.order_key !== embed.orderKey
  ) {
    throw new Error("Callback GPay không khớp WooCommerce order.");
  }

  if (!embed.paymentProvider.startsWith("gpay_")) {
    throw new Error("Payment provider trong embed_data không phải GPay.");
  }

  assertGPayCommerceOrderEligible(order, {
    amount: embed.amount,
    currency: embed.currency,
    requireLineItems: true,
  });
}

function eligibleReconciliation(
  verification: GPayGatewayCallbackVerification,
  reconciliation: GPayCallbackReconciliationResult,
): { eligible: boolean; reason: string } {
  if (!verification.verified) {
    return { eligible: false, reason: "SIGNATURE_NOT_VERIFIED" };
  }

  if (verification.normalizedStatus !== "SUCCESS") {
    return {
      eligible: false,
      reason: `CALLBACK_STATUS_${verification.normalizedStatus}`,
    };
  }

  if (!queryConfirmationRequired()) {
    return {
      eligible: true,
      reason: "SIGNATURE_SUCCESS_QUERY_OPTIONALLY_DISABLED",
    };
  }

  if (
    reconciliation.mode !== "query" ||
    reconciliation.attempted !== true ||
    reconciliation.confirmed !== true ||
    reconciliation.queriedStatus !== "SUCCESS"
  ) {
    return { eligible: false, reason: "QUERY_SUCCESS_NOT_CONFIRMED" };
  }

  return { eligible: true, reason: "QUERY_SUCCESS_CONFIRMED" };
}

function transactionId(
  verification: GPayGatewayCallbackVerification,
  reconciliation: GPayCallbackReconciliationResult,
): string {
  return (
    cleanString(reconciliation.query?.gpayTransactionId) ||
    cleanString(verification.callback.gpayTransactionId) ||
    verification.callback.gpayBillId
  );
}

async function persistPaymentSuccess({
  order,
  embed,
  verification,
  reconciliation,
  mode,
  source,
}: {
  order: WooCommerceAdminOrder;
  embed: GPayEmbedData;
  verification: GPayGatewayCallbackVerification;
  reconciliation: GPayCallbackReconciliationResult;
  mode: GPayCommerceAutomationMode;
  source: "gpay-webhook" | "protected-test";
}): Promise<{
  duplicate: boolean;
  stateChanged: boolean;
}> {
  const previousHash = readWooCommerceOrderMetaString(
    order,
    PAYMENT_META.callbackSha256,
  );
  const duplicate = previousHash === verification.canonicalSha256;
  const alreadyPaid =
    Boolean(order.date_paid) ||
    order.status === "processing" ||
    order.status === "completed";
  const paidAt =
    readWooCommerceOrderMetaString(order, PAYMENT_META.paidAt) ||
    new Date().toISOString();
  const metadata = upsertWooCommerceOrderMeta(order, {
    [PAYMENT_META.provider]: embed.paymentProvider,
    [PAYMENT_META.status]: "SUCCESS",
    [PAYMENT_META.merchantTransactionId]: verification.callback.merchantOrderId,
    [PAYMENT_META.providerTransactionId]: transactionId(
      verification,
      reconciliation,
    ),
    [PAYMENT_META.gpayBillId]: verification.callback.gpayBillId,
    [PAYMENT_META.callbackSha256]: verification.canonicalSha256,
    [PAYMENT_META.paidAt]: paidAt,
    [PAYMENT_META.automationMode]: mode,
    [PAYMENT_META.reconciliationReason]: reconciliation.reason,
    [PAYMENT_META.automationSource]: source,
  });

  const updatedOrder = await updateWooCommerceAdminOrder(order.id, {
    transaction_id: transactionId(verification, reconciliation),
    payment_method: embed.paymentProvider,
    payment_method_title: "GPay",
    ...(!alreadyPaid ? { set_paid: true } : {}),
    meta_data: metadata,
  });

  if (!isWooCommerceOrderPaid(updatedOrder)) {
    throw new Error(
      "WooCommerce không xác nhận order đã paid; Gigago fulfillment bị chặn.",
    );
  }

  return {
    duplicate,
    stateChanged: !alreadyPaid,
  };
}

async function persistFulfillmentOutcome({
  orderId,
  succeeded,
  error,
}: {
  orderId: number;
  succeeded: boolean;
  error?: unknown;
}): Promise<void> {
  const order = await getWooCommerceAdminOrder(orderId);
  const metadata = upsertWooCommerceOrderMeta(order, {
    [PAYMENT_META.fulfillmentAttemptedAt]: new Date().toISOString(),
    [PAYMENT_META.fulfillmentResult]: succeeded ? "submitted" : "failed",
    [PAYMENT_META.fulfillmentError]:
      !succeeded && error
        ? {
            name: error instanceof Error ? error.name : "UnknownError",
            message:
              error instanceof Error
                ? error.message
                : "Gigago fulfillment failed.",
          }
        : "",
  });

  await updateWooCommerceAdminOrder(orderId, { meta_data: metadata });
}

async function executeUnlocked(
  verification: GPayGatewayCallbackVerification,
  reconciliation: GPayCallbackReconciliationResult,
  options: GPayCommerceAutomationOptions,
): Promise<GPayCommerceAutomationResult> {
  const mode = options.modeOverride ?? configuredMode();
  const source = options.source ?? "gpay-webhook";
  const eligibility = eligibleReconciliation(verification, reconciliation);

  if (mode === "disabled") {
    return {
      mode,
      attempted: false,
      paymentRecorded: false,
      commerceStateChanged: false,
      fulfillmentAttempted: false,
      fulfillmentSucceeded: null,
      duplicatePaymentEvent: false,
      orderId: null,
      reason: "AUTOMATION_DISABLED",
    };
  }

  if (!eligibility.eligible) {
    return {
      mode,
      attempted: false,
      paymentRecorded: false,
      commerceStateChanged: false,
      fulfillmentAttempted: false,
      fulfillmentSucceeded: null,
      duplicatePaymentEvent: false,
      orderId: null,
      reason: eligibility.reason,
    };
  }

  const embed = parseEmbedData(verification);
  const order = await getWooCommerceAdminOrder(embed.orderId);

  validateOrderIdentity(order, embed);

  const payment = await persistPaymentSuccess({
    order,
    embed,
    verification,
    reconciliation,
    mode,
    source,
  });

  if (mode === "record") {
    return {
      mode,
      attempted: true,
      paymentRecorded: true,
      commerceStateChanged: payment.stateChanged,
      fulfillmentAttempted: false,
      fulfillmentSucceeded: null,
      duplicatePaymentEvent: payment.duplicate,
      orderId: order.id,
      reason: payment.duplicate
        ? "PAYMENT_RECORDED_DUPLICATE"
        : "PAYMENT_RECORDED",
    };
  }

  const selectedFulfillmentMode =
    options.fulfillmentModeOverride ?? ("live" as const);

  try {
    const persistedOrder = await getWooCommerceAdminOrder(order.id);

    if (!isWooCommerceOrderPaid(persistedOrder)) {
      throw new Error(
        "WooCommerce paid postcondition was lost before fulfillment.",
      );
    }

    const fulfillment = await submitGigagoFulfillment(
      order.id,
      selectedFulfillmentMode,
    );

    await persistFulfillmentOutcome({ orderId: order.id, succeeded: true });

    return {
      mode,
      attempted: true,
      paymentRecorded: true,
      commerceStateChanged: payment.stateChanged,
      fulfillmentAttempted: true,
      fulfillmentSucceeded: true,
      duplicatePaymentEvent: payment.duplicate,
      orderId: order.id,
      reason: fulfillment.recovered
        ? "FULFILLMENT_RECOVERED"
        : "FULFILLMENT_SUBMITTED",
      fulfillment,
    };
  } catch (error) {
    await persistFulfillmentOutcome({
      orderId: order.id,
      succeeded: false,
      error,
    });

    return {
      mode,
      attempted: true,
      paymentRecorded: true,
      commerceStateChanged: payment.stateChanged,
      fulfillmentAttempted: true,
      fulfillmentSucceeded: false,
      duplicatePaymentEvent: payment.duplicate,
      orderId: order.id,
      reason: "FULFILLMENT_FAILED",
      fulfillmentError: {
        name: error instanceof Error ? error.name : "UnknownError",
        message:
          error instanceof Error ? error.message : "Gigago fulfillment failed.",
      },
    };
  }
}

export async function runGPayCommerceAutomation(
  verification: GPayGatewayCallbackVerification,
  reconciliation: GPayCallbackReconciliationResult,
  options: GPayCommerceAutomationOptions = {},
): Promise<GPayCommerceAutomationResult> {
  const embed = verification.parsedEmbedData;
  const orderId = isRecord(embed) ? parsePositiveInteger(embed.orderId) : null;

  if (!orderId) {
    return executeUnlocked(verification, reconciliation, options);
  }

  const existing = inFlight.get(orderId);

  if (existing) {
    return existing;
  }

  const task = executeUnlocked(verification, reconciliation, options).finally(
    () => {
      inFlight.delete(orderId);
    },
  );

  inFlight.set(orderId, task);

  return task;
}
