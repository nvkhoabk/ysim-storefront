import type {
  CartLineItemViewModel,
  CartTotalsViewModel,
} from "@/types/view-models/cart-refactor";

export type CheckoutPaymentMethodId =
  | "gpay"
  | "onepay"
  | "manual";

export type CheckoutPaymentMethodIcon =
  | "qr"
  | "card"
  | "bank";

export interface CheckoutPaymentMethodViewModel {
  id:
    CheckoutPaymentMethodId;
  label: string;
  description: string;
  badge?: string;
  icon:
    CheckoutPaymentMethodIcon;
  enabled: boolean;
}

export interface CheckoutPageViewModel {
  lines:
    readonly CartLineItemViewModel[];
  totals:
    CartTotalsViewModel;
  paymentMethods:
    readonly CheckoutPaymentMethodViewModel[];
  initialPaymentMethod:
    CheckoutPaymentMethodId;
  termsLabel: string;
  privacyLabel: string;
  supportText: string;
}

export interface CheckoutCustomerFormState {
  fullName: string;
  email: string;
  phone: string;
}

export interface CheckoutRecipientFormState {
  sendToAnotherPerson: boolean;
  fullName: string;
  email: string;
}

export interface CheckoutFormErrors {
  customerFullName?: string;
  customerEmail?: string;
  customerPhone?: string;
  recipientFullName?: string;
  recipientEmail?: string;
  paymentMethod?: string;
  acceptTerms?: string;
}

export interface CheckoutSubmitPreview {
  orderCode: string;
  customerEmail: string;
  recipientEmail: string;
  paymentMethod:
    CheckoutPaymentMethodId;
  total: number;
}
