import {
  NextResponse,
} from "next/server";

import {
  verifyGPayGatewayCallback,
} from "@/lib/payment/adapters/gpay";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

interface VerifyCallbackRequest {
  queryString?: unknown;
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as
        VerifyCallbackRequest;

    const queryString =
      typeof body.queryString ===
        "string"
        ? body.queryString
        : "";

    const result =
      await verifyGPayGatewayCallback(
        queryString,
      );

    return NextResponse.json(
      {
        success: true,

        verified:
          result.verified,

        verificationStrategy:
          result
            .verificationStrategy,

        normalizedStatus:
          result
            .normalizedStatus,

        callback: {
          embedData:
            result.callback
              .embedData,

          gpayBillId:
            result.callback
              .gpayBillId,

          gpayTransactionId:
            result.callback
              .gpayTransactionId,

          merchantOrderId:
            result.callback
              .merchantOrderId,

          status:
            result.callback
              .status,

          userPaymentMethod:
            result.callback
              .userPaymentMethod,
        },

        parsedEmbedData:
          result.verified
            ? result
                .parsedEmbedData
            : null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Cannot verify GPay Gateway callback:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        verified: false,

        message:
          error instanceof Error
            ? error.message
            : "Không thể xác minh callback GPay.",
      },
      {
        status: 400,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
