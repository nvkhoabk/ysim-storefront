import { getPaymentProvider } from "./payment.registry";
import type {
  CreatePaymentInput,
  PaymentProviderId,
  PaymentSession,
} from "./payment.types";

export async function createPaymentSession(
  providerId: PaymentProviderId,
  input: CreatePaymentInput,
): Promise<PaymentSession> {
  const provider = getPaymentProvider(providerId);

  const session = await provider.createPayment(input);

  /*
   * Bước tiếp theo sẽ lưu các metadata này vào WooCommerce:
   *
   * _ysim_payment_provider
   * _ysim_payment_status
   * _ysim_merchant_transaction_id
   * _ysim_provider_transaction_id
   * _ysim_payment_expires_at
   */

  return session;
}
