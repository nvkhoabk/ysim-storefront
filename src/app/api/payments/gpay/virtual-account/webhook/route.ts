import { createHash } from "node:crypto";

import { after, NextResponse } from "next/server";

import type { GPayGatewayCallbackVerification } from "@/lib/payment/adapters/gpay";
import {
  getGPayCommerceAutomationMode,
  runGPayCommerceAutomation,
} from "@/lib/fulfillment/gigago/gpay-commerce-automation";
import { GPayPaymentRecordLockError } from "@/lib/fulfillment/gigago/gpay-payment-record-lock";
import {
  GPAY_FAST_ACK_VERSION,
  isGPayFastAckCandidate,
  isGPayFastAckEnabled,
  prepareGPayFastAck,
} from "@/lib/fulfillment/gigago/gpay-fast-ack";
import {
  isGPaySignedVAWebhookDurabilityCandidate,
  persistGPayImmediateSuccessDurability,
  runGPayDelayedReconciliationSchedule,
  type PersistGPayImmediateSuccessDurabilityResult,
} from "@/lib/fulfillment/gigago/gpay-delayed-reconciliation";
import { getWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";
import {
  getGPayVAConfig,
  isGPayVirtualAccountEnabled,
} from "@/features/payments/gpay-va/gpay-va.config";
import { verifyGPayVAWebhookSignature } from "@/features/payments/gpay-va/gpay-va.crypto";
import {
  GPayVAOrderBindingError,
  resolveGPayVAOrderBinding,
} from "@/features/payments/gpay-va/gpay-va.order-binding";
import type { GPayVAWebhookPayload } from "@/features/payments/gpay-va/gpay-va.types";
import { reconcileVerifiedGPayVAWebhook } from "@/features/payments/gpay-va/gpay-va.reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePayload(rawBody: string): GPayVAWebhookPayload {
  const value = JSON.parse(rawBody) as Record<string, unknown>;
  const amount =
    typeof value.amount === "number" ? value.amount : Number(value.amount);

  const payload: GPayVAWebhookPayload = {
    gpay_trans_id: clean(value.gpay_trans_id),
    bank_trace_id: clean(value.bank_trace_id),
    bank_transaction_id: clean(value.bank_transaction_id),
    account_number: clean(value.account_number),
    amount,
    message: clean(value.message),
    merchant_code: clean(value.merchant_code),
    action: clean(value.action),
    signature: clean(value.signature),
    sender_name: clean(value.sender_name),
    sender_account: clean(value.sender_account),
    sender_bank_bin: clean(value.sender_bank_bin),
  };

  if (
    !payload.gpay_trans_id ||
    !payload.account_number ||
    !Number.isFinite(payload.amount) ||
    payload.amount <= 0 ||
    !payload.action ||
    !payload.signature
  ) {
    throw new Error("Webhook VA thiếu trường bắt buộc.");
  }

  return payload;
}

function signatureInput(payload: GPayVAWebhookPayload): string {
  return [
    `gpay_trans_id=${payload.gpay_trans_id}`,
    `bank_trace_id=${payload.bank_trace_id || ""}`,
    `bank_transaction_id=${payload.bank_transaction_id || ""}`,
    `account_number=${payload.account_number}`,
    `amount=${payload.amount}`,
    `message=${payload.message || ""}`,
    `action=${payload.action}`,
  ].join("&");
}

function orderAmount(total: string): number {
  const value = Number(total);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Woo order có tổng tiền không hợp lệ.");
  }

  return value;
}

function verificationContract({
  payload,
  orderId,
  orderNumber,
  orderKey,
  reference,
  canonicalSha256,
}: {
  payload: GPayVAWebhookPayload;
  orderId: number;
  orderNumber: string;
  orderKey: string;
  reference: string;
  canonicalSha256: string;
}): GPayGatewayCallbackVerification {
  const embedData = JSON.stringify({
    source: "ysim-storefront",
    orderId,
    orderNumber,
    orderKey,
    paymentProvider: "gpay_virtual_account",
    merchantOrderId: reference,
    amount: payload.amount,
    currency: "VND",
  });

  return {
    verified: true,
    verificationStrategy: "gpay-va-webhook-signature",
    normalizedStatus: "SUCCESS",
    callback: {
      merchantOrderId: reference,
      gpayBillId: payload.account_number,
      gpayTransactionId: payload.gpay_trans_id,
      status: "ORDER_SUCCESS",
      embedData,
      userPaymentMethod: "VA",
      signature: payload.signature,
    },
    parsedEmbedData: JSON.parse(embedData),
    canonicalSha256,
    contractVersion: "gpay-va-change-balance-v1",
  } as unknown as GPayGatewayCallbackVerification;
}

