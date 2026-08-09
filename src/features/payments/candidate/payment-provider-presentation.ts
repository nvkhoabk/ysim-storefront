import type {
  PaymentProviderId,
} from "@/features/payments/payment.types";

import type {
  CheckoutPaymentMethodId,
} from "@/types/view-models/checkout-refactor";

export type PaymentProviderPresentationKind =
  | "gpay"
  | "onepay"
  | "cash"
  | "other";

export function getPaymentProviderPresentationKind(
  provider:
    PaymentProviderId,
): PaymentProviderPresentationKind {
  const value =
    String(
      provider,
    )
      .trim()
      .toLowerCase();

  if (
    value.startsWith(
      "gpay_gateway_",
    ) ||
    value.startsWith(
      "gpay_",
    )
  ) {
    return "gpay";
  }

  if (
    value.includes(
      "onepay",
    )
  ) {
    return "onepay";
  }

  if (
    value ===
    "cash_agent" ||
    value.includes(
      "manual",
    ) ||
    value.includes(
      "cash",
    )
  ) {
    return "cash";
  }

  return "other";
}

export function getPaymentProviderLabel(
  provider:
    PaymentProviderId,
): string {
  const kind =
    getPaymentProviderPresentationKind(
      provider,
    );

  if (
    kind ===
    "gpay"
  ) {
    return "GPay Gateway";
  }

  if (
    kind ===
    "onepay"
  ) {
    return "OnePay";
  }

  if (
    kind ===
    "cash"
  ) {
    return "Thanh toán tiền mặt";
  }

  return String(
    provider,
  );
}

export function mapPaymentProviderToCheckoutMethod(
  provider:
    PaymentProviderId,
): CheckoutPaymentMethodId {
  const kind =
    getPaymentProviderPresentationKind(
      provider,
    );

  if (
    kind ===
    "gpay"
  ) {
    return "gpay";
  }

  if (
    kind ===
    "onepay"
  ) {
    return "onepay";
  }

  return "manual";
}
