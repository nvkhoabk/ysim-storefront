import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getGigagoTestSecret } from "@/lib/fulfillment/gigago";
import {
  getGigagoFulfillmentLifecycle,
  retryGigagoFulfillment,
} from "@/lib/fulfillment/gigago/gigago-fulfillment-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const supplied = request.headers.get("x-ysim-test-secret")?.trim() || "";
  const expected = getGigagoTestSecret();
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

function parseOrderId(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("orderId phải là số nguyên lớn hơn 0.");
  }

  return parsed;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const orderId = parseOrderId(body.orderId);

    if (body.action === "status") {
      return NextResponse.json({
        success: true,
        action: "status",
        result: await getGigagoFulfillmentLifecycle(orderId),
      });
    }

    if (body.action === "retry-fulfillment") {
      return NextResponse.json({
        success: true,
        action: "retry-fulfillment",
        result: await retryGigagoFulfillment({
          orderId,
          mode: body.mode === "demo" ? "demo" : "live",
        }),
      });
    }

    return NextResponse.json(
      { success: false, code: "INVALID_ACTION" },
      { status: 400 },
    );
  } catch (error) {
    const typed = error as Error & { code?: string; status?: number };

    return NextResponse.json(
      {
        success: false,
        code: typed.code ?? "FULFILLMENT_RECOVERY_FAILED",
        message: typed.message,
      },
      { status: typed.status ?? 422 },
    );
  }
}
