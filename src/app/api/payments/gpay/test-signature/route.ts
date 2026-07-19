import {
  randomUUID,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  buildCreateQrSignatureInput,
  isGPayError,
  signGPayRawInput,
  verifyGPayRawInput,
} from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(
  request: Request,
): boolean {
  const expectedKey =
    process.env
      .GPAY_SANDBOX_TEST_API_KEY
      ?.trim();

  if (!expectedKey) {
    return false;
  }

  return (
    request.headers
      .get("x-ysim-test-key")
      ?.trim() === expectedKey
  );
}

export async function POST(
  request: Request,
) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message:
            "Không được phép gọi API test chữ ký.",
        },
      },
      {
        status: 401,
      },
    );
  }

  try {
    const merchantCode =
      process.env
        .GPAY_QR_MERCHANT_CODE
        ?.trim() ||
      "YSIM_SANDBOX";

    const accountName =
      process.env
        .GPAY_QR_ACCOUNT_NAME
        ?.trim() ||
      "YSIM";

    const rawInput =
      buildCreateQrSignatureInput({
        merchantCode,
        accountName,
        qrType: "DYNAMIC",
        sourceOfFund: "VIETQR",
        billId:
          `SBX${Date.now()}`,
      });

    const signature =
      await signGPayRawInput(
        rawInput,
      );

    const verified =
      await verifyGPayRawInput(
        rawInput,
        signature,
      );

    return NextResponse.json({
      success: verified,
      testId: randomUUID(),
      algorithm: "RSA-SHA256",
      encoding: "base64",
      rawInput,
      signatureLength:
        signature.length,
      verified,
    });
  } catch (error) {
    if (isGPayError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        {
          status: 500,
        },
      );
    }

    console.error(
      "Unexpected GPay signature test error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code:
            "INTERNAL_SERVER_ERROR",
          message:
            "Không thể kiểm tra chữ ký GPay.",
        },
      },
      {
        status: 500,
      },
    );
  }
}
