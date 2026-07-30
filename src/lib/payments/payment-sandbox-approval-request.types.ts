// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1

import type { SupportedQuoteCurrency } from "../currency/currency-quote.types";
import type {
  PaymentEvidenceVerificationResult,
  PaymentEvidenceVerificationStatus,
} from "./payment-evidence-verification.types";
import type {
  CandidatePaymentProviderKey,
  ProviderAdapterState,
} from "./payment-provider-assignment.types";

export type PaymentSandboxApprovalRequestView =
  "request" | "prerequisites" | "approval-draft" | "audit";

export type PaymentSandboxApprovalRequestStatus =
  | "blocked-pending-verification-decision"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentSandboxApprovalPrerequisiteKey =
  | "independent-review-complete"
  | "verification-decision-issued"
  | "reviewer-attestation-recorded"
  | "manual-approval-authorized";

export type PaymentSandboxApprovalPrerequisiteStatus =
  "pending" | "blocked-adapter-disabled" | "blocked-adapter-missing";

export interface PaymentSandboxApprovalPrerequisite {
  readonly key: PaymentSandboxApprovalPrerequisiteKey;
  readonly status: PaymentSandboxApprovalPrerequisiteStatus;
  readonly satisfied: false;
  readonly reason: string;
}

export interface PaymentSandboxApprovalDraft {
  readonly status: "prepared-not-submitted";
  readonly requestPacketPrepared: true;
  readonly approvalRequestSubmitted: false;
  readonly approvalDecisionCreated: false;
  readonly reviewerAttestationCreated: false;
  readonly approverIdentityCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
  readonly productionEligible: false;
  readonly executionEligible: false;
}

export interface PaymentSandboxApprovalRequestResult {
  readonly schemaVersion: "f07a-3h-r1";
  readonly requestId: string;
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly verificationReview: PaymentEvidenceVerificationResult;
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly upstreamVerificationStatus: PaymentEvidenceVerificationStatus;
  readonly requestStatus: PaymentSandboxApprovalRequestStatus;
  readonly prerequisites: readonly PaymentSandboxApprovalPrerequisite[];
  readonly blockers: readonly string[];
  readonly requestFingerprint: string;
  readonly approvalDraft: PaymentSandboxApprovalDraft;
}

export interface PaymentSandboxApprovalRequestObservation {
  readonly providerKey: CandidatePaymentProviderKey;
  readonly adapterState: ProviderAdapterState;
  readonly providerCurrency: SupportedQuoteCurrency;
  readonly providerAmountMinor: bigint;
  readonly snapshotFingerprint: string;
  readonly evidenceBundleFingerprint: string;
  readonly verificationFingerprint: string;
  readonly requestStatus: PaymentSandboxApprovalRequestStatus;
  readonly requestFingerprint: string;
  readonly prerequisiteKeys: readonly PaymentSandboxApprovalPrerequisiteKey[];
  readonly reviewerIdentityPresent: boolean;
  readonly verificationDecisionCreated: boolean;
  readonly approvalRequestSubmitted: boolean;
  readonly approvalDecisionCreated: boolean;
  readonly approverIdentityCreated: boolean;
  readonly approvalTokenCreated: boolean;
  readonly activationTokenCreated: boolean;
  readonly providerRequestCreated: boolean;
  readonly settlementInstructionCreated: boolean;
  readonly registryMutationCreated: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxApprovalRequestAuditChecks {
  readonly verificationAuditMatched: boolean;
  readonly providerKeyMatches: boolean;
  readonly adapterStateMatches: boolean;
  readonly providerCurrencyMatches: boolean;
  readonly providerAmountMatches: boolean;
  readonly snapshotFingerprintMatches: boolean;
  readonly evidenceBundleFingerprintMatches: boolean;
  readonly verificationFingerprintMatches: boolean;
  readonly requestStatusMatches: boolean;
  readonly requestFingerprintMatches: boolean;
  readonly prerequisiteKeySetMatches: boolean;
  readonly prerequisitesRemainUnsatisfied: boolean;
  readonly reviewerIdentityAbsent: boolean;
  readonly verificationDecisionAbsent: boolean;
  readonly approvalRequestNotSubmitted: boolean;
  readonly approvalDecisionAbsent: boolean;
  readonly approverIdentityAbsent: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly upstreamVerificationRemainsBlocked: boolean;
  readonly originalPaymentBindingRemainsUnassigned: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxApprovalRequestAudit {
  readonly auditId: string;
  readonly requestId: string;
  readonly status: "matched" | "mismatch";
  readonly checks: PaymentSandboxApprovalRequestAuditChecks;
}
