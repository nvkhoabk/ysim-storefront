import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getGigagoConfig, isGigagoError } from "@/lib/fulfillment/gigago";
import { reconcileGigagoWebhook } from "@/lib/fulfillment/gigago/gigago-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}.`);
  }

  return value;
}

function positiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function authorize(request: Request): NextResponse | null {
  const expectedToken = requiredEnvironment("GIGAGO_WEBHOOK_TOKEN");
  const url = new URL(request.url);
  const suppliedToken =
    url.searchParams.get("token")?.trim() ||
    request.headers.get("x-ysim-webhook-token")?.trim() ||
    "";

  if (!safeEqual(suppliedToken, expectedToken)) {
    return NextResponse.json(
      {
        success: false,
        acknowledged: false,
        code: "INVALID_WEBHOOK_TOKEN",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return null;
}

function errorStatus(error: unknown): number {
  if (isGigagoError(error)) {
    if (error.code === "GIGAGO_API_REJECTED") {
      return 409;
    }

    if (error.status && error.status >= 400) {
      return error.status;
    }

    return 422;
  }

  return 400;
}

export async function POST(request: Request) {
  try {
    const authorizationError = authorize(request);

    if (authorizationError) {
      return authorizationError;
    }

    const contentType =
      request.headers.get("content-type")?.toLowerCase() || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          acknowledged: false,
          code: "UNSUPPORTED_CONTENT_TYPE",
        },
        {
          status: 415,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const rawBody = await request.text();
    const maxBodyBytes = positiveInteger(
      "GIGAGO_WEBHOOK_MAX_BODY_BYTES",
      262_144,
    );

    if (Buffer.byteLength(rawBody, "utf8") > maxBodyBytes) {
      return NextResponse.json(
        {
          success: false,
          acknowledged: false,
          code: "WEBHOOK_BODY_TOO_LARGE",
        },
        {
          status: 413,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const payload = JSON.parse(rawBody) as unknown;
    const result = await reconcileGigagoWebhook({
      payload,
      rawBody,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Gigago webhook failed:", {
      name: error instanceof Error ? error.name : "UnknownError",
      code: isGigagoError(error) ? error.code : undefined,
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        acknowledged: false,
        code: isGigagoError(error) ? error.code : "INVALID_WEBHOOK",
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý Gigago webhook.",
      },
      {
        status: errorStatus(error),
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

export async function GET() {
  const config = getGigagoConfig();

  return NextResponse.json(
    {
      service: "YSim Gigago fulfillment webhook",
      status: "ready",
      environment: config.environment,
      method: "POST",
      authentication: "callback-url-token",
      providerSignatureAvailable: false,
      authoritativeReconciliation: true,
      automaticCustomerDelivery: false,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
