import { NextResponse } from "next/server";

import { createPaymentSession } from "@/features/payments/payment.service";
import { decidePaymentProviderExecutionGate } from "@/lib/runtime/production-execution-gate";
import { createPaymentSchema } from "@/features/payments/payment.validation";
import type { PaymentProviderId } from "@/features/payments/payment.types";
import { GigagoReadinessError } from "@/lib/fulfillment/gigago/gigago-readiness-gate";
import { getWooCommerceAdminOrder } from "@/lib/woocommerce/order-admin-api";
import {
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function providerTitle(provider: PaymentProviderId): string {
  if (provider === "gpay_virtual_account") {
    return "GPay Virtual Account";
  }

  if (provider.startsWith("gpay_gateway_")) {
    return "GPay";
  }

  return provider;
}

function canonicalAmount(total: string): number {
  const value = Number(total);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Tổng tiền WooCommerce phải là số nguyên VND lớn hơn 0.");
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Thông tin tạo thanh toán không hợp lệ.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const values = parsed.data;
    const executionGate = decidePaymentProviderExecutionGate({
      nodeEnvironment: process.env.NODE_ENV,
      providerId: values.provider,
    });

    if (!executionGate.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: executionGate.code,
          capability: executionGate.capability,
          requiredFlags: executionGate.requiredFlags,
          missingFlags: executionGate.missingFlags,
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const order = await getWooCommerceAdminOrder(values.orderId);

    if (order.order_key !== values.orderKey) {
      return NextResponse.json(
        {
          success: false,
          code: "ORDER_KEY_MISMATCH",
          message: "Không thể xác minh quyền truy cập đơn hàng.",
        },
        { status: 403 },
      );
    }

    const currency = order.currency.trim().toUpperCase();
    const amount = canonicalAmount(order.total);

    if (currency !== "VND") {
      throw new Error("Các phương thức GPay hiện chỉ hỗ trợ đơn hàng VND.");
    }

    const customerName = [order.billing.first_name, order.billing.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    const providerMeta = upsertWooCommerceOrderMeta(order, {
      _ysim_payment_provider: values.provider,
      _ysim_payment_status: "PENDING",
    });

    await updateWooCommerceAdminOrder(order.id, {
      payment_method: values.provider,
      payment_method_title: providerTitle(values.provider),
      meta_data: providerMeta,
    });

    const session = await createPaymentSession(values.provider, {
      ...values,
      orderNumber: order.number,
      amount,
      currency,
      customerName: customerName || values.customerName,
      customerEmail: order.billing.email || values.customerEmail,
      customerPhone: order.billing.phone || values.customerPhone,
      description: `Thanh toán đơn YSim #${order.number}`,
    });

    return NextResponse.json(session, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof GigagoReadinessError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
          error: error.message,
          details: {
            orderId: error.details.orderId,
            readinessStatus: error.details.status,
            environment: error.details.environment,
            issues: error.details.issues,
          },
        },
        { status: error.status },
      );
    }

    console.error("Cannot create payment:", {
      name: error instanceof Error ? error.name : "UnknownError",
      message:
        error instanceof Error
          ? error.message
          : "Không thể khởi tạo phiên thanh toán.",
    });

    const message =
      error instanceof Error
        ? error.message
        : "Không thể khởi tạo phiên thanh toán.";

    return NextResponse.json(
      {
        success: false,
        code: "PAYMENT_CREATE_FAILED",
        message,
        error: message,
      },
      { status: 500 },
    );
  }
}
