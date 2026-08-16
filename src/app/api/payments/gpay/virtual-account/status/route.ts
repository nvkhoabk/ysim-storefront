import { NextResponse } from "next/server";

import { getWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";
import { readWooCommerceOrderMetaString } from "@/lib/woocommerce/order-admin-write-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function positiveInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return parsed > 0 ? parsed : null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = positiveInteger(url.searchParams.get("orderId"));
    const orderKey = url.searchParams.get("key")?.trim() || "";

    if (!orderId || !orderKey) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_ORDER_REFERENCE",
          message: "Thiếu thông tin tra cứu thanh toán.",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const order = await getWooCommerceAdminOrder(orderId);

    if (order.order_key !== orderKey) {
      return NextResponse.json(
        {
          success: false,
          code: "ORDER_KEY_MISMATCH",
          message: "Không thể xác minh đơn hàng.",
        },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    const paid = Boolean(
      order.date_paid ||
      order.date_paid_gmt ||
      order.status === "processing" ||
      order.status === "completed",
    );

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.number,
        orderStatus: order.status,
        paid,
        paymentMethod: order.payment_method || "",
        paymentStatus:
          readWooCommerceOrderMetaString(order, "_ysim_payment_status") ||
          "PENDING",
        vaStatus:
          readWooCommerceOrderMetaString(order, "_ysim_gpay_va_status") || "",
        reconciliationState:
          readWooCommerceOrderMetaString(
            order,
            "_ysim_gpay_reconciliation_state",
          ) || "",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "VA_STATUS_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Không thể kiểm tra trạng thái thanh toán.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
