import {
  createPublicKey,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  getGPayProviderPublicKeyPem,
  isGPayError,
} from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(
  request: Request,
): boolean {
  const expected =
    process.env.GPAY_SANDBOX_TEST_API_KEY?.trim();

  return Boolean(
    expected &&
      request.headers
        .get("x-ysim-test-key")
        ?.trim() === expected,
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
            "Không được phép kiểm tra public key GPay.",
        },
      },
      {
        status: 401,
      },
    );
  }

  try {
    const pem =
      await getGPayProviderPublicKeyPem();

    const key = createPublicKey(pem);

    const details =
      key.asymmetricKeyDetails;

    return NextResponse.json({
      success: true,

      keyType:
        key.asymmetricKeyType,

      modulusLength:
        details &&
        "modulusLength" in details
          ? details.modulusLength
          : null,

      publicExponent:
		typeof details?.publicExponent === "bigint"
    		? details.publicExponent.toString()
	    	: null,
    });

  } catch (error) {
    console.error(
      "GPay provider public key test failed:",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Không thể kiểm tra public key GPay.",
          debug:
            process.env.GPAY_ENVIRONMENT === "sandbox" &&
            error instanceof Error
              ? error.message
              : undefined,
        },
      },
      {
        status: 500,
      },
    );
  }



}
