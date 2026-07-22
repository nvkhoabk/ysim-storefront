import type {
  WooCommerceCart,
} from "@/lib/woocommerce/cart-types";

import type {
  WooCommerceCheckout,
} from "@/features/checkout/checkout.types";

import type {
  PaymentMethodOption,
  PaymentProviderId,
} from "@/features/payments/payment.types";

export interface CheckoutCandidateApiResponse {
  cart:
    WooCommerceCart;
  checkout:
    WooCommerceCheckout;
  paymentMethods:
    readonly PaymentMethodOption[];
}

export interface CheckoutCandidateSubmitResponse {
  checkout:
    WooCommerceCheckout;
  selectedPaymentProvider:
    PaymentProviderId;
}

export interface CheckoutCandidateFormState {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  purchaseFor:
    | "self"
    | "gift";
  recipientName: string;
  recipientEmail: string;
  paymentMethod:
    PaymentProviderId;
  customerNote: string;
  acceptTerms: boolean;
}

export interface CheckoutCandidateFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  recipientName?: string;
  recipientEmail?: string;
  paymentMethod?: string;
  acceptTerms?: string;
  submit?: string;
}

export interface CheckoutOrderHandoff {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  orderStatus: string;
  provider:
    PaymentProviderId;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientEmail: string;
  createdAt: string;
}

export type CheckoutCandidateDiagnosticStatus =
  | "live"
  | "ready"
  | "warning";

export interface CheckoutCandidateDiagnosticViewModel {
  domain:
    | "cart"
    | "order"
    | "payment-selection"
    | "payment-handoff"
    | "idempotency"
    | "payment";
  label: string;
  status:
    CheckoutCandidateDiagnosticStatus;
  statusLabel: string;
  message: string;
}

export interface CheckoutRouteCandidateViewModel {
  title: string;
  description: string;
  defaultCountry: string;
  handoffMode: string;
  diagnostics:
    readonly CheckoutCandidateDiagnosticViewModel[];
}
