// F07A-3K_PAYMENT_SANDBOX_REVIEWER_ATTESTATION_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxReviewerAttestationView =
  "attestation" | "eligibility" | "attestation-envelope" | "audit";

export type PaymentSandboxReviewerAttestationStatus =
  | "prepared-not-signed"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentSandboxReviewerAttestationItemStatus =
  | "attestation-prepared-preview-only"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxReviewerAttestationEligibility {
  readonly assignmentAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly assignmentPrepared: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly assignmentNotPersisted: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewAttestation: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxReviewerAttestationItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly status: PaymentSandboxReviewerAttestationItemStatus;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly assignmentId: string;
  readonly attestationStatement: "review-packet-inspected-preview-only";
  readonly attestationPrepared: boolean;
  readonly attestationSigned: false;
  readonly attestationPersisted: false;
  readonly reviewedAt: null;
  readonly decision: null;
  readonly decisionReason: null;
}

export interface PaymentSandboxReviewerAttestationEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3k-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    attestationId: string;
    assignmentId: string;
    upstreamAssignmentFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    statement: "review-packet-inspected-preview-only";
    attestationPrepared: boolean;
    attestationSigned: false;
    attestationPersisted: false;
    reviewDecisionCreated: false;
    approvalCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxReviewerAttestationArtifacts {
  readonly assignmentRecordCreated: false;
  readonly reviewerIdentityRecordCreated: false;
  readonly reviewerAttestationRecordCreated: false;
  readonly verificationDecisionCreated: false;
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxReviewerAttestationResult {
  readonly schemaVersion: "f07a-3k-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamAssignmentId: string;
  readonly upstreamAssignmentFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly attestationId: string;
  readonly attestationStatus: PaymentSandboxReviewerAttestationStatus;
  readonly eligibility: PaymentSandboxReviewerAttestationEligibility;
  readonly items: readonly PaymentSandboxReviewerAttestationItem[];
  readonly attestationEnvelope: PaymentSandboxReviewerAttestationEnvelope;
  readonly artifacts: PaymentSandboxReviewerAttestationArtifacts;
}

export interface PaymentSandboxReviewerAttestationObservation {
  readonly upstreamAssignmentFingerprint: string;
  readonly attestationId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly assignmentPersisted: boolean;
  readonly attestationSigned: boolean;
  readonly attestationPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly reviewDecisionPresent: boolean;
  readonly approvalArtifactPresent: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxReviewerAttestationAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly assignmentAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly attestationIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly itemStatusesMatchEligibility: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly assignmentNotPersisted: boolean;
  readonly attestationUnsigned: boolean;
  readonly attestationNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly reviewDecisionAbsent: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxReviewerAttestationAudit {
  readonly schemaVersion: "f07a-3k-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxReviewerAttestationAuditChecks;
}
