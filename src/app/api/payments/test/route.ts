import {
  NextResponse,
} from "next/server";

import {
  createPayment,
  initializePaymentProviders,
  isPaymentError,
} from "@/lib/payment";

export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return NextResponse.json(
      {
        error:
          "Test payment route is disabled in production.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    initializePaymentProviders();

    const body = (await request.json()) as {
      orderId?: number;

      amount?: number;

      email?: string;
    };

    const result = await createPayment({
      providerId: "manual",

      order: {
        orderId:
          body.orderId ?? 1001,

        orderNumber:
          String(
            body.orderId ?? 1001,
          ),
      },

      money: {
        amount:
          body.amount ?? 169000,

        currency: "VND",
      },

      customer: {
        email:
          body.email ??
          "customer@example.com",
      },

      description:
        "Thanh toán đơn hàng thử nghiệm YSim",
    });

    return NextResponse.json({
      success: true,

      payment: result,
    });
  } catch (error) {
    if (isPaymentError(error)) {
      return NextResponse.json(
        {
          success: false,

          error: {
            code: error.code,

            message: error.message,

            providerId:
              error.providerId,
          },
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Unexpected payment test error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error: {
          code:
            "INTERNAL_SERVER_ERROR",

          message:
            "Đã xảy ra lỗi không xác định.",
        },
      },
      {
        status: 500,
      },
    );
  }
}