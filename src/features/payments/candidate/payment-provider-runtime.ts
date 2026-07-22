import {
  getPaymentProvider,
} from "@/features/payments/payment.registry";

import type {
  PaymentProviderId,
} from "@/features/payments/payment.types";

export function parseRegisteredPaymentProviderId(
  value: string,
): PaymentProviderId {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (!normalized) {
    throw new Error(
      "Payment provider is empty.",
    );
  }

  const candidate =
    normalized as
      PaymentProviderId;

  getPaymentProvider(
    candidate,
  );

  return candidate;
}

export function tryParseRegisteredPaymentProviderId(
  value: string,
): PaymentProviderId | undefined {
  try {
    return parseRegisteredPaymentProviderId(
      value,
    );
  } catch {
    return undefined;
  }
}
