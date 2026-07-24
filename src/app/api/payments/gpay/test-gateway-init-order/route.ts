import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { initGPayGatewayOrder, isGPayError } from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const expected = process.env.GPAY_SANDBOX_TEST_API_KEY?.trim();

  const provided = request.headers.get("x-ysim-test-key")?.trim();

  return Boolean(expected && provided && expected === provided);
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseAmount(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value.trim());
  }

  return 10_000;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Không được phép kiểm thử GPay Gateway.",
        },
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const merchantRequestId =
      asOptionalString(body.requestId) || `YSIMGW${Date.now()}`;

    const callbackUrl =
      asOptionalString(body.callbackUrl) ||
      process.env.GPAY_GATEWAY_CALLBACK_URL?.trim() ||
      "https://sandbox.ysim.vn/checkout/gpay/return";

    const webhookUrl =
      asOptionalString(body.webhookUrl) ||
      process.env.GPAY_GATEWAY_WEBHOOK_URL?.trim() ||
      "https://sandbox.ysim.vn/api/payments/gpay/webhook";

    const embedData =
      asOptionalString(body.embedData) ||
      JSON.stringify({
        source: "ysim-sandbox",
        requestId: merchantRequestId,
        correlationId: randomUUID(),
      });

    const result = await initGPayGatewayOrder(
      {
        amount: parseAmount(body.amount),
        callbackUrl,
        customerId:
          asOptionalString(body.customerId) || "YSIM-SANDBOX-CUSTOMER",
        customerName: asOptionalString(body.customerName) || "YSIM SANDBOX",
        description:
          asOptionalString(body.description) ||
          `Thanh toan don hang ${merchantRequestId}`,
        email: asOptionalString(body.email),
        embedData,
        paymentMethod: asOptionalString(body.paymentMethod),
        paymentType: asOptionalString(body.paymentType) || "IMMEDIATE",
        phone: asOptionalString(body.phone),
        requestId: merchantRequestId,
        title: asOptionalString(body.title) || `YSim ${merchantRequestId}`,
        webhookUrl,
        address: asOptionalString(body.address),
      },
      {
        forceTokenRefresh: body.forceTokenRefresh === true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        provider: "gpay",
        environment: process.env.GPAY_ENVIRONMENT || "sandbox",
        order: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GPay Gateway init-order test failed:", error);

    const status =
      isGPayError(error) &&
      error.status &&
      error.status >= 400 &&
      error.status <= 599
        ? error.status
        : 502;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isGPayError(error) ? error.code : "GPAY_GATEWAY_TEST_FAILED",
          message: isGPayError(error)
            ? error.message
            : "Không thể khởi tạo đơn hàng GPay Gateway.",
          debug:
            process.env.GPAY_ENVIRONMENT === "sandbox"
              ? isGPayError(error)
                ? error.details
                : error instanceof Error
                  ? error.message
                  : undefined
              : undefined,
        },
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
