import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  getGigagoConfig,
  getGigagoTestSecret,
  isGigagoError,
} from "@/lib/fulfillment/gigago";
import {
  getGigagoFulfillmentStatus,
  previewGigagoFulfillment,
  submitGigagoFulfillment,
  type GigagoFulfillmentMode,
} from "@/lib/fulfillment/gigago/gigago-fulfillment-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestAction = "preview" | "submit" | "status";

interface TestOrderBody {
  orderId?: unknown;
  action?: unknown;
  mode?: unknown;
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
  const config = getGigagoConfig();

  if (config.environment !== "sandbox") {
    return NextResponse.json(
      { message: "F02 test endpoint chỉ được bật trong sandbox." },
      { status: 404 },
    );
  }

  const suppliedSecret =
    request.headers.get("x-ysim-test-secret")?.trim() || "";
  const expectedSecret = getGigagoTestSecret();

  if (!safeEqual(suppliedSecret, expectedSecret)) {
    return NextResponse.json(
      { message: "Không có quyền chạy Gigago F02 test." },
      { status: 401 },
    );
  }

  return null;
}

function parseOrderId(value: unknown): number {
  const orderId =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("orderId phải là số nguyên lớn hơn 0.");
  }

  return orderId;
}

function parseAction(value: unknown): TestAction {
  if (value === "preview" || value === "submit" || value === "status") {
    return value;
  }

  throw new Error("action phải là preview, submit hoặc status.");
}

function parseMode(value: unknown): GigagoFulfillmentMode {
  if (value === "live" || value === "demo") {
    return value;
  }

  throw new Error("mode phải là live hoặc demo.");
}

function errorResponse(error: unknown): NextResponse {
  console.error("Gigago F02 test failed:", {
    name: error instanceof Error ? error.name : "UnknownError",
    code: isGigagoError(error) ? error.code : undefined,
    message: error instanceof Error ? error.message : String(error),
  });

  return NextResponse.json(
    {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Không thể chạy Gigago F02 test.",
      code: isGigagoError(error) ? error.code : "INVALID_REQUEST",
      details: isGigagoError(error) ? error.details : undefined,
    },
    {
      status:
        isGigagoError(error) && error.status && error.status >= 400
          ? error.status
          : isGigagoError(error)
            ? 422
            : 400,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  try {
    const authorizationError = authorize(request);

    if (authorizationError) {
      return authorizationError;
    }

    const body = (await request.json()) as TestOrderBody;
    const orderId = parseOrderId(body.orderId);
    const action = parseAction(body.action);
    const mode = parseMode(body.mode);

    const result =
      action === "preview"
        ? await previewGigagoFulfillment(orderId, mode)
        : action === "submit"
          ? await submitGigagoFulfillment(orderId, mode)
          : await getGigagoFulfillmentStatus(orderId, mode);

    return NextResponse.json(
      {
        success: true,
        action,
        mode,
        result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: "YSim Gigago F02 protected test order",
      status: "ready",
      supportedActions: ["preview", "submit", "status"],
      supportedModes: ["live", "demo"],
      automaticPaymentTrigger: false,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
