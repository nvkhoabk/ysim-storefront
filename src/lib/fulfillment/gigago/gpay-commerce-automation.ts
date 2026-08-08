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
  assessGigagoSubmissionDelivery,
  type GigagoDeliveryAssessment,
} from "./gigago-delivery-assessment";
import {
  submitGigagoFulfillment,
  type GigagoFulfillmentMode,
  type GigagoFulfillmentSubmission,
} from "./gigago-fulfillment-service";
import { classifyGPayPaidOrderTransaction } from "./gpay-payment-idempotency";
import { acquireGPayPaymentRecordLock } from "./gpay-payment-record-lock";

export type GPayCommerceAutomationMode = "disabled" | "record" | "fulfill";

export interface GPayCommerceAutomationOptions {
  modeOverride?: GPayCommerceAutomationMode;
  fulfillmentModeOverride?: GigagoFulfillmentMode;
  source?:
    | "gpay-webhook"
    | "protected-test"
    | "gpay-reconciliation-retry"
    | "gpay-va-webhook"
    | "protected-reconciliation-test";
}

export interface GPayWooPaymentDiagnostic {
  initialStatus: string;
  initialDatePaidPresent: boolean;
  pendingBridgeApplied: boolean;
  updateResponseStatus: string;
  updateResponseDatePaidPresent: boolean;
  confirmedStatus: string;
  confirmedDatePaidPresent: boolean;
  transactionIdPresent: boolean;
  refetchCount: number;
}

export interface GPayCommerceAutomationResult {
  mode: GPayCommerceAutomationMode;
  attempted: boolean;
  paymentRecorded: boolean;
  commerceStateChanged: boolean;
  fulfillmentAttempted: boolean;
  fulfillmentSucceeded: boolean | null;
  fulfillmentState: "not-started" | "processing" | "succeeded" | "failed";
  fulfillmentAssessment?: GigagoDeliveryAssessment;
  duplicatePaymentEvent: boolean;
  orderId: number | null;
  reason: string;
  paymentDiagnostic?: GPayWooPaymentDiagnostic;
  fulfillment?: GigagoFulfillmentSubmission;
  fulfillmentError?: {
    name: string;
    message: string;
  };
}

export interface GPayEmbedData {
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
  duplicatePaymentStatus: "_ysim_gpay_duplicate_payment_status",
  duplicatePaymentTransactionId: "_ysim_gpay_duplicate_payment_trans_id",
  duplicatePaymentCallbackSha256:
    "_ysim_gpay_duplicate_payment_callback_sha256",
  duplicatePaymentReceivedAt: "_ysim_gpay_duplicate_payment_received_at",
  fulfillmentAttemptedAt: "_ysim_gigago_auto_attempted_at",
  fulfillmentResult: "_ysim_gigago_auto_result",
  fulfillmentError: "_ysim_gigago_auto_error",
  fulfillmentAssessment: "_ysim_gigago_auto_assessment",
} as const;

const DEFAULT_ALLOWED_ORDER_STATUSES = [
  "pending",
  "on-hold",
  "processing",
  "completed",
] as const;

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

