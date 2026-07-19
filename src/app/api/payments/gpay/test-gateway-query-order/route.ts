import {
  NextResponse,
} from "next/server";

import {
  isGPayError,
  queryGPayGatewayOrder,
} from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(
  request: Request,
): boolean {
  const expected =
    process.env
      .GPAY_SANDBOX_TEST_API_KEY
      ?.trim();

  const provided =
    request.headers
      .get("x-ysim-test-key")
      ?.trim();

  return Boolean(
    expected &&
      provided &&
      expected === provided,
  );
}

function asRequiredString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: Request,
) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message:
            "Không được phép kiểm thử truy vấn đơn hàng GPay Gateway.",
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
    const body =
      (await request
        .json()
        .catch(() => ({}))) as Record<
        string,
        unknown
      >;

    const result =
      await queryGPayGatewayOrder(
        {
          gpayBillId:
            asRequiredString(
              body.gpayBillId,
            ),
          merchantOrderId:
            asRequiredString(
              body.merchantOrderId,
            ),
        },
        {
          forceTokenRefresh:
            body.forceTokenRefresh ===
            true,
        },
      );

    return NextResponse.json(
      {
        success: true,
        provider: "gpay",
        environment:
          process.env
            .GPAY_ENVIRONMENT ||
          "sandbox",
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
    console.error(
      "GPay Gateway query-order test failed:",
      error,
    );

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
          code:
            isGPayError(error)
              ? error.code
              : "GPAY_GATEWAY_QUERY_TEST_FAILED",
          message:
            isGPayError(error)
              ? error.message
              : "Không thể truy vấn đơn hàng GPay Gateway.",
          debug:
            process.env
              .GPAY_ENVIRONMENT ===
              "sandbox"
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
