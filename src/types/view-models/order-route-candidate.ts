import type {
  OrderResultPageViewModel,
} from "@/types/view-models/payment-result";

export interface SecureOrderLookupRequest {
  orderId: number;
  orderKey: string;
}

export interface SecureOrderLookupProof {
  orderId: number;
  orderNumber: string;
  verifiedAt: string;
}

export interface SecureOrderLookupResponse {
  order:
    OrderResultPageViewModel;
  proof:
    SecureOrderLookupProof;
}

export type OrderCandidateDiagnosticStatus =
  | "live"
  | "ready"
  | "warning";

export interface OrderCandidateDiagnosticViewModel {
  label: string;
  status:
    OrderCandidateDiagnosticStatus;
  statusLabel: string;
  message: string;
}

export interface OrderRouteCandidateConfigViewModel {
  title: string;
  description: string;
  diagnostics:
    readonly OrderCandidateDiagnosticViewModel[];
}