export function parseGPayCommerceEmbedData(
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
    throw new Error(
      "GPay embed_data thiếu định danh, amount hoặc currency bắt buộc.",
    );
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

export function assertGPayCommerceOrderIdentity(
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

  if (reconciliation.mode === "signed-webhook") {
    if (
      reconciliation.confirmed === true &&
      reconciliation.providerQueryKind === "virtual-account-webhook" &&
      reconciliation.merchantOrderIdMatches === true &&
      reconciliation.accountNumberMatches === true &&
      reconciliation.amountMatches === true
    ) {
      return { eligible: true, reason: "SIGNED_VA_WEBHOOK_CONFIRMED" };
    }

    return { eligible: false, reason: "SIGNED_VA_WEBHOOK_NOT_CONFIRMED" };
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

const WOO_PAID_RECHECK_DELAYS_MS = [250, 750, 1500] as const;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function paidDatePresent(order: WooCommerceAdminOrder): boolean {
  return Boolean(order.date_paid || order.date_paid_gmt);
}

async function confirmWooPaidPostcondition({
  orderId,
  initialOrder,
  updateResponse,
  pendingBridgeApplied,
}: {
  orderId: number;
  initialOrder: WooCommerceAdminOrder;
  updateResponse: WooCommerceAdminOrder;
  pendingBridgeApplied: boolean;
}): Promise<{
  order: WooCommerceAdminOrder;
  diagnostic: GPayWooPaymentDiagnostic;
}> {
  let confirmedOrder = updateResponse;
  let refetchCount = 0;

  if (!isWooCommerceOrderPaid(confirmedOrder)) {
    for (const delay of WOO_PAID_RECHECK_DELAYS_MS) {
      await sleep(delay);
      confirmedOrder = await getWooCommerceAdminOrder(orderId);
      refetchCount += 1;

      if (isWooCommerceOrderPaid(confirmedOrder)) {
        break;
      }
    }
  }

  const diagnostic: GPayWooPaymentDiagnostic = {
    initialStatus: initialOrder.status,
    initialDatePaidPresent: paidDatePresent(initialOrder),
    pendingBridgeApplied,
    updateResponseStatus: updateResponse.status,
    updateResponseDatePaidPresent: paidDatePresent(updateResponse),
    confirmedStatus: confirmedOrder.status,
    confirmedDatePaidPresent: paidDatePresent(confirmedOrder),
    transactionIdPresent: Boolean(confirmedOrder.transaction_id),
    refetchCount,
  };

  if (!isWooCommerceOrderPaid(confirmedOrder)) {
    throw new Error(
      `WooCommerce không xác nhận order đã paid sau re-fetch; Gigago fulfillment bị chặn. Diagnostic=${JSON.stringify(
        diagnostic,
      )}`,
    );
  }

  return { order: confirmedOrder, diagnostic };
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
  source:
    | "gpay-webhook"
    | "protected-test"
    | "gpay-reconciliation-retry"
    | "gpay-va-webhook"
    | "protected-reconciliation-test";
}): Promise<{
  duplicate: boolean;
  stateChanged: boolean;
  paidOrder: WooCommerceAdminOrder;
  diagnostic: GPayWooPaymentDiagnostic;
}> {
  const previousHash = readWooCommerceOrderMetaString(
    order,
    PAYMENT_META.callbackSha256,
  );
  const duplicate = previousHash === verification.canonicalSha256;
  const alreadyPaid = isWooCommerceOrderPaid(order);
  const requiresPendingBridge =
    !alreadyPaid && order.status.trim().toLowerCase() === "on-hold";
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
    ...(requiresPendingBridge ? { status: "pending" } : {}),
    transaction_id: transactionId(verification, reconciliation),
    payment_method: embed.paymentProvider,
    payment_method_title: "GPay",
    ...(!alreadyPaid ? { set_paid: true } : {}),
    meta_data: metadata,
  });

  const confirmation = await confirmWooPaidPostcondition({
    orderId: order.id,
    initialOrder: order,
    updateResponse: updatedOrder,
    pendingBridgeApplied: requiresPendingBridge,
  });

  return {
    duplicate,
    stateChanged: !alreadyPaid,
    paidOrder: confirmation.order,
    diagnostic: confirmation.diagnostic,
  };
}

async function persistDifferentTransactionReview({
  order,
  verification,
  reconciliation,
}: {
  order: WooCommerceAdminOrder;
  verification: GPayGatewayCallbackVerification;
  reconciliation: GPayCallbackReconciliationResult;
}): Promise<void> {
  const metadata = upsertWooCommerceOrderMeta(order, {
    [PAYMENT_META.duplicatePaymentStatus]: "MANUAL_REVIEW",
    [PAYMENT_META.duplicatePaymentTransactionId]: transactionId(
      verification,
      reconciliation,
    ),
    [PAYMENT_META.duplicatePaymentCallbackSha256]: verification.canonicalSha256,
    [PAYMENT_META.duplicatePaymentReceivedAt]: new Date().toISOString(),
  });

  await updateWooCommerceAdminOrder(order.id, { meta_data: metadata });
}

