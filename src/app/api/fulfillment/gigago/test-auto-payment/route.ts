import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  GPAY_CALLBACK_CONTRACT_VERSION,
  type GPayCallbackReconciliationResult,
  type GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";
import {
  runGPayCommerceAutomation,
  type GPayCommerceAutomationMode,
} from "@/lib/fulfillment/gigago/gpay-commerce-automation";
import type { GigagoFulfillmentMode } from "@/lib/fulfillment/gigago/gigago-fulfillment-service";
import { getWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TestRequestBody {
  orderId?: unknown;
  action?: unknown;
  fulfillmentMode?: unknown;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}.`);
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

function positiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function automationMode(value: unknown): GPayCommerceAutomationMode | null {
  return value === "record" || value === "fulfill" ? value : null;
}

function fulfillmentMode(value: unknown): GigagoFulfillmentMode | null {
  return value === "demo" || value === "live" ? value : null;
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

    const body = (await request.json()) as TestRequestBody;
    const orderId = positiveInteger(body.orderId);
    const action = automationMode(body.action);
    const selectedFulfillmentMode = fulfillmentMode(body.fulfillmentMode);

    if (
      !orderId ||
      !action ||
      (action === "fulfill" && !selectedFulfillmentMode)
    ) {
      return NextResponse.json(
        { success: false, code: "INVALID_TEST_REQUEST" },
        { status: 400 },
      );
    }

    const order = await getWooCommerceAdminOrder(orderId);
    const merchantOrderId = `YSIM-F04-TEST-${order.id}`;
    const gpayBillId = `F04-BILL-${order.id}`;
    const gpayTransactionId = `F04-TRANS-${order.id}`;
    const embedData = {
      source: "ysim-storefront",
      orderId: order.id,
      orderNumber: order.number,
      orderKey: order.order_key,
      paymentProvider: "gpay_gateway_all",
      merchantOrderId,
    };
    const canonicalSha256 = createHash("sha256")
      .update(
        JSON.stringify({
          merchantOrderId,
          gpayBillId,
          gpayTransactionId,
          orderKey: order.order_key,
        }),
        "utf8",
      )
      .digest("hex");
    const verification: GPayGatewayCallbackVerification = {
      verified: true,
      verificationStrategy: GPAY_CALLBACK_CONTRACT_VERSION,
      normalizedStatus: "SUCCESS",
      callback: {
        embedData: JSON.stringify(embedData),
        gpayBillId,
        gpayTransactionId,
        merchantOrderId,
        status: "SUCCESS",
        userPaymentMethod: "F04_PROTECTED_TEST",
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
      reason: "F04_PROTECTED_TEST_CONFIRMED",
      callbackStatus: "SUCCESS",
      queriedStatus: "SUCCESS",
      merchantOrderIdMatches: true,
      gpayBillIdMatches: true,
      statusCompatible: true,
      embedDataMatches: true,
      query: {
        status: "SUCCESS",
        gpayTransactionId,
        userPaymentMethod: "F04_PROTECTED_TEST",
        queriedAt: new Date().toISOString(),
      },
    };
    const result = await runGPayCommerceAutomation(
      verification,
      reconciliation,
      {
        modeOverride: action,
        fulfillmentModeOverride:
          action === "fulfill"
            ? (selectedFulfillmentMode ?? undefined)
            : undefined,
        source: "protected-test",
      },
    );

    return NextResponse.json(
      { success: true, protectedTest: true, result },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("F04 protected test failed:", error);

    return NextResponse.json(
      {
        success: false,
        code: "F04_TEST_FAILED",
        message:
          error instanceof Error ? error.message : "F04 protected test failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "YSim F04 protected auto-payment test",
    status: "ready",
    sandboxOnly: true,
    actions: ["record", "fulfill"],
    fulfillmentModes: ["demo", "live"],
  });
}
