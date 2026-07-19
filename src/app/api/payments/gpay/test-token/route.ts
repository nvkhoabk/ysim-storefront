import {
  NextResponse,
} from "next/server";

import {
  getGPayAccessToken,
  isGPayError,
  toSafeGPayTokenInfo,
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
      provided === expected,
  );
}

interface TestTokenRequest {
  forceRefresh?: boolean;
}

async function parseRequest(
  request: Request,
): Promise<TestTokenRequest> {
  try {
    const body =
      (await request.json()) as unknown;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return {};
    }

    const input =
      body as Record<string, unknown>;

    return {
      forceRefresh:
        input.forceRefresh === true,
    };
  } catch {
    return {};
  }
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
            "Không được phép kiểm thử GPay token.",
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
    const input =
      await parseRequest(request);

    const result =
      await getGPayAccessToken({
        forceRefresh:
          input.forceRefresh === true,
      });

    return NextResponse.json(
      {
        success: true,

        provider: "gpay",

        environment:
          process.env
            .GPAY_ENVIRONMENT ??
          "sandbox",

        token:
          toSafeGPayTokenInfo(
            result.token,
            result.cached,
          ),
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
      "GPay token test failed:",
      error instanceof Error
        ? {
            name:
              error.name,

            message:
              error.message,

            stack:
              error.stack,
          }
        : error,
    );

    if (isGPayError(error)) {
      return NextResponse.json(
        {
          success: false,

          error: {
            code:
              error.code,

            message:
              error.message,

            status:
              error.status,

            debug:
              process.env
                .GPAY_ENVIRONMENT ===
                "sandbox"
                ? error.details
                : undefined,
          },
        },
        {
          status:
            error.status &&
            error.status >= 400 &&
            error.status <= 599
              ? error.status
              : 502,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: false,

        error: {
          code:
            "GPAY_TOKEN_TEST_FAILED",

          message:
            "Không thể lấy token từ GPay.",

          debug:
            process.env
              .GPAY_ENVIRONMENT ===
              "sandbox" &&
            error instanceof Error
              ? error.message
              : undefined,
        },
      },
      {
        status: 502,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
