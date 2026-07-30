// F07A-3E_PAYMENT_EXECUTION_READINESS_GATE_CANDIDATE_R1

import type { SupportedQuoteCurrency } from "../currency/currency-quote.types";
import type {
  CandidatePaymentProviderKey,
  PaymentProviderAssignmentPolicyResult,
  ProviderAdapterState,
} from "./payment-provider-assignment.types";

export type PaymentExecutionReadinessView =
  "readiness" | "blockers" | "activation-draft" | "audit";

export type PaymentExecutionGateKey =
  | "provider-assignment"
  | "runtime-adapter"
  | "credential-evidence"
  | "callback-contract"
  | "idempotency-evidence"
  | "reconciliation-evidence"
  | "manual-approval";

export type PaymentExecutionGateStatus = "passed" | "blocked" | "not-evaluated";

export type PaymentExecutionEvidenceCode =
  | "f07a-3d-assignment-matched"
  | "runtime-provider-registered"
  | "adapter-disabled"
  | "adapter-missing"
  | "not-evaluated-in-preview"
  | "manual-approval-required";

export type PaymentExecutionBlockReason =
  | "operational-evidence-not-verified"
  | "adapter-disabled"
  | "adapter-missing"
  | "manual-approval-required";

export type PaymentExecutionReadinessStatus =
  | "blocked-operational-verification"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentExecutionReadinessAuditStatus = "matched" | "mismatch";

export interface PaymentExecutionGateResult {
  readonly key: PaymentExecutionGateKey;
  readonly required: true;
  readonly status: PaymentExecutionGateStatus;
  readonly evidence: PaymentExecutionEvidenceCode;
  readonly blockReason: PaymentExecutionBlockReason | null;
}

export interface PaymentActivationDraftCandidate {
  readonly status: "blocked-preview-only";
  readonly providerKey: CandidatePaymentProviderKey;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
  readonly productionEligible: false;
  readonly executionEligible: false;
}

export interface PaymentExecutionReadinessResult {
  readonly schemaVersion: "f07a-3e-r1";
  readonly readinessId: string;
  readonly purpose: "ui-preview-only";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly providerAssignmentPolicy: PaymentProviderAssignmentPolicyResult;
  readonly readinessStatus: PaymentExecutionReadinessStatus;
  readonly gates: readonly PaymentExecutionGateResult[];
  readonly blockers: readonly PaymentExecutionGateResult[];
  readonly activationDraft: PaymentActivationDraftCandidate;
}

export interface PaymentExecutionReadinessObservation {
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly snapshotFingerprint: string;
  readonly readinessStatus: PaymentExecutionReadinessStatus;
  readonly activationTokenCreated: boolean;
  readonly providerRequestCreated: boolean;
  readonly settlementInstructionCreated: boolean;
  readonly registryMutationCreated: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentExecutionReadinessAuditChecks {
  readonly providerAssignmentAuditMatched: boolean;
  readonly providerKeyMatches: boolean;
  readonly adapterStateMatches: boolean;
  readonly providerCurrencyMatches: boolean;
  readonly providerAmountMatches: boolean;
  readonly snapshotFingerprintMatches: boolean;
  readonly readinessStatusMatches: boolean;
  readonly requiredGateSetMatches: boolean;
  readonly operationalEvidenceRemainsUnverified: boolean;
  readonly originalPaymentDraftRemainsUnassigned: boolean;
  readonly activationArtifactsNotCreated: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentExecutionReadinessAudit {
  readonly auditId: string;
  readonly readinessId: string;
  readonly status: PaymentExecutionReadinessAuditStatus;
  readonly checks: PaymentExecutionReadinessAuditChecks;
}
