import type {
  SecureOrderLookupResponse,
} from "@/types/view-models/order-route-candidate";

interface ApiErrorBody {
  message?: string;
}

export async function lookupSecureOrderCandidate({
  orderId,
  orderKey,
}: {
  orderId: number;
  orderKey: string;
}): Promise<
  SecureOrderLookupResponse
> {
  const response =
    await fetch(
      "/api/ui-preview/orders/lookup",
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
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
      "Không thể xác minh quyền truy cập đơn hàng.",
    );
  }

  return body as
    SecureOrderLookupResponse;
}
