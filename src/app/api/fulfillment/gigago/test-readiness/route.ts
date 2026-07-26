import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getGigagoConfig, getGigagoTestSecret } from "@/lib/fulfillment/gigago";
import {
  checkGigagoFulfillmentReadiness,
  getGigagoReadinessGateMode,
  getGigagoReadinessStatus,
} from "@/lib/fulfillment/gigago/gigago-readiness-gate";
import {
  getGigagoFulfillmentLifecycle,
  retryGigagoFulfillment,
} from "@/lib/fulfillment/gigago/gigago-fulfillment-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorize(request: Request): NextResponse | null {
  if (getGigagoConfig().environment !== "sandbox") {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const supplied = request.headers.get("x-ysim-test-secret")?.trim() || "";

  if (!safeEqual(supplied, getGigagoTestSecret())) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  return null;
}

function orderId(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("orderId phải là số nguyên lớn hơn 0.");
  }

  return parsed;
}

export async function GET() {
  return NextResponse.json({
    service: "YSim F04.3 fulfillment readiness and recovery",
    status: "ready",
    contractVersion: "gigago-readiness-recovery-f04-3-v1",
    gateMode: getGigagoReadinessGateMode(),
    actions: ["check", "status", "lifecycle", "retry-fulfillment"],
    sandboxOnly: true,
  });
}

export async function POST(request: Request) {
  try {
    const authorizationError = authorize(request);
    if (authorizationError) return authorizationError;

    const body = (await request.json()) as Record<string, unknown>;
    const selectedOrderId = orderId(body.orderId);
    const action = body.action;

    if (action === "check") {
      return NextResponse.json({
        success: true,
        action,
        result: await checkGigagoFulfillmentReadiness(selectedOrderId, {
          paymentProvider: "protected-f04.3-test",
          persist: true,
          modeOverride:
            body.mode === "audit" || body.mode === "block"
              ? body.mode
              : "block",
        }),
      });
    }

    if (action === "status") {
      return NextResponse.json({
        success: true,
        action,
        result: await getGigagoReadinessStatus(selectedOrderId),
      });
    }

    if (action === "lifecycle") {
      return NextResponse.json({
        success: true,
        action,
        result: await getGigagoFulfillmentLifecycle(selectedOrderId),
      });
    }

    if (action === "retry-fulfillment") {
      return NextResponse.json({
        success: true,
        action,
        result: await retryGigagoFulfillment({
          orderId: selectedOrderId,
          mode: body.fulfillmentMode === "demo" ? "demo" : "live",
        }),
      });
    }

    return NextResponse.json(
      { success: false, code: "INVALID_ACTION" },
      { status: 400 },
    );
  } catch (error) {
    const typed = error as Error & {
      code?: string;
      status?: number;
      details?: unknown;
    };

    return NextResponse.json(
      {
        success: false,
        code: typed.code ?? "F04_3_TEST_FAILED",
        message: typed.message,
        details: typed.details,
      },
      { status: typed.status ?? 422 },
    );
  }
}
