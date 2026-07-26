import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  GPAY_CALLBACK_CONTRACT_VERSION,
  type GPayCallbackReconciliationResult,
  type GPayGatewayCallbackVerification,
} from "@/lib/payment/adapters/gpay";
import {
  assertGPayCommerceOrderEligible,
  isWooCommerceOrderPaid,
  runGPayCommerceAutomation,
} from "@/lib/fulfillment/gigago/gpay-commerce-automation";
import {
  getGPayDelayedReconciliationStatus,
  persistGPayImmediateSuccessDurability,
  processGPayDelayedReconciliation,
} from "@/lib/fulfillment/gigago/gpay-delayed-reconciliation";
import type { GigagoFulfillmentMode } from "@/lib/fulfillment/gigago/gigago-fulfillment-service";
import { getWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";
import { updateWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-write-api";

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

function positiveOrderId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
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

    const body = (await request.json()) as {
      orderId?: unknown;
      action?: unknown;
      fulfillmentMode?: unknown;
    };
    const orderId = positiveOrderId(body.orderId);
    const action = body.action;

    if (
      !orderId ||
      (action !== "prepare-on-hold" &&
        action !== "simulate" &&
        action !== "status" &&
        action !== "process")
    ) {
      return NextResponse.json(
        { success: false, code: "INVALID_TEST_REQUEST" },
        { status: 400 },
      );
    }

    if (action === "status") {
      return NextResponse.json({
        success: true,
        protectedTest: true,
        action,
        result: await getGPayDelayedReconciliationStatus(orderId),
      });
    }

    if (action === "process") {
      return NextResponse.json({
        success: true,
        protectedTest: true,
        action,
        result: await processGPayDelayedReconciliation(orderId, {
          force: true,
        }),
      });
    }

    const order = await getWooCommerceAdminOrder(orderId);
    const amount = Number(order.total);
    const currency = order.currency.trim().toUpperCase();

    assertGPayCommerceOrderEligible(order, {
      amount,
      currency,
      requireLineItems: true,
    });

    if (action === "prepare-on-hold") {
      if (isWooCommerceOrderPaid(order)) {
        return NextResponse.json(
          { success: false, code: "ORDER_ALREADY_PAID" },
          { status: 409 },
        );
      }

      if (order.status !== "pending" && order.status !== "on-hold") {
        return NextResponse.json(
          {
            success: false,
            code: "INVALID_PREPARE_STATUS",
            order: { id: order.id, status: order.status },
          },
          { status: 422 },
        );
      }

      if (order.status !== "on-hold") {
        await updateWooCommerceAdminOrder(order.id, { status: "on-hold" });
      }

      const prepared = await getWooCommerceAdminOrder(order.id);

      return NextResponse.json({
        success: true,
        protectedTest: true,
        action,
        result: {
          orderId: prepared.id,
          status: prepared.status,
          currency: prepared.currency,
          total: prepared.total,
          lineItemCount: prepared.line_items?.length ?? 0,
          paid: isWooCommerceOrderPaid(prepared),
          datePaidPresent: Boolean(
            prepared.date_paid || prepared.date_paid_gmt,
          ),
        },
      });
    }

    const selectedFulfillmentMode = fulfillmentMode(body.fulfillmentMode);

    if (!selectedFulfillmentMode) {
      return NextResponse.json(
        { success: false, code: "INVALID_FULFILLMENT_MODE" },
        { status: 400 },
      );
    }

    const merchantOrderId = `YSIM-F04-3-3-1-${order.id}`;
    const gpayBillId = `F04-3-3-1-BILL-${order.id}`;
    const gpayTransactionId = `F04-3-3-1-TRANS-${order.id}`;
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
      .update(
        JSON.stringify({
          contract: "f04.3.3.1-immediate-success",
          merchantOrderId,
          gpayBillId,
          gpayTransactionId,
          orderKey: order.order_key,
          amount,
          currency,
        }),
        "utf8",
      )
      .digest("hex");
    const queriedAt = new Date().toISOString();
    const verification: GPayGatewayCallbackVerification = {
      verified: true,
      verificationStrategy: GPAY_CALLBACK_CONTRACT_VERSION,
      normalizedStatus: "SUCCESS",
      callback: {
        embedData: JSON.stringify(embedData),
        gpayBillId,
        gpayTransactionId,
        merchantOrderId,
        status: "ORDER_SUCCESS",
        userPaymentMethod: "F04_3_3_1_PROTECTED_TEST",
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
      reason: "F04_3_3_1_IMMEDIATE_QUERY_SUCCESS",
      callbackStatus: "SUCCESS",
      queriedStatus: "SUCCESS",
      merchantOrderIdMatches: true,
      gpayBillIdMatches: true,
      statusCompatible: true,
      embedDataMatches: true,
      query: {
        status: "ORDER_SUCCESS",
        gpayTransactionId,
        userPaymentMethod: "F04_3_3_1_PROTECTED_TEST",
        queriedAt,
      },
    };
    const automation = await runGPayCommerceAutomation(
      verification,
      reconciliation,
      {
        modeOverride: "fulfill",
        fulfillmentModeOverride: selectedFulfillmentMode,
        source: "protected-reconciliation-test",
      },
    );
    const durability = await persistGPayImmediateSuccessDurability({
      verification,
      reconciliation,
      automation,
      automationMode: "fulfill",
      fulfillmentMode: selectedFulfillmentMode,
    });

    return NextResponse.json({
      success: true,
      protectedTest: true,
      action,
      result: {
        automation,
        durability,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "F04_3_3_1_TEST_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "F04.3.3.1 protected test failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "YSim F04.3.3.1 immediate-success durability test",
    status: "ready",
    contractVersion: "gpay-immediate-success-durability-f04-3-3-1-v1",
    sandboxOnly: true,
    actions: ["prepare-on-hold", "simulate", "status", "process"],
    fulfillmentModes: ["demo", "live"],
  });
}
