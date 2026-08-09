import type {
  CartLineItemViewModel,
  CartTotalsViewModel,
} from "@/types/view-models/cart-refactor";

import type {
  CheckoutPaymentMethodId,
} from "@/types/view-models/checkout-refactor";

export type PaymentResultStatus =
  | "processing"
  | "success"
  | "failed"
  | "pending";

export type PaymentTimelineState =
  | "complete"
  | "current"
  | "upcoming"
  | "error";

export interface PaymentTimelineItemViewModel {
  id: string;
  title: string;
  description?: string;
  timeLabel?: string;
  state:
    PaymentTimelineState;
}

export interface PaymentResultActionViewModel {
  label: string;
  href: string;
  variant:
    | "primary"
    | "secondary";
}

export interface PaymentResultViewModel {
  status:
    PaymentResultStatus;
  statusLabel: string;
  orderCode: string;
  title: string;
  description: string;
  paymentMethodId:
    CheckoutPaymentMethodId;
  paymentMethodLabel: string;
  amount: number;
  customerEmail: string;
  recipientEmail: string;
  createdAtLabel: string;
  providerReference?: string;
  note?: string;
  supportText: string;
  actions:
    readonly PaymentResultActionViewModel[];
  timeline:
    readonly PaymentTimelineItemViewModel[];
}

export interface PaymentResultPageViewModel {
  result:
    PaymentResultViewModel;
}

export interface OrderContactViewModel {
  fullName: string;
  email: string;
  phone?: string;
}

export interface OrderPaymentViewModel {
  methodId:
    CheckoutPaymentMethodId;
  methodLabel: string;
  status:
    PaymentResultStatus;
  statusLabel: string;
  providerReference?: string;
}

export interface OrderResultPageViewModel {
  orderCode: string;
  createdAtLabel: string;
  status:
    PaymentResultStatus;
  statusLabel: string;
  lines:
    readonly CartLineItemViewModel[];
  totals:
    CartTotalsViewModel;
  customer:
    OrderContactViewModel;
  recipient:
    OrderContactViewModel;
  payment:
    OrderPaymentViewModel;
  timeline:
    readonly PaymentTimelineItemViewModel[];
  supportText: string;
}
