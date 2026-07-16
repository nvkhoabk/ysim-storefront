export type PaymentProviderId = "gpay_qr" | "onepay_card" | "cash_agent";

export type PaymentStatus =
  | "created"
  | "waiting"
  | "redirect_required"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "manual_review";

export interface CreatePaymentInput {
  orderId: number;
  orderNumber: string;
  orderKey: string;

  amount: number;
  currency: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  description: string;
  clientIp?: string;
}

export interface QrPaymentData {
  image?: string;
  content?: string;
  accountNumber?: string;
  accountName?: string;
  provider?: string;
}

export interface PaymentSession {
  provider: PaymentProviderId;
  status: PaymentStatus;

  orderId: number;
  orderNumber: string;

  merchantTransactionId: string;
  providerTransactionId?: string;

  amount: number;
  currency: string;

  redirectUrl?: string;
  qr?: QrPaymentData;

  expiresAt?: string;
  message?: string;
}

export interface ConfirmPaymentInput {
  orderId: number;
  providerTransactionId: string;
  amount: number;
  currency: string;
  rawPayload?: unknown;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;

  createPayment(input: CreatePaymentInput): Promise<PaymentSession>;

  queryPayment?(session: PaymentSession): Promise<PaymentSession>;
}

export interface PaymentMethodOption {
  id: PaymentProviderId;
  title: string;
  description: string;
}
