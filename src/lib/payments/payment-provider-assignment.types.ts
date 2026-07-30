// F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1

import type { PaymentProviderId } from "../../features/payments/payment.types";
import type { CurrencyTransactionBinding } from "../currency/currency-transaction-binding.types";
import type { SupportedQuoteCurrency } from "../currency/currency-quote.types";

export type PaymentProviderAssignmentView =
  "policy" | "assignment" | "settlement-draft" | "audit";

export type CandidatePaymentProviderKey =
  "gpay_qr" | "onepay_international_card" | "umoney_wallet";

export type CandidatePaymentRail = "qr" | "international-card" | "wallet";

export type ProviderAdapterState =
  "runtime-registered" | "adapter-disabled" | "adapter-missing";

export type ProviderCompatibilityStatus =
  "compatible-preview" | "blocked-adapter-disabled" | "blocked-adapter-missing";

export type ProviderExecutionBlockReason =
  "preview-only" | "adapter-disabled" | "adapter-missing";

export type ProviderAssignmentAuditStatus = "matched" | "mismatch";

export interface PaymentProviderPolicyRule {
  readonly marketId: "vi-vn" | "en-global" | "lo-la";
  readonly locale: "vi" | "en" | "lo";
  readonly currency: SupportedQuoteCurrency;
  readonly providerKey: CandidatePaymentProviderKey;
  readonly providerLabel: "GPay" | "OnePay" | "uMoney";
  readonly rail: CandidatePaymentRail;
  readonly runtimeProviderId: PaymentProviderId | null;
  readonly adapterState: ProviderAdapterState;
  readonly compatibility: ProviderCompatibilityStatus;
  readonly executionBlockReason: ProviderExecutionBlockReason;
}

export interface PaymentProviderAssignmentCandidate {
  readonly status: "assigned-preview";
  readonly providerKey: CandidatePaymentProviderKey;
  readonly providerLabel: "GPay" | "OnePay" | "uMoney";
  readonly rail: CandidatePaymentRail;
  readonly runtimeProviderId: PaymentProviderId | null;
  readonly adapterState: ProviderAdapterState;
  readonly compatibility: ProviderCompatibilityStatus;
  readonly requestedCurrency: SupportedQuoteCurrency;
  readonly requestedAmountMinor: bigint;
  readonly executionEligible: false;
}

export interface PaymentSettlementDraftCandidate {
  readonly status: "blocked-preview-only";
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly blockReason: ProviderExecutionBlockReason;
}

export interface PaymentProviderAssignmentPolicyResult {
  readonly schemaVersion: "f07a-3d-r1";
  readonly assignmentId: string;
  readonly purpose: "ui-preview-only";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly marketId: "vi-vn" | "en-global" | "lo-la";
  readonly locale: "vi" | "en" | "lo";
  readonly marketCurrency: SupportedQuoteCurrency;
  readonly binding: CurrencyTransactionBinding;
  readonly policyRule: PaymentProviderPolicyRule;
  readonly providerAssignment: PaymentProviderAssignmentCandidate;
  readonly settlementDraft: PaymentSettlementDraftCandidate;
}

export interface PaymentProviderAssignmentObservation {
  readonly marketId: string;
  readonly providerKey: CandidatePaymentProviderKey;
  readonly runtimeProviderId: PaymentProviderId | null;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly snapshotFingerprint: string;
  readonly adapterState: ProviderAdapterState;
  readonly executionEligible: boolean;
}

export interface PaymentProviderAssignmentAuditChecks {
  readonly marketRuleMatches: boolean;
  readonly bindingCurrencyMatches: boolean;
  readonly providerKeyMatches: boolean;
  readonly runtimeProviderMatches: boolean;
  readonly providerCurrencyMatches: boolean;
  readonly providerAmountMatches: boolean;
  readonly snapshotFingerprintMatches: boolean;
  readonly adapterStateMatches: boolean;
  readonly originalPaymentDraftRemainsUnassigned: boolean;
  readonly settlementInstructionNotCreated: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentProviderAssignmentAudit {
  readonly auditId: string;
  readonly assignmentId: string;
  readonly status: ProviderAssignmentAuditStatus;
  readonly checks: PaymentProviderAssignmentAuditChecks;
}
