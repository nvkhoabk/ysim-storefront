import type { PaymentProvider, PaymentProviderId } from "./payment.types";

import { cashAgentProvider } from "./cash/cash.provider";
import {
  gpayGatewayAllProvider,
  gpayGatewayAtmProvider,
  gpayGatewayCardProvider,
  gpayGatewayQrProvider,
} from "./gpay/gpay.provider";

const providerRegistry: Record<PaymentProviderId, PaymentProvider> = {
  gpay_gateway_all: gpayGatewayAllProvider,
  gpay_gateway_card: gpayGatewayCardProvider,
  gpay_gateway_atm: gpayGatewayAtmProvider,
  gpay_gateway_qr: gpayGatewayQrProvider,
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
