// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1

import type { SupportedQuoteCurrency } from "../currency/currency-quote.types";
import type {
  PaymentOperationalEvidenceKey,
  PaymentOperationalEvidenceRecordStatus,
  PaymentOperationalEvidenceResult,
} from "./payment-operational-evidence.types";
import type {
  CandidatePaymentProviderKey,
  ProviderAdapterState,
} from "./payment-provider-assignment.types";

export type PaymentEvidenceVerificationView =
  "review-queue" | "checklist" | "decision-draft" | "audit";

export type PaymentEvidenceVerificationItemStatus =
  | "pending-independent-review"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentEvidenceVerificationStatus =
  | "blocked-pending-independent-review"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentEvidenceVerificationReviewMethod =
  "manual-non-secret-reference-review";
export type PaymentEvidenceVerificationReviewerRole =
  "independent-operator-required";

export interface PaymentEvidenceVerificationItem {
  readonly key: PaymentOperationalEvidenceKey;
  readonly environment: "sandbox";
  readonly evidenceRecordStatus: PaymentOperationalEvidenceRecordStatus;
  readonly status: PaymentEvidenceVerificationItemStatus;
  readonly referenceId: string | null;
  readonly referenceFingerprint: string | null;
  readonly evidenceBundleFingerprint: string;
  readonly containsSecret: false;
  readonly reviewerRole: PaymentEvidenceVerificationReviewerRole;
  readonly reviewMethod: PaymentEvidenceVerificationReviewMethod;
  readonly reviewerId: null;
  readonly reviewedAt: null;
  readonly verificationApproved: false;
  readonly rejectionRecorded: false;
  readonly decisionReason: null;
}

export interface PaymentEvidenceVerificationDecisionDraft {
  readonly status: "not-created-preview-only";
  readonly verificationDecisionCreated: false;
  readonly reviewerAttestationCreated: false;
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
  readonly productionEligible: false;
  readonly executionEligible: false;
}

export interface PaymentEvidenceVerificationResult {
  readonly schemaVersion: "f07a-3g-r1";
  readonly verificationId: string;
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly evidenceManifest: PaymentOperationalEvidenceResult;
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly verificationStatus: PaymentEvidenceVerificationStatus;
  readonly items: readonly PaymentEvidenceVerificationItem[];
  readonly verificationFingerprint: string;
  readonly blockers: readonly string[];
  readonly decisionDraft: PaymentEvidenceVerificationDecisionDraft;
}

export interface PaymentEvidenceVerificationObservation {
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly snapshotFingerprint: string;
  readonly evidenceBundleFingerprint: string;
  readonly verificationStatus: PaymentEvidenceVerificationStatus;
  readonly verificationFingerprint: string;
  readonly itemFingerprints: readonly (string | null)[];
  readonly reviewerId: string | null;
  readonly reviewedAt: string | null;
  readonly verificationDecisionCreated: boolean;
  readonly reviewerAttestationCreated: boolean;
  readonly approvalCreated: boolean;
  readonly approvalTokenCreated: boolean;
  readonly activationTokenCreated: boolean;
  readonly providerRequestCreated: boolean;
  readonly settlementInstructionCreated: boolean;
  readonly registryMutationCreated: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentEvidenceVerificationAuditChecks {
  readonly operationalEvidenceAuditMatched: boolean;
  readonly providerKeyMatches: boolean;
  readonly adapterStateMatches: boolean;
  readonly providerCurrencyMatches: boolean;
  readonly providerAmountMatches: boolean;
  readonly snapshotFingerprintMatches: boolean;
  readonly evidenceBundleFingerprintMatches: boolean;
  readonly verificationStatusMatches: boolean;
  readonly requiredEvidenceKeySetMatches: boolean;
  readonly itemReferencesPreserved: boolean;
  readonly itemFingerprintsMatch: boolean;
  readonly itemsAreSandboxScoped: boolean;
  readonly itemsContainNoSecrets: boolean;
  readonly reviewerIdentityAbsent: boolean;
  readonly verificationDecisionRemainsPending: boolean;
  readonly originalEvidenceRemainsUnverified: boolean;
  readonly originalReadinessRemainsBlocked: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentEvidenceVerificationAudit {
  readonly auditId: string;
  readonly verificationId: string;
  readonly status: "matched" | "mismatch";
  readonly checks: PaymentEvidenceVerificationAuditChecks;
}
