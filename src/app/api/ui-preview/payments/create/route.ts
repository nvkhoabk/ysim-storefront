import {
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  createPaymentSession,
} from "@/features/payments/payment.service";

import {
  parseRegisteredPaymentProviderId,
} from "@/features/payments/candidate/payment-provider-runtime";

import {
  verifyPaymentOrder,
} from "@/features/payments/candidate/payment-order-verifier";

const schema =
  z.object({
    provider:
      z.string()
        .trim()
        .min(1)
        .max(100),
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
            "Thông tin Payment Candidate không hợp lệ.",
          issues:
            parsed.error
              .flatten(),
        },
        {
          status:
            400,
        },
      );
    }

    const provider =
      parseRegisteredPaymentProviderId(
        parsed.data
          .provider,
      );

    const verified =
      await verifyPaymentOrder({
        orderId:
          parsed.data
            .orderId,
        orderKey:
          parsed.data
            .orderKey,
        provider,
        requestHeaders:
          request.headers,
      });

    const session =
      await createPaymentSession(
        provider,
        verified.input,
      );

    return NextResponse.json(
      {
        session,
        order:
          verified.order,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (
    error
  ) {
    const message =
      error instanceof
        Error
        ? error.message
        : "Không thể khởi tạo Payment Candidate.";

    const forbidden =
      message.includes(
        "not enabled",
      );

    const unauthorized =
      message.includes(
        "order key",
      );

    const unsupported =
      message.includes(
        "Unsupported payment provider",
      );

    return NextResponse.json(
      {
        message,
      },
      {
        status:
          forbidden
            ? 403
            : unauthorized
              ? 401
              : unsupported
                ? 400
                : 500,
      },
    );
  }
}
