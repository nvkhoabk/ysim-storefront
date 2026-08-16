import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getGigagoConfig, getGigagoTestSecret } from "@/lib/fulfillment/gigago";
import {
  getGigagoSecureDeliveryStatus,
  persistGigagoSecureDeliverySnapshot,
} from "@/lib/fulfillment/gigago/gigago-delivery-snapshot";
import type {
  GigagoAgencyOrder,
  GigagoDeliveredEsim,
} from "@/lib/fulfillment/gigago/gigago.types";
import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import { readWooCommerceOrderMetaString } from "@/lib/woocommerce/order-admin-write-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestAction = "persist-fixture" | "status";

interface TestBody {
  orderId?: unknown;
  action?: unknown;
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
  if (getGigagoConfig().environment !== "sandbox") {
    return NextResponse.json(
      { success: false, code: "SANDBOX_ONLY" },
      { status: 404 },
    );
  }

  const supplied = request.headers.get("x-ysim-test-secret")?.trim() || "";
  const expected = getGigagoTestSecret();

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

function actionValue(value: unknown): TestAction | null {
  return value === "persist-fixture" || value === "status" ? value : null;
}

function orderPaid(order: WooCommerceAdminOrder): boolean {
  return (
    Boolean(order.date_paid || order.date_paid_gmt) ||
    order.status === "processing" ||
    order.status === "completed"
  );
}

function fixtureRequestId(order: WooCommerceAdminOrder): string {
  const requestId = readWooCommerceOrderMetaString(
    order,
    "_ysim_gigago_request_id",
  );

  if (!requestId) {
    throw new Error(
      "Order chưa có _ysim_gigago_request_id. Hãy chạy live fulfillment protected flow trước.",
    );
  }

  return requestId;
}

function fixturePlanRows(order: WooCommerceAdminOrder): Array<{
  lineItemId: number;
  planId: string;
}> {
  return (order.line_items ?? []).flatMap((lineItem) => {
    const quantity = Number(lineItem.quantity);
    const planId = lineItem.sku?.trim() || "";

    if (!Number.isInteger(quantity) || quantity <= 0 || !planId) {
      return [];
    }

    return Array.from({ length: quantity }, () => ({
      lineItemId: lineItem.id,
      planId,
    }));
  });
}

function fixtureSnapshot(
  order: WooCommerceAdminOrder,
  requestId: string,
): {
  agencyOrders: GigagoAgencyOrder[];
  deliveredEsims: GigagoDeliveredEsim[];
} {
  const rows = fixturePlanRows(order);

  if (rows.length === 0) {
    throw new Error("Order không có line item SKU hợp lệ để tạo fixture.");
  }

  const providerOrderId = `F05-${order.id}`;
  const now = new Date().toISOString();

  return {
    agencyOrders: [
      {
        id: providerOrderId,
        total_price: Number(order.total),
        notes: `F05.1A protected delivery fixture for Woo order ${order.number}`,
        currency: order.currency,
        total_esims: String(rows.length),
        request_id: requestId,
        order_detail: JSON.stringify(
          rows.map((row) => ({
            ggg_plan_id: row.planId,
            amount: 1,
          })),
        ),
        total_esim_completed: rows.length,
        order_date: now,
        agency_id: 0,
        agency_name: "YSim protected fixture",
        user_id: 0,
        order_status: 1,
        order_status_name: "Completed",
      },
    ],
    deliveredEsims: rows.map((row, index) => {
      const suffix = String(order.id * 100 + index).padStart(14, "0");
      const iccid = `89${suffix}`.slice(0, 19);

      return {
        id: order.id * 1000 + index + 1,
        order_id: providerOrderId,
        agency_id: 0,
        iccid,
        currency: order.currency,
        phone_number: "",
        channel_notes: `F05.1A protected fixture line item ${row.lineItemId}`,
        request_id: requestId,
        status: 1,
        status_name: "Delivered",
        price: Number(order.total) / rows.length,
        ggg_plan_id: row.planId,
        data: "TEST",
        validity: "TEST",
        user_id: 0,
        username: "ysim-protected-fixture",
        order_date: now,
        qr_code: `LPA:1$testsmdpplus.ysim.invalid$F05-${order.id}-${index + 1}`,
        short_link: "",
      };
    }),
  };
}

export async function GET() {
  return NextResponse.json(
    {
      service: "YSim F05.1A secure eSIM delivery snapshot test",
      status: "ready",
      contractVersion: "f05.1a-secure-delivery-snapshot-v1",
      sandboxOnly: true,
      returnsSensitiveDeliveryData: false,
      actions: ["persist-fixture", "status"],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  try {
    const authorizationError = authorize(request);

    if (authorizationError) {
      return authorizationError;
    }

    const body = (await request.json()) as TestBody;
    const orderId = positiveOrderId(body.orderId);
    const action = actionValue(body.action);

    if (!orderId || !action) {
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
        result: await getGigagoSecureDeliveryStatus(orderId),
      });
    }

    const order = await getWooCommerceAdminOrder(orderId);
    const paymentStatus = readWooCommerceOrderMetaString(
      order,
      "_ysim_payment_status",
    );

    if (!orderPaid(order) || paymentStatus !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,
          code: "PAYMENT_NOT_CONFIRMED",
          orderStatus: order.status,
          paymentStatus,
        },
        { status: 422 },
      );
    }

    const requestId = fixtureRequestId(order);
    const fixture = fixtureSnapshot(order, requestId);
    const assessment = await persistGigagoSecureDeliverySnapshot({
      order,
      mode: "live",
      requestId,
      agencyOrders: fixture.agencyOrders,
      deliveredEsims: fixture.deliveredEsims,
      source: "protected-fixture",
    });

    return NextResponse.json({
      success: assessment.ready,
      protectedTest: true,
      action,
      result: {
        assessment,
        status: await getGigagoSecureDeliveryStatus(orderId),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "F05_1A_TEST_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    );
  }
}
