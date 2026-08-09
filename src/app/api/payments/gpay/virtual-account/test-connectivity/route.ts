import { NextResponse } from "next/server";

import { authorizeGPaySandboxRequest } from "@/features/payments/gpay/gpay.sandbox-auth";
import { probeGPayVAConnectivity } from "@/features/payments/gpay-va/gpay-va.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!authorizeGPaySandboxRequest(request)) {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_TEST_SECRET",
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const result = await probeGPayVAConnectivity();

    return NextResponse.json(
      {
        success: true,
        protectedTest: true,
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
        code: "GPAY_VA_CONNECTIVITY_FAILED",
        message:
          error instanceof Error ? error.message : "Không thể kết nối GPay VA.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: "YSim GPay VA connectivity test",
      status: "ready",
      sandboxOnly: true,
      returnsSensitiveData: false,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
