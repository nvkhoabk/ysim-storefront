import {
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  lookupSecureOrderResult,
  SecureOrderLookupError,
} from "@/features/orders/candidate/secure-order-result-mapper";

const schema =
  z.object({
    orderId:
      z.number()
        .int()
        .positive(),
    orderKey:
      z.string()
        .trim()
        .min(8)
        .max(200),
  });

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request
        .json();

    const parsed =
      schema.safeParse(
        body,
      );

    if (
      !parsed.success
    ) {
      return NextResponse.json(
        {
          message:
            "Không thể xác minh quyền truy cập đơn hàng.",
        },
        {
          status:
            404,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    const result =
      await lookupSecureOrderResult({
        orderId:
          parsed.data
            .orderId,
        orderKey:
          parsed.data
            .orderKey,
      });

    return NextResponse.json(
      result,
      {
        headers: {
          "Cache-Control":
            "no-store, private",
        },
      },
    );
  } catch (
    error
  ) {
    if (
      error instanceof
      SecureOrderLookupError
    ) {
      return NextResponse.json(
        {
          message:
            "Không thể xác minh quyền truy cập đơn hàng.",
        },
        {
          status:
            404,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    console.error(
      "Secure Order Candidate lookup failed.",
    );

    return NextResponse.json(
      {
        message:
          "Không thể tải thông tin đơn hàng.",
      },
      {
        status:
          500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
