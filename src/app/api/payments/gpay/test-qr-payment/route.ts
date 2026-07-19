import {
  NextResponse,
} from "next/server";

import {
  createGPayQrPayment,
  isGPayError,
  type GPayQrTokenStrategy,
} from "@/lib/payment/adapters/gpay";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function isAuthorized(
  request: Request,
): boolean {
  const expected =
    process.env
      .GPAY_SANDBOX_TEST_API_KEY
      ?.trim();

  const provided =
    request.headers
      .get(
        "x-ysim-test-key",
      )
      ?.trim();

  return Boolean(
    expected &&
      provided &&
      expected === provided,
  );
}

function isStrategy(
  value: unknown,
): value is GPayQrTokenStrategy {
  return (
    value === "legacy" ||
    value === "openapi"
  );
}

function parseAmount(
  value: unknown,
): number {
  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return Number(
      value.trim(),
    );
  }

  return Number.NaN;
}

export async function POST(
  request: Request,
) {
  if (
    !isAuthorized(request)
  ) {
    return NextResponse.json(
      {
        success: false,

        error: {
          code:
            "UNAUTHORIZED",

          message:
            "Không được phép kiểm thử GPay QR Payment.",
        },
      },
      {
        status: 401,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }

  try {
    const body =
      (await request
        .json()
        .catch(
          () => ({}),
        )) as Record<
        string,
        unknown
      >;

    const amount =
      parseAmount(
        body.amount,
      );

    const billId =
      typeof body.billId ===
        "string"
        ? body.billId.trim()
        : "";

    const payment =
      await createGPayQrPayment(
        {
          billId,

          amount,

          description:
            typeof body.description ===
              "string"
              ? body.description
                  .trim() ||
                undefined
              : undefined,
        },
        {
          tokenStrategy:
            isStrategy(
              body.strategy,
            )
              ? body.strategy
              : undefined,

          forceTokenRefresh:
            body.forceTokenRefresh ===
            true,
        },
      );

    return NextResponse.json(
      {
        success: true,

        provider:
          "gpay",

        payment: {
          ...payment,

          qrImageDataUrl:
            `[REDACTED_DATA_URL length=${payment.qrImageDataUrl.length}]`,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "GPay QR payment test failed:",
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
              : "GPAY_QR_PAYMENT_TEST_FAILED",

          message:
            isGPayError(error)
              ? error.message
              : "Không thể tạo GPay QR Payment.",

          debug:
            process.env
              .GPAY_ENVIRONMENT ===
              "sandbox"
              ? isGPayError(
                  error,
                )
                ? error.details
                : error instanceof
                    Error
                  ? error.message
                  : undefined
              : undefined,
        },
      },
      {
        status,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
