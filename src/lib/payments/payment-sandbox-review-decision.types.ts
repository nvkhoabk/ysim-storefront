// F07A-3L_PAYMENT_SANDBOX_REVIEW_DECISION_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxReviewDecisionView =
  "decision" | "eligibility" | "decision-envelope" | "audit";

export type PaymentSandboxReviewDecisionStatus =
  | "prepared-not-issued"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentSandboxReviewDecisionItemStatus =
  | "decision-prepared-preview-only"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentSandboxReviewDecisionOutcome =
  "sandbox-approval-recommended-preview-only";

export interface PaymentSandboxReviewDecisionEligibility {
  readonly attestationAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly attestationPrepared: boolean;
  readonly attestationUnsigned: boolean;
  readonly attestationNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly assignmentNotPersisted: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewDecision: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxReviewDecisionItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly status: PaymentSandboxReviewDecisionItemStatus;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly attestationId: string;
  readonly proposedOutcome: PaymentSandboxReviewDecisionOutcome | null;
  readonly decisionReason: "review-attestation-matched-preview-only";
  readonly decisionPrepared: boolean;
  readonly decisionIssued: false;
  readonly decisionPersisted: false;
  readonly decidedAt: null;
}

export interface PaymentSandboxReviewDecisionEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3l-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    decisionId: string;
    attestationId: string;
    upstreamAttestationFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    proposedOutcome: PaymentSandboxReviewDecisionOutcome | null;
    decisionReason: "review-attestation-matched-preview-only";
    decisionPrepared: boolean;
    decisionIssued: false;
    decisionPersisted: false;
    approvalCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxReviewDecisionArtifacts {
  readonly assignmentRecordCreated: false;
  readonly reviewerIdentityRecordCreated: false;
  readonly reviewerAttestationRecordCreated: false;
  readonly reviewDecisionRecordCreated: false;
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxReviewDecisionResult {
  readonly schemaVersion: "f07a-3l-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamAttestationId: string;
  readonly upstreamAttestationFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly decisionId: string;
  readonly decisionStatus: PaymentSandboxReviewDecisionStatus;
  readonly eligibility: PaymentSandboxReviewDecisionEligibility;
  readonly items: readonly PaymentSandboxReviewDecisionItem[];
  readonly decisionEnvelope: PaymentSandboxReviewDecisionEnvelope;
  readonly artifacts: PaymentSandboxReviewDecisionArtifacts;
}

export interface PaymentSandboxReviewDecisionObservation {
  readonly upstreamAttestationFingerprint: string;
  readonly decisionId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly assignmentPersisted: boolean;
  readonly attestationSigned: boolean;
  readonly attestationPersisted: boolean;
  readonly decisionIssued: boolean;
  readonly decisionPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly approvalArtifactPresent: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxReviewDecisionAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly attestationAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly decisionIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly itemStatusesMatchEligibility: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly assignmentNotPersisted: boolean;
  readonly attestationUnsigned: boolean;
  readonly attestationNotPersisted: boolean;
  readonly decisionNotIssued: boolean;
  readonly decisionNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxReviewDecisionAudit {
  readonly schemaVersion: "f07a-3l-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxReviewDecisionAuditChecks;
}
