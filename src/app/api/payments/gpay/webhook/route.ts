import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  createGPayGatewayCallbackData,
  getGPayCallbackReconciliationMode,
  GPAY_CALLBACK_CONTRACT_VERSION,
  reconcileVerifiedGPayCallback,
  verifyGPayGatewayCallbackData,
  writeGPayDebugEvent,
} from "@/lib/payment/adapters/gpay";
import {
  getGPayCommerceAutomationMode,
  runGPayCommerceAutomation,
} from "@/lib/fulfillment/gigago/gpay-commerce-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CallbackRecord = Record<string, unknown>;

const CALLBACK_FIELDS = [
  "merchant_order_id",
  "gpay_trans_id",
  "gpay_bill_id",
  "status",
  "embed_data",
  "user_payment_method",
  "signature",
] as const;

function isRecord(value: unknown): value is CallbackRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasCallbackField(value: CallbackRecord): boolean {
  return CALLBACK_FIELDS.some((field) => field in value);
}

function getFirstHeader(
  headers: Headers,
  names: readonly string[],
): string | null {
  for (const name of names) {
    const value = headers.get(name);

    if (value) {
      return value;
    }
  }

  return null;
}

function parseBodyRecord(rawBody: string, contentType: string): CallbackRecord {
  if (!rawBody) {
    return {};
  }

  if (contentType.includes("application/json")) {
    const parsed = JSON.parse(rawBody) as unknown;

    if (!isRecord(parsed)) {
      throw new Error("Webhook GPay JSON phải là object.");
    }

    return parsed;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  try {
    const parsed = JSON.parse(rawBody) as unknown;

    if (isRecord(parsed)) {
      return parsed;
    }
  } catch {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  return {};
}

function selectCallbackRecord({
  requestUrl,
  body,
  signatureHeader,
}: {
  requestUrl: string;
  body: CallbackRecord;
  signatureHeader: string | null;
}): CallbackRecord {
  const query = Object.fromEntries(new URL(requestUrl).searchParams.entries());
  const selected = hasCallbackField(body) ? { ...body } : { ...query };

  if (!selected.signature && signatureHeader) {
    selected.signature = signatureHeader;
  }

  return selected;
}

function fieldLengths(record: CallbackRecord): Record<string, number> {
  return Object.fromEntries(
    CALLBACK_FIELDS.map((field) => {
      const value = record[field];

      return [
        field,
        typeof value === "string"
          ? value.length
          : value == null
            ? 0
            : String(value).length,
      ];
    }),
  );
}

function safeAutomationView(value: {
  mode: string;
  attempted: boolean;
  paymentRecorded: boolean;
  commerceStateChanged: boolean;
  fulfillmentAttempted: boolean;
  fulfillmentSucceeded: boolean | null;
  duplicatePaymentEvent: boolean;
  orderId: number | null;
  reason: string;
  fulfillment?: {
    created: boolean;
    recovered: boolean;
    preview: { requestId: string };
    snapshot: { agencyOrders: unknown[]; deliveredEsims: unknown[] };
  };
  fulfillmentError?: { name: string; message: string };
}) {
  return {
    mode: value.mode,
    attempted: value.attempted,
    paymentRecorded: value.paymentRecorded,
    commerceStateChanged: value.commerceStateChanged,
    fulfillmentAttempted: value.fulfillmentAttempted,
    fulfillmentSucceeded: value.fulfillmentSucceeded,
    duplicatePaymentEvent: value.duplicatePaymentEvent,
    orderId: value.orderId,
    reason: value.reason,
    fulfillment: value.fulfillment
      ? {
          created: value.fulfillment.created,
          recovered: value.fulfillment.recovered,
          requestId: value.fulfillment.preview.requestId,
          agencyOrderCount: value.fulfillment.snapshot.agencyOrders.length,
          deliveredEsimCount: value.fulfillment.snapshot.deliveredEsims.length,
        }
      : undefined,
    fulfillmentError: value.fulfillmentError,
  };
}

export async function POST(request: Request) {
  const localRequestId = randomUUID();
  const receivedAt = new Date().toISOString();

  try {
    const rawBody = await request.text();
    const contentType = request.headers.get("content-type") ?? "";
    const signatureHeader = getFirstHeader(request.headers, [
      "signature",
      "x-signature",
      "x-gpay-signature",
      "webhook-signature",
    ]);
    const providerRequestId = getFirstHeader(request.headers, [
      "x-request-id",
      "x-requests-id",
      "request-id",
      "webhook-id",
    ]);
    const bodyRecord = parseBodyRecord(rawBody, contentType);
    const callbackRecord = selectCallbackRecord({
      requestUrl: request.url,
      body: bodyRecord,
      signatureHeader,
    });
    const callback = createGPayGatewayCallbackData(callbackRecord);
    const verification = await verifyGPayGatewayCallbackData(callback);

    await writeGPayDebugEvent({
      type: "webhook.parsed",
      requestId: providerRequestId ?? localRequestId,
      operation: "gpay.webhook.verify",
      data: {
        receivedAt,
        contractVersion: verification.contractVersion,
        verified: verification.verified,
        canonicalSha256: verification.canonicalSha256,
        merchantOrderId: callback.merchantOrderId,
        gpayBillId: callback.gpayBillId,
        normalizedStatus: verification.normalizedStatus,
        fieldLengths: fieldLengths(callbackRecord),
        rawBodySha256: createHash("sha256")
          .update(rawBody, "utf8")
          .digest("hex"),
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        {
          success: false,
          acknowledged: false,
          code: "INVALID_SIGNATURE",
          contractVersion: verification.contractVersion,
          canonicalSha256: verification.canonicalSha256,
          requestId: providerRequestId ?? localRequestId,
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const reconciliation = await reconcileVerifiedGPayCallback(verification);

    if (reconciliation.attempted && reconciliation.confirmed === false) {
      await writeGPayDebugEvent({
        type: "payment.event",
        requestId: providerRequestId ?? localRequestId,
        operation: "gpay.webhook.reconciliation",
        data: {
          merchantOrderId: callback.merchantOrderId,
          gpayBillId: callback.gpayBillId,
          ...reconciliation,
        },
      });

      return NextResponse.json(
        {
          success: false,
          acknowledged: false,
          code: "RECONCILIATION_MISMATCH",
          requestId: providerRequestId ?? localRequestId,
          contractVersion: verification.contractVersion,
          reconciliation,
        },
        {
          status: 409,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    let commerceAutomation;

    try {
      commerceAutomation = await runGPayCommerceAutomation(
        verification,
        reconciliation,
        { source: "gpay-webhook" },
      );
    } catch (error) {
      commerceAutomation = {
        mode: getGPayCommerceAutomationMode(),
        attempted: true,
        paymentRecorded: false,
        commerceStateChanged: false,
        fulfillmentAttempted: false,
        fulfillmentSucceeded: false,
        duplicatePaymentEvent: false,
        orderId: null,
        reason: "AUTOMATION_EXCEPTION",
        fulfillmentError: {
          name: error instanceof Error ? error.name : "UnknownError",
          message:
            error instanceof Error
              ? error.message
              : "Commerce automation failed.",
        },
      };

      console.error("GPay commerce automation failed:", {
        name: error instanceof Error ? error.name : "UnknownError",
        message:
          error instanceof Error
            ? error.message
            : "Commerce automation failed.",
      });
    }

    const safeCommerceAutomation = safeAutomationView(commerceAutomation);
    const responseBody = {
      success: true,
      received: true,
      acknowledged: true,
      verified: true,
      requestId: providerRequestId ?? localRequestId,
      receivedAt,
      contractVersion: verification.contractVersion,
      normalizedStatus: verification.normalizedStatus,
      reconciliation,
      commerceStateChanged: safeCommerceAutomation.commerceStateChanged,
      commerceAutomation: safeCommerceAutomation,
    };

    await writeGPayDebugEvent({
      type: "webhook.response",
      requestId: providerRequestId ?? localRequestId,
      operation: "gpay.webhook",
      data: {
        status: 200,
        verified: true,
        reconciliationMode: reconciliation.mode,
        reconciliationConfirmed: reconciliation.confirmed,
        merchantOrderId: callback.merchantOrderId,
        gpayBillId: callback.gpayBillId,
        normalizedStatus: verification.normalizedStatus,
        commerceStateChanged: commerceAutomation.commerceStateChanged,
        commerceAutomationMode: commerceAutomation.mode,
        commerceAutomationReason: commerceAutomation.reason,
        fulfillmentSucceeded: commerceAutomation.fulfillmentSucceeded,
      },
    });

    return NextResponse.json(responseBody, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "Cannot process GPay webhook:",
      error instanceof Error ? error.message : "unknown error",
    );

    await writeGPayDebugEvent({
      type: "webhook.response",
      requestId: localRequestId,
      operation: "gpay.webhook",
      data: {
        status: 400,
        error: error instanceof Error ? error.message : "unknown error",
      },
    });

    return NextResponse.json(
      {
        success: false,
        acknowledged: false,
        code: "INVALID_CALLBACK",
        message:
          error instanceof Error ? error.message : "Webhook GPay không hợp lệ.",
        requestId: localRequestId,
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: "YSim GPay webhook",
      status: "ready",
      environment: process.env.GPAY_ENVIRONMENT ?? "sandbox",
      contractVersion: GPAY_CALLBACK_CONTRACT_VERSION,
      reconciliationMode: getGPayCallbackReconciliationMode(),
      signatureAlgorithm: "SHA256withRSA",
      signatureEncoding: "standard-base64",
      commerceAutomationMode: getGPayCommerceAutomationMode(),
      commerceAutomationRequiresQuery:
        process.env.GPAY_COMMERCE_AUTOMATION_REQUIRE_QUERY?.trim().toLowerCase() !==
        "false",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
