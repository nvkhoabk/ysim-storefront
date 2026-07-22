import type {
  PaymentProviderId,
  PaymentSession,
} from "@/features/payments/payment.types";

import type {
  CheckoutOrderHandoff,
} from "@/types/view-models/checkout-route-candidate";

import type {
  PaymentResultPageViewModel,
  PaymentResultStatus,
} from "@/types/view-models/payment-result";

export interface VerifiedPaymentOrderSummary {
  orderId: number;
  orderNumber: string;
  status: string;
  amount: number;
  currency: string;
  customerEmailMasked: string;
}

export interface VerifiedPaymentCreateResponse {
  session:
    PaymentSession;
  order:
    VerifiedPaymentOrderSummary;
}

export interface PaymentCandidateConfigViewModel {
  title: string;
  description: string;
  enabledProviders:
    readonly PaymentProviderId[];
  payableStatuses:
    readonly string[];
  resultPath: string;
  diagnostics:
    readonly {
      label: string;
      status:
        | "live"
        | "ready"
        | "warning";
      statusLabel: string;
      message: string;
    }[];
}

export interface PaymentCandidateStoredSession {
  handoff:
    CheckoutOrderHandoff;
  session:
    PaymentSession;
  order:
    VerifiedPaymentOrderSummary;
  savedAt: string;
}

export interface PaymentCandidateStateViewModel {
  status:
    PaymentResultStatus;
  resultPage:
    PaymentResultPageViewModel;
}
