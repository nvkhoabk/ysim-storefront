import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  GigagoClient,
  getGigagoConfig,
  getGigagoTestSecret,
  isGigagoError,
} from "@/lib/fulfillment/gigago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function GET(request: Request) {
  try {
    const config = getGigagoConfig();

    if (config.environment !== "sandbox") {
      return NextResponse.json(
        { message: "Endpoint kiểm thử chỉ được bật trong Gigago sandbox." },
        { status: 404 },
      );
    }

    const suppliedSecret =
      request.headers.get("x-ysim-test-secret")?.trim() || "";
    const expectedSecret = getGigagoTestSecret();

    if (!safeEqual(suppliedSecret, expectedSecret)) {
      return NextResponse.json(
        { message: "Không có quyền chạy Gigago connectivity test." },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const planId = url.searchParams.get("planId")?.trim() || "GIGA-DEMO";
    const client = new GigagoClient(config);

    const [balance, packages] = await Promise.all([
      client.getBalance(),
      client.getPackages({}, "vi"),
    ]);

    const matchedPlan =
      packages.find((item) => item.ggg_plan_id === planId) ?? null;

    return NextResponse.json(
      {
        environment: config.environment,
        baseUrl: config.baseUrl,
        balance,
        packageCount: packages.length,
        requestedPlanId: planId,
        matchedPlan: matchedPlan
          ? {
              gggPlanId: matchedPlan.ggg_plan_id,
              name: matchedPlan.name,
              price: matchedPlan.price,
              data: matchedPlan.data,
              validity: matchedPlan.validity,
            }
          : null,
        status: matchedPlan ? "PASS" : "PLAN_NOT_FOUND",
      },
      {
        status: matchedPlan ? 200 : 422,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Gigago connectivity test failed:", {
      name: error instanceof Error ? error.name : "UnknownError",
      code: isGigagoError(error) ? error.code : undefined,
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể kiểm tra kết nối Gigago.",
        code: isGigagoError(error) ? error.code : "UNKNOWN_ERROR",
      },
      {
        status: isGigagoError(error) && error.status ? error.status : 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
