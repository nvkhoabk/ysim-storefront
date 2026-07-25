import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  getGPayDelayedReconciliationStatus,
  getGPayReconciliationRetryDelaysSeconds,
  isGPayDelayedReconciliationEnabled,
  processGPayDelayedReconciliation,
} from "@/lib/fulfillment/gigago/gpay-delayed-reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}.`);
  }

  return value;
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
  const supplied =
    request.headers.get("x-ysim-reconciliation-secret")?.trim() || "";
  const expected = requiredEnvironment("GPAY_RECONCILIATION_SECRET");

  if (!safeEqual(supplied, expected)) {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_RECONCILIATION_SECRET",
      },
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

export async function POST(request: Request) {
  try {
    const authorizationError = authorize(request);

    if (authorizationError) {
      return authorizationError;
    }

    const body = (await request.json()) as {
      orderId?: unknown;
      action?: unknown;
      force?: unknown;
    };
    const orderId = positiveOrderId(body.orderId);
    const action = body.action;

    if (!orderId || (action !== "status" && action !== "process")) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_RECONCILIATION_REQUEST",
        },
        { status: 400 },
      );
    }

    const result =
      action === "status"
        ? await getGPayDelayedReconciliationStatus(orderId)
        : await processGPayDelayedReconciliation(orderId, {
            force: body.force === true,
          });

    return NextResponse.json(
      {
        success: true,
        action,
        result,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "RECONCILIATION_OPERATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "GPay reconciliation operation failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "YSim GPay delayed reconciliation operator",
    status: "ready",
    authentication: "x-ysim-reconciliation-secret",
    enabled: isGPayDelayedReconciliationEnabled(),
    retryDelaysSeconds: getGPayReconciliationRetryDelaysSeconds(),
  });
}
