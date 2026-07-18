import {
  PaymentError,
} from "./errors";

import type {
  PaymentProvider,
  PaymentProviderId,
} from "./types";

const paymentProviders = new Map<
  PaymentProviderId,
  PaymentProvider
>();

export function registerPaymentProvider(
  provider: PaymentProvider,
): void {
  paymentProviders.set(
    provider.id,
    provider,
  );
}

export function unregisterPaymentProvider(
  providerId: PaymentProviderId,
): void {
  paymentProviders.delete(providerId);
}

export function getPaymentProvider(
  providerId: PaymentProviderId,
): PaymentProvider {
  const provider =
    paymentProviders.get(providerId);

  if (!provider) {
    throw new PaymentError({
      code: "PROVIDER_NOT_FOUND",
      providerId,
      message:
        `Payment provider "${providerId}" chưa được đăng ký.`,
    });
  }

  if (!provider.enabled) {
    throw new PaymentError({
      code: "PROVIDER_DISABLED",
      providerId,
      message:
        `Payment provider "${providerId}" hiện đang bị tắt.`,
    });
  }

  return provider;
}

export function listPaymentProviders(): PaymentProvider[] {
  return Array.from(
    paymentProviders.values(),
  );
}

export function clearPaymentProviders(): void {
  paymentProviders.clear();
}