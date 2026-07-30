// F07A-3J_PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxReviewerAssignmentView =
  "assignment" | "eligibility" | "assignment-envelope" | "audit";

export type PaymentSandboxReviewerAssignmentStatus =
  | "prepared-not-persisted"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export type PaymentSandboxReviewerAssignmentItemStatus =
  | "assigned-preview-only"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxReviewerCandidate {
  readonly role: "independent-sandbox-payment-reviewer";
  readonly queue: "payment-sandbox-independent-review";
  readonly alias: "sandbox-reviewer-fixture";
  readonly identityKind: "opaque-preview-alias";
  readonly source: "fixture-only";
  readonly containsPii: false;
  readonly containsCredential: false;
}

export interface PaymentSandboxReviewerAssignmentEligibility {
  readonly upstreamAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly adapterEligible: boolean;
  readonly handoffPendingManualReview: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewAssignment: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxReviewerAssignmentItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly status: PaymentSandboxReviewerAssignmentItemStatus;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly assignmentPrepared: boolean;
  readonly assignmentPersisted: false;
  readonly reviewedAt: null;
  readonly decision: null;
  readonly attestationCreated: false;
}

export interface PaymentSandboxReviewerAssignmentEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3j-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    assignmentId: string;
    handoffId: string;
    upstreamHandoffFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerRole: "independent-sandbox-payment-reviewer";
    reviewerQueue: "payment-sandbox-independent-review";
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    assignmentPrepared: boolean;
    assignmentPersisted: false;
    reviewDecisionCreated: false;
    reviewerAttestationCreated: false;
    approvalCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxReviewerAssignmentArtifacts {
  readonly assignmentRecordCreated: false;
  readonly reviewerIdentityRecordCreated: false;
  readonly reviewerAttestationCreated: false;
  readonly verificationDecisionCreated: false;
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxReviewerAssignmentResult {
  readonly schemaVersion: "f07a-3j-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamHandoffId: string;
  readonly upstreamHandoffFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly assignmentId: string;
  readonly assignmentStatus: PaymentSandboxReviewerAssignmentStatus;
  readonly reviewerCandidate: PaymentSandboxReviewerCandidate;
  readonly eligibility: PaymentSandboxReviewerAssignmentEligibility;
  readonly items: readonly PaymentSandboxReviewerAssignmentItem[];
  readonly assignmentEnvelope: PaymentSandboxReviewerAssignmentEnvelope;
  readonly artifacts: PaymentSandboxReviewerAssignmentArtifacts;
}

export interface PaymentSandboxReviewerAssignmentObservation {
  readonly upstreamHandoffFingerprint: string;
  readonly assignmentId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly assignmentPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly reviewDecisionPresent: boolean;
  readonly reviewerAttestationPresent: boolean;
  readonly approvalArtifactPresent: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxReviewerAssignmentAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly upstreamAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly assignmentIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly itemStatusesMatchEligibility: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly assignmentNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly decisionAndAttestationAbsent: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxReviewerAssignmentAudit {
  readonly schemaVersion: "f07a-3j-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxReviewerAssignmentAuditChecks;
}
