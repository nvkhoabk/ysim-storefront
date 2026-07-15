import { NextResponse } from "next/server";

import { getGPayAccessToken } from "@/features/payments/gpay/gpay.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.GPAY_ENV !== "sandbox") {
    return NextResponse.json(
      {
        message:
          "Token test endpoint is disabled outside sandbox.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const token = await getGPayAccessToken();

    return NextResponse.json({
      success: true,
      tokenReceived: Boolean(token),
      tokenPreview: `${token.slice(0, 6)}...${token.slice(
        -4,
      )}`,
    });
  } catch (error) {
    console.error("GPay token test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Cannot get GPay token.",
      },
      {
        status: 502,
      },
    );
  }
}