export async function POST(request: Request) {
  if (!isGPayVirtualAccountEnabled()) {
    return NextResponse.json(
      { success: false, code: "VA_DISABLED" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const rawBody = await request.text();
    const payload = parsePayload(rawBody);
    const config = getGPayVAConfig();

    if (
      config.merchantCode &&
      payload.merchant_code &&
      config.merchantCode !== payload.merchant_code
    ) {
      return NextResponse.json(
        { success: false, code: "MERCHANT_CODE_MISMATCH" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (payload.action !== "CHANGE_BALANCE") {
      return NextResponse.json(
        { success: true, acknowledged: true, ignored: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const canonical = signatureInput(payload);
    const signatureValid = await verifyGPayVAWebhookSignature(
      canonical,
      payload.signature,
    );

    if (!signatureValid) {
      return NextResponse.json(
        { success: false, code: "INVALID_SIGNATURE" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    let reference;

    try {
      reference = await resolveGPayVAOrderBinding(payload.account_number);
    } catch (error) {
      if (error instanceof GPayVAOrderBindingError) {
        const notFound = error.code === "GPAY_VA_ORDER_BINDING_NOT_FOUND";

        return NextResponse.json(
          {
            success: false,
            code: error.code,
          },
          {
            status: notFound ? 422 : 409,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }

      throw error;
    }

    const order = await getWooCommerceAdminOrder(reference.orderId);
    const expectedAccount = readWooCommerceOrderMetaString(
      order,
      "_ysim_gpay_va_account_number",
    );
    const expectedReference = readWooCommerceOrderMetaString(
      order,
      "_ysim_gpay_va_map_id",
    );
    const previousTransaction = readWooCommerceOrderMetaString(
      order,
      "_ysim_gpay_va_gpay_trans_id",
    );
    const paymentStatus = readWooCommerceOrderMetaString(
      order,
      "_ysim_payment_status",
    );
    const expectedProvider = readWooCommerceOrderMetaString(
      order,
      "_ysim_payment_provider",
    );
    const expectedEqualAmount = Number(
      readWooCommerceOrderMetaString(order, "_ysim_gpay_va_equal_amount"),
    );

    if (
      expectedProvider !== "gpay_virtual_account" ||
      !expectedAccount ||
      expectedAccount !== payload.account_number ||
      !expectedReference ||
      expectedReference !== reference.reference ||
      !Number.isSafeInteger(expectedEqualAmount) ||
      expectedEqualAmount !== reference.equalAmount
    ) {
      return NextResponse.json(
        { success: false, code: "VA_ORDER_MISMATCH" },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    const sameTransactionReplay =
      previousTransaction === payload.gpay_trans_id &&
      paymentStatus === "SUCCESS";

    const orderAlreadyPaid =
      Boolean(order.date_paid || order.date_paid_gmt) ||
      order.status === "processing" ||
      order.status === "completed" ||
      paymentStatus === "SUCCESS";

    if (orderAlreadyPaid && !sameTransactionReplay) {
      const reviewMeta = upsertWooCommerceOrderMeta(order, {
        _ysim_gpay_va_duplicate_payment_status: "MANUAL_REVIEW",
        _ysim_gpay_va_duplicate_payment_trans_id: payload.gpay_trans_id,
        _ysim_gpay_va_duplicate_payment_bank_transaction_id:
          payload.bank_transaction_id || "",
        _ysim_gpay_va_duplicate_payment_amount: payload.amount,
        _ysim_gpay_va_duplicate_payment_received_at: new Date().toISOString(),
      });

      await updateWooCommerceAdminOrder(order.id, {
        meta_data: reviewMeta,
      });

      return NextResponse.json(
        {
          success: true,
          acknowledged: true,
          paymentAccepted: false,
          code: "ORDER_ALREADY_PAID_DIFFERENT_TRANSACTION",
          orderId: order.id,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const expectedAmount = orderAmount(order.total);

    if (
      !Number.isInteger(payload.amount) ||
      payload.amount !== expectedAmount ||
      payload.amount !== reference.equalAmount
    ) {
      const mismatchMeta = upsertWooCommerceOrderMeta(order, {
        _ysim_payment_status: "AMOUNT_MISMATCH",
        _ysim_gpay_va_status: "PAYMENT_REVIEW",
        _ysim_gpay_va_gpay_trans_id: payload.gpay_trans_id,
        _ysim_gpay_va_bank_transaction_id: payload.bank_transaction_id || "",
      });

      await updateWooCommerceAdminOrder(order.id, {
        meta_data: mismatchMeta,
      });

      return NextResponse.json(
        {
          success: true,
          acknowledged: true,
          paymentAccepted: false,
          code: "AMOUNT_MISMATCH",
          orderId: order.id,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const canonicalSha256 = createHash("sha256")
      .update(canonical, "utf8")
      .digest("hex");
    const verification = verificationContract({
      payload,
      orderId: order.id,
      orderNumber: order.number,
      orderKey: order.order_key,
      reference: reference.reference,
      canonicalSha256,
    });
    const reconciliation = reconcileVerifiedGPayVAWebhook({
      verification,
      merchantOrderIdMatches: expectedReference === reference.reference,
      accountNumberMatches: expectedAccount === payload.account_number,
      amountMatches: payload.amount === expectedAmount,
    });

    if (!reconciliation.confirmed) {
      const pendingMeta = upsertWooCommerceOrderMeta(order, {
        _ysim_payment_status: "RECONCILIATION_REVIEW",
        _ysim_gpay_va_status: "PAYMENT_RECONCILIATION_REVIEW",
        _ysim_gpay_va_gpay_trans_id: payload.gpay_trans_id,
      });

      await updateWooCommerceAdminOrder(order.id, {
        meta_data: pendingMeta,
      });

      return NextResponse.json(
        {
          success: false,
          acknowledged: false,
          code: "VA_SIGNED_WEBHOOK_NOT_CONFIRMED",
          orderId: order.id,
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    const receivedMeta = upsertWooCommerceOrderMeta(order, {
      _ysim_gpay_va_status: "PAYMENT_RECEIVED_SIGNED_WEBHOOK_CONFIRMED",
      _ysim_gpay_va_gpay_trans_id: payload.gpay_trans_id,
      _ysim_gpay_va_bank_transaction_id: payload.bank_transaction_id || "",
      _ysim_gpay_va_paid_at: new Date().toISOString(),
      _ysim_gpay_va_payment_message: reference.reference,
    });

    await updateWooCommerceAdminOrder(order.id, {
      meta_data: receivedMeta,
    });

    const automationMode = getGPayCommerceAutomationMode();
    // F06.1B-1_FAST_ACK_DURABLE_V1
    if (isGPayFastAckCandidate(verification, reconciliation)) {
      const fastAck = await prepareGPayFastAck({
        verification,
        reconciliation,
        source: "gpay-va-webhook",
      });
      const durableJob = fastAck.durability;

      if (durableJob.scheduleRecommended) {
        after(async () => {
          try {
            await runGPayDelayedReconciliationSchedule(durableJob.orderId);
          } catch (error) {
            console.error("GPay VA fast-ACK durability schedule failed:", {
              orderId: durableJob.orderId,
              message: error instanceof Error ? error.message : "unknown error",
            });
          }
        });
      }
      return NextResponse.json(
        {
          success: true,
          acknowledged: true,
          verified: true,
          fastAck: true,
          fastAckVersion: GPAY_FAST_ACK_VERSION,
          duplicate: durableJob.duplicate,
          orderId: durableJob.orderId,
          paymentRecorded: fastAck.paymentAutomation.paymentRecorded,
          durabilityState: durableJob.state,
          fulfillmentQueued: durableJob.scheduleRecommended,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const automation = await runGPayCommerceAutomation(
      verification,
      reconciliation,
      {
        source: "gpay-va-webhook",
      },
    );

    let durability: PersistGPayImmediateSuccessDurabilityResult | null = null;

    if (
      automationMode !== "disabled" &&
      isGPaySignedVAWebhookDurabilityCandidate(verification, reconciliation)
    ) {
      const durabilityResult = await persistGPayImmediateSuccessDurability({
        verification,
        reconciliation,
        automation,
        automationMode,
        fulfillmentMode: "live",
      });

      durability = durabilityResult;

      if (durabilityResult.scheduleRecommended) {
        const durabilityOrderId = durabilityResult.orderId;

        after(async () => {
          try {
            await runGPayDelayedReconciliationSchedule(durabilityOrderId);
          } catch (error) {
            console.error("GPay VA durability schedule failed:", {
              orderId: durabilityOrderId,
              message: error instanceof Error ? error.message : "unknown error",
            });
          }
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        acknowledged: true,
        verified: true,
        duplicate: automation.duplicatePaymentEvent,
        orderId: automation.orderId,
        paymentRecorded: automation.paymentRecorded,
        fulfillmentState: automation.fulfillmentState,
        durabilityState: durability?.state ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof GPayPaymentRecordLockError) {
      return NextResponse.json(
        {
          success: false,
          acknowledged: false,
          code: error.code,
          message: error.message,
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("Cannot process GPay VA webhook:", {
      name: error instanceof Error ? error.name : "UnknownError",
      message:
        error instanceof Error ? error.message : "Webhook VA không hợp lệ.",
    });

    return NextResponse.json(
      {
        success: false,
        code: "INVALID_VA_CALLBACK",
        message:
          error instanceof Error ? error.message : "Webhook VA không hợp lệ.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: "YSim GPay Virtual Account webhook",
      status: isGPayVirtualAccountEnabled() ? "ready" : "disabled",
      environment: process.env.GPAY_ENVIRONMENT ?? "sandbox",
      contractVersion: "gpay-va-change-balance-v1",
      signatureAlgorithm: "SHA256withRSA",
      commerceAutomationMode: getGPayCommerceAutomationMode(),
      fastAck: {
        enabled: isGPayFastAckEnabled(),
        version: GPAY_FAST_ACK_VERSION,
        durableBeforeAck: true,
        fulfillmentAfterAck: true,
      },
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
