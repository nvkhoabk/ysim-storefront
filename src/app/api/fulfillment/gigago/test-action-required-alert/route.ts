import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getGigagoConfig, getGigagoTestSecret } from "@/lib/fulfillment/gigago";
import {
  ensureGPayActionRequiredAlertMarker,
  getGPayActionRequiredAlertStatus,
} from "@/lib/fulfillment/gigago/gpay-delayed-reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestAction = "request-existing" | "status";

interface TestBody {
  orderId?: unknown;
  action?: unknown;
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
  if (getGigagoConfig().environment !== "sandbox") {
    return NextResponse.json(
      { success: false, code: "SANDBOX_ONLY" },
      { status: 404 },
    );
  }

  const supplied = request.headers.get("x-ysim-test-secret")?.trim() || "";
  const expected = getGigagoTestSecret();

  if (!safeEqual(supplied, expected)) {
    return NextResponse.json(
      { success: false, code: "INVALID_TEST_SECRET" },
      { status: 401 },
    );
  }

  return null;
}

function positiveOrderId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function actionValue(value: unknown): TestAction | null {
  return value === "request-existing" || value === "status" ? value : null;
}

export async function GET() {
  return NextResponse.json(
    {
      service: "YSim F05.1B3 supplier action-required alert test",
      status: "ready",
      contractVersion: "f05.1b3-supplier-action-required-v1",
      sandboxOnly: true,
      returnsSensitiveData: false,
      actions: ["request-existing", "status"],
    },
    {
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

    const body = (await request.json()) as TestBody;
    const orderId = positiveOrderId(body.orderId);
    const action = actionValue(body.action);

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, code: "INVALID_TEST_REQUEST" },
        { status: 400 },
      );
    }

    const result =
      action === "request-existing"
        ? await ensureGPayActionRequiredAlertMarker(orderId)
        : await getGPayActionRequiredAlertStatus(orderId);

    return NextResponse.json({
      success: true,
      protectedTest: true,
      action,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "F05_1B3_TEST_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    );
  }
}
