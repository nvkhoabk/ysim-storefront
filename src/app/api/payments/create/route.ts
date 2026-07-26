import { NextResponse } from "next/server";

import { createPaymentSession } from "@/features/payments/payment.service";
import { createPaymentSchema } from "@/features/payments/payment.validation";

import { GigagoReadinessError } from "@/lib/fulfillment/gigago/gigago-readiness-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Thông tin tạo thanh toán không hợp lệ.",
          issues: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const values = parsed.data;

    /*
     * Trước khi tạo payment thật, cần:
     *
     * - Đọc order từ WooCommerce bằng orderId.
     * - Xác minh orderKey.
     * - Không tin amount do frontend gửi.
     * - Lấy amount/currency trực tiếp từ order.
     */

    const session = await createPaymentSession(values.provider, values);

    return NextResponse.json(session, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof GigagoReadinessError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,

          // Giữ tương thích với frontend đang đọc trường error.
          error: error.message,

          details: {
            orderId: error.details.orderId,
            readinessStatus: error.details.status,
            environment: error.details.environment,
            issues: error.details.issues,
          },
        },
        {
          status: error.status,
        },
      );
    }

    console.error("Cannot create payment:", error);

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
      {
        status: 500,
      },
    );
  }
}
