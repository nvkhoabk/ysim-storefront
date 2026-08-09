import type {
  PaymentProviderId,
} from "@/features/payments/payment.types";

import type {
  VerifiedPaymentCreateResponse,
} from "@/types/view-models/payment-route-candidate";

interface ApiErrorBody {
  message?: string;
}

export async function createVerifiedPaymentCandidate({
  provider,
  orderId,
  orderKey,
}: {
  provider:
    PaymentProviderId;
  orderId: number;
  orderKey: string;
}): Promise<
  VerifiedPaymentCreateResponse
> {
  const response =
    await fetch(
      "/api/ui-preview/payments/create",
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            provider,
            orderId,
            orderKey,
          }),
      },
    );

  const body =
    await response
      .json()
      .catch(
        () => null,
      );

  if (!response.ok) {
    const message =
      body &&
      typeof body ===
        "object" &&
      "message" in
        body
        ? String(
            (
              body as
                ApiErrorBody
            ).message ||
            "",
          )
        : "";

    throw new Error(
      message ||
      `Payment candidate error ${response.status}`,
    );
  }

  return body as
    VerifiedPaymentCreateResponse;
}
