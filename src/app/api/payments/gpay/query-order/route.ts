import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isGPayError,
  queryGPayGatewayOrder,
} from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  gpayBillId: z.string().trim().min(1),
  merchantOrderId: z.string().trim().min(1),
  orderId: z.number().int().positive(),
  orderKey: z.string().trim().min(1),
});

export async function POST(request: Request) {
  if ((process.env.GPAY_ENVIRONMENT ?? "sandbox") !== "sandbox") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Route Query Order UI chỉ được bật ở sandbox cho tới khi hoàn tất xác minh WooCommerce order phía server.",
      },
      { status: 403 },
    );
  }

  try {
    const parsed = querySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin truy vấn thanh toán không hợp lệ.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await queryGPayGatewayOrder({
      gpayBillId: parsed.data.gpayBillId,
      merchantOrderId: parsed.data.merchantOrderId,
    });

    const normalizedStatus = result.status?.trim() || "PENDING";

    return NextResponse.json(
      {
        success: true,
        payment: {
          ...result,
          status: normalizedStatus,
          orderId: parsed.data.orderId,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Cannot query GPay Gateway order:", error);

    return NextResponse.json(
      {
        success: false,
        message: isGPayError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : "Không thể truy vấn trạng thái thanh toán GPay.",
        code: isGPayError(error) ? error.code : "GPAY_QUERY_FAILED",
      },
      { status: isGPayError(error) && error.status ? error.status : 502 },
    );
  }
}