async function persistFulfillmentOutcome({
  orderId,
  state,
  assessment,
  error,
}: {
  orderId: number;
  state: "processing" | "succeeded" | "failed";
  assessment?: GigagoDeliveryAssessment;
  error?: unknown;
}): Promise<void> {
  const order = await getWooCommerceAdminOrder(orderId);
  const metadata = upsertWooCommerceOrderMeta(order, {
    [PAYMENT_META.fulfillmentAttemptedAt]: new Date().toISOString(),
    [PAYMENT_META.fulfillmentResult]:
      state === "succeeded" ? "delivered" : state,
    [PAYMENT_META.fulfillmentAssessment]: assessment ?? "",
    [PAYMENT_META.fulfillmentError]:
      state === "failed" && error
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
      fulfillmentState: "not-started",
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
      fulfillmentState: "not-started",
      duplicatePaymentEvent: false,
      orderId: null,
      reason: eligibility.reason,
    };
  }

  const embed = parseGPayCommerceEmbedData(verification);
  const order = await getWooCommerceAdminOrder(embed.orderId);

  assertGPayCommerceOrderIdentity(order, embed);

  const incomingTransactionId = transactionId(verification, reconciliation);
  const transactionDisposition = classifyGPayPaidOrderTransaction({
    orderPaid: isWooCommerceOrderPaid(order),
    existingTransactionId: readWooCommerceOrderMetaString(
      order,
      PAYMENT_META.providerTransactionId,
    ),
    incomingTransactionId,
  });

  if (transactionDisposition === "same-transaction-duplicate") {
    return {
      mode,
      attempted: true,
      paymentRecorded: true,
      commerceStateChanged: false,
      fulfillmentAttempted: false,
      fulfillmentSucceeded: null,
      fulfillmentState: "not-started",
      duplicatePaymentEvent: true,
      orderId: order.id,
      reason: "PAYMENT_ALREADY_RECORDED_SAME_TRANSACTION",
    };
  }

  if (transactionDisposition === "different-transaction-review") {
    await persistDifferentTransactionReview({
      order,
      verification,
      reconciliation,
    });

    return {
      mode,
      attempted: true,
      paymentRecorded: false,
      commerceStateChanged: false,
      fulfillmentAttempted: false,
      fulfillmentSucceeded: null,
      fulfillmentState: "not-started",
      duplicatePaymentEvent: false,
      orderId: order.id,
      reason: "ORDER_ALREADY_PAID_DIFFERENT_TRANSACTION",
    };
  }

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
      fulfillmentState: "not-started",
      duplicatePaymentEvent: payment.duplicate,
      orderId: order.id,
      reason: payment.duplicate
        ? "PAYMENT_RECORDED_DUPLICATE"
        : "PAYMENT_RECORDED",
      paymentDiagnostic: payment.diagnostic,
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
    const fulfillmentAssessment = assessGigagoSubmissionDelivery(fulfillment);
    const fulfillmentSucceeded = fulfillmentAssessment.delivered ? true : null;
    const fulfillmentState = fulfillmentAssessment.delivered
      ? ("succeeded" as const)
      : ("processing" as const);

    await persistFulfillmentOutcome({
      orderId: order.id,
      state: fulfillmentState,
      assessment: fulfillmentAssessment,
    });

    return {
      mode,
      attempted: true,
      paymentRecorded: true,
      commerceStateChanged: payment.stateChanged,
      fulfillmentAttempted: true,
      fulfillmentSucceeded,
      fulfillmentState,
      fulfillmentAssessment,
      duplicatePaymentEvent: payment.duplicate,
      orderId: order.id,
      reason: fulfillmentAssessment.delivered
        ? fulfillment.recovered
          ? "FULFILLMENT_RECOVERED_DELIVERED"
          : "FULFILLMENT_DELIVERED"
        : fulfillment.recovered
          ? "FULFILLMENT_RECOVERED_PROCESSING"
          : "FULFILLMENT_SUBMITTED_PROCESSING",
      paymentDiagnostic: payment.diagnostic,
      fulfillment,
    };
  } catch (error) {
    await persistFulfillmentOutcome({
      orderId: order.id,
      state: "failed",
      error,
    });

    return {
      mode,
      attempted: true,
      paymentRecorded: true,
      commerceStateChanged: payment.stateChanged,
      fulfillmentAttempted: true,
      fulfillmentSucceeded: false,
      fulfillmentState: "failed",
      duplicatePaymentEvent: payment.duplicate,
      orderId: order.id,
      reason: "FULFILLMENT_FAILED",
      paymentDiagnostic: payment.diagnostic,
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
  const mode = options.modeOverride ?? configuredMode();
  const eligibility = eligibleReconciliation(verification, reconciliation);

  if (mode === "disabled" || !eligibility.eligible) {
    return executeUnlocked(verification, reconciliation, options);
  }

  const embed = parseGPayCommerceEmbedData(verification);
  const lock = await acquireGPayPaymentRecordLock(embed.orderId);

  try {
    // executeUnlocked fetches the order only after this durable lock is held,
    // so every PM2 worker observes the paid state written by its predecessor.
    return await executeUnlocked(verification, reconciliation, options);
  } finally {
    await lock.release();
  }
}
