import { NextResponse } from "next/server";

import {
  authorizeGPaySandboxRequest,
  getSandboxSecretHeaderName,
  isGPaySandboxEnvironment,
} from "@/features/payments/gpay/gpay.sandbox-auth";
import { getGPayAccessToken } from "@/features/payments/gpay/gpay.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStoreJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(request: Request) {
  if (!isGPaySandboxEnvironment()) {
    return noStoreJson(
      {
        success: false,
        message: "Not found.",
      },
      404,
    );
  }

  if (!authorizeGPaySandboxRequest(request)) {
    console.warn("Unauthorized GPay sandbox token test request", {
      receivedAt: new Date().toISOString(),
      forwardedFor: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return noStoreJson(
      {
        success: false,
        message: "Unauthorized.",
        requiredHeader: getSandboxSecretHeaderName(),
      },
      401,
    );
  }

  try {
    const accessToken = await getGPayAccessToken();

    /*
     * Chỉ xác nhận token đã được cấp.
     * Không trả token hoặc token preview cho client.
     */
    console.info("GPay sandbox token test succeeded", {
      testedAt: new Date().toISOString(),
    });

    return noStoreJson(
      {
        success: true,
        environment: "sandbox",
        tokenAvailable: accessToken.length > 0,
        message: "GPay access token was obtained successfully.",
        testedAt: new Date().toISOString(),
      },
      200,
    );
  } catch (error) {
    console.error("GPay sandbox token test failed", {
      testedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return noStoreJson(
      {
        success: false,
        environment: "sandbox",
        message: "Cannot obtain GPay access token.",
      },
      502,
    );
  }
}
