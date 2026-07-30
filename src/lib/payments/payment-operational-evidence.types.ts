// F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1

import type { SupportedQuoteCurrency } from "../currency/currency-quote.types";
import type {
  PaymentExecutionReadinessResult,
  PaymentExecutionReadinessStatus,
} from "./payment-execution-readiness.types";
import type {
  CandidatePaymentProviderKey,
  ProviderAdapterState,
} from "./payment-provider-assignment.types";

export type PaymentOperationalEvidenceView =
  "evidence" | "matrix" | "approval-draft" | "audit";

export type PaymentOperationalEvidenceKey =
  | "credential-evidence"
  | "callback-contract"
  | "idempotency-evidence"
  | "reconciliation-evidence";

export type PaymentOperationalEvidenceRecordStatus =
  | "captured-unverified"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentOperationalEvidenceSourceKind =
  "candidate-reference" | "adapter-blocker";

export type PaymentOperationalEvidenceStatus =
  | "blocked-evidence-verification"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentOperationalEvidenceRecord {
  readonly key: PaymentOperationalEvidenceKey;
  readonly environment: "sandbox";
  readonly status: PaymentOperationalEvidenceRecordStatus;
  readonly sourceKind: PaymentOperationalEvidenceSourceKind;
  readonly referenceId: string | null;
  readonly referenceFingerprint: string | null;
  readonly containsSecret: false;
  readonly verificationApproved: false;
}

export interface PaymentOperationalEvidenceApprovalDraft {
  readonly status: "not-created-preview-only";
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
  readonly productionEligible: false;
  readonly executionEligible: false;
}

export interface PaymentOperationalEvidenceResult {
  readonly schemaVersion: "f07a-3f-r1";
  readonly manifestId: string;
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly readiness: PaymentExecutionReadinessResult;
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly readinessStatus: PaymentExecutionReadinessStatus;
  readonly evidenceStatus: PaymentOperationalEvidenceStatus;
  readonly records: readonly PaymentOperationalEvidenceRecord[];
  readonly bundleFingerprint: string;
  readonly blockers: readonly string[];
  readonly approvalDraft: PaymentOperationalEvidenceApprovalDraft;
}

export interface PaymentOperationalEvidenceObservation {
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly snapshotFingerprint: string;
  readonly readinessStatus: PaymentExecutionReadinessStatus;
  readonly evidenceStatus: PaymentOperationalEvidenceStatus;
  readonly bundleFingerprint: string;
  readonly recordFingerprints: readonly (string | null)[];
  readonly approvalCreated: boolean;
  readonly approvalTokenCreated: boolean;
  readonly activationTokenCreated: boolean;
  readonly providerRequestCreated: boolean;
  readonly settlementInstructionCreated: boolean;
  readonly registryMutationCreated: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentOperationalEvidenceAuditChecks {
  readonly readinessAuditMatched: boolean;
  readonly providerKeyMatches: boolean;
  readonly adapterStateMatches: boolean;
  readonly providerCurrencyMatches: boolean;
  readonly providerAmountMatches: boolean;
  readonly snapshotFingerprintMatches: boolean;
  readonly readinessStatusMatches: boolean;
  readonly evidenceStatusMatches: boolean;
  readonly requiredEvidenceKeySetMatches: boolean;
  readonly recordsAreSandboxScoped: boolean;
  readonly recordsContainNoSecrets: boolean;
  readonly evidenceFingerprintsMatch: boolean;
  readonly evidenceVerificationRemainsPending: boolean;
  readonly originalReadinessRemainsBlocked: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentOperationalEvidenceAudit {
  readonly auditId: string;
  readonly manifestId: string;
  readonly status: "matched" | "mismatch";
  readonly checks: PaymentOperationalEvidenceAuditChecks;
}
