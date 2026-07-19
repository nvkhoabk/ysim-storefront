import { NextResponse } from "next/server";
import {
  getGPayQrToken,
  isGPayError,
  toSafeGPayQrTokenInfo,
  type GPayQrTokenStrategy,
} from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const expected =
    process.env.GPAY_SANDBOX_TEST_API_KEY?.trim();
  const provided =
    request.headers.get("x-ysim-test-key")?.trim();

  return Boolean(
    expected && provided && expected === provided,
  );
}

function isStrategy(
  value: unknown,
): value is GPayQrTokenStrategy {
  return value === "legacy" || value === "openapi";
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message:
            "Không được phép kiểm thử GPay QR token.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as
      Record<string, unknown>;

    const result = await getGPayQrToken({
      forceRefresh: body.forceRefresh === true,
      strategy: isStrategy(body.strategy)
        ? body.strategy
        : undefined,
    });

    return NextResponse.json({
      success: true,
      provider: "gpay",
      environment:
        process.env.GPAY_ENVIRONMENT ?? "sandbox",
      token: toSafeGPayQrTokenInfo(result),
    });
  } catch (error) {
    console.error("GPay QR token test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isGPayError(error)
            ? error.code
            : "GPAY_QR_TOKEN_TEST_FAILED",
          message: isGPayError(error)
            ? error.message
            : "Không thể lấy GPay QR token.",
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
      { status: isGPayError(error) ? error.status ?? 502 : 502 },
    );
  }
}
