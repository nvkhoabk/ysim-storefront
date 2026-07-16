import type { PaymentProvider, PaymentProviderId } from "./payment.types";

import { gpayQrProvider } from "./gpay/gpay.provider";
import { onePayCardProvider } from "./onepay/onepay.provider";
import { cashAgentProvider } from "./cash/cash.provider";

const providerRegistry: Record<PaymentProviderId, PaymentProvider> = {
  gpay_qr: gpayQrProvider,
  onepay_card: onePayCardProvider,
  cash_agent: cashAgentProvider,
};

export function getPaymentProvider(
  providerId: PaymentProviderId,
): PaymentProvider {
  const provider = providerRegistry[providerId];

  if (!provider) {
    throw new Error(`Unsupported payment provider: ${providerId}`);
  }

  return provider;
}
