import type {
  CheckoutCandidateApiResponse,
  CheckoutCandidateFormState,
  CheckoutCandidateSubmitResponse,
} from "@/types/view-models/checkout-route-candidate";

interface ApiErrorBody {
  message?: string;
  issues?: unknown;
}

async function readJson<T>(
  response: Response,
): Promise<T> {
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
      `Checkout API error ${response.status}`,
    );
  }

  return body as T;
}

export async function loadCheckoutCandidate():
  Promise<
    CheckoutCandidateApiResponse
  > {
  return readJson(
    await fetch(
      "/api/checkout",
      {
        cache:
          "no-store",
      },
    ),
  );
}

export async function submitCheckoutCandidate(
  form:
    CheckoutCandidateFormState,
): Promise<
  CheckoutCandidateSubmitResponse
> {
  return readJson(
    await fetch(
      "/api/checkout",
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify(
            form,
          ),
      },
    ),
  );
}
