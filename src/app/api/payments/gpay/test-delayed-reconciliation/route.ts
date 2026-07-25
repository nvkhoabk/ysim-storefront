import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  GPAY_CALLBACK_CONTRACT_VERSION,
  type GPayCallbackReconciliationResult,
  type GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";
import type { GPayCommerceAutomationMode } from "@/lib/fulfillment/gigago/gpay-commerce-automation";
import {
  enqueueGPayDelayedReconciliation,
  getGPayDelayedReconciliationStatus,
  processGPayDelayedReconciliation,
} from "@/lib/fulfillment/gigago/gpay-delayed-reconciliation";
import type { GigagoFulfillmentMode } from "@/lib/fulfillment/gigago/gigago-fulfillment-service";
import { getWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường: ${name}.`);
  }

  return value;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function authorize(request: Request): NextResponse | null {
  const supplied = request.headers.get("x-ysim-test-secret")?.trim() || "";
  const expected = requiredEnvironment("GIGAGO_TEST_SECRET");

  if (!safeEqual(supplied, expected)) {
    return NextResponse.json(
      { success: false, code: "INVALID_TEST_SECRET" },
      { status: 401 },
    );
  }

  return null;
}

function orderId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function automationMode(
  value: unknown,
): Exclude<GPayCommerceAutomationMode, "disabled"> | null {
  return value === "record" || value === "fulfill" ? value : null;
}

function fulfillmentMode(value: unknown): GigagoFulfillmentMode | null {
  return value === "demo" || value === "live" ? value : null;
}

function syntheticStatus(
  value: unknown,
): "PENDING" | "SUCCESS" | "FAILED" | null {
  return value === "PENDING" || value === "SUCCESS" || value === "FAILED"
    ? value
    : null;
}

export async function POST(request: Request) {
  try {
    if (process.env.GIGAGO_ENV?.trim().toLowerCase() !== "sandbox") {
      return NextResponse.json(
        { success: false, code: "SANDBOX_ONLY" },
        { status: 404 },
      );
    }

    const authorizationError = authorize(request);

    if (authorizationError) {
      return authorizationError;
    }

    const body = (await request.json()) as {
      orderId?: unknown;
      action?: unknown;
      automationMode?: unknown;
      fulfillmentMode?: unknown;
      providerStatus?: unknown;
    };
    const selectedOrderId = orderId(body.orderId);
    const action = body.action;

    if (
      !selectedOrderId ||
      (action !== "enqueue" && action !== "process" && action !== "status")
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_TEST_REQUEST",
        },
        { status: 400 },
      );
    }

    if (action === "status") {
      return NextResponse.json({
        success: true,
        protectedTest: true,
        action,
        result: await getGPayDelayedReconciliationStatus(selectedOrderId),
      });
    }

    if (action === "process") {
      const status = syntheticStatus(body.providerStatus);

      if (!status) {
        return NextResponse.json(
          {
            success: false,
            code: "INVALID_SYNTHETIC_STATUS",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        protectedTest: true,
        action,
        result: await processGPayDelayedReconciliation(selectedOrderId, {
          force: true,
          syntheticStatus: status,
        }),
      });
    }

    const selectedAutomationMode = automationMode(body.automationMode);
    const selectedFulfillmentMode = fulfillmentMode(body.fulfillmentMode);

    if (!selectedAutomationMode || !selectedFulfillmentMode) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_TEST_MODE",
        },
        { status: 400 },
      );
    }

    const order = await getWooCommerceAdminOrder(selectedOrderId);
    const amount = Number(order.total);
    const currency = order.currency.trim().toUpperCase();
    const merchantOrderId = `YSIM-F04-2-${order.id}`;
    const gpayBillId = `F04-2-BILL-${order.id}`;
    const embedData = {
      source: "ysim-storefront",
      orderId: order.id,
      orderNumber: order.number,
      orderKey: order.order_key,
      paymentProvider: "gpay_gateway_all",
      merchantOrderId,
      amount,
      currency,
    };
    const canonicalSha256 = createHash("sha256")
      .update(JSON.stringify(embedData), "utf8")
      .digest("hex");
    const verification: GPayGatewayCallbackVerification = {
      verified: true,
      verificationStrategy: GPAY_CALLBACK_CONTRACT_VERSION,
      normalizedStatus: "SUCCESS",
      callback: {
        embedData: JSON.stringify(embedData),
        gpayBillId,
        gpayTransactionId: "",
        merchantOrderId,
        status: "ORDER_SUCCESS",
        userPaymentMethod: "F04_2_PROTECTED_TEST",
        signature: "protected-test-route",
      },
      parsedEmbedData: embedData,
      canonicalSha256,
      contractVersion: GPAY_CALLBACK_CONTRACT_VERSION,
    };
    const reconciliation: GPayCallbackReconciliationResult = {
      mode: "query",
      attempted: true,
      confirmed: true,
      reason: "F04_2_PROTECTED_PENDING",
      callbackStatus: "SUCCESS",
      queriedStatus: "PENDING",
      merchantOrderIdMatches: true,
      gpayBillIdMatches: true,
      statusCompatible: true,
      embedDataMatches: true,
      query: {
        status: "",
        gpayTransactionId: "",
        userPaymentMethod: "F04_2_PROTECTED_TEST",
        queriedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      protectedTest: true,
      action,
      result: await enqueueGPayDelayedReconciliation({
        verification,
        reconciliation,
        automationMode: selectedAutomationMode,
        fulfillmentMode: selectedFulfillmentMode,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "F04_2_TEST_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "F04.2 protected test failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "YSim F04.2 delayed reconciliation test",
    status: "ready",
    sandboxOnly: true,
    actions: ["enqueue", "process", "status"],
    providerStatuses: ["PENDING", "SUCCESS", "FAILED"],
  });
}
