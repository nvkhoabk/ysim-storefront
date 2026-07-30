// F07A-3N_PAYMENT_SANDBOX_APPROVAL_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxApprovalCandidateView =
  "approval" | "eligibility" | "approval-envelope" | "audit";

export type PaymentSandboxApprovalCandidateStatus =
  | "prepared-not-created"
  | "blocked-issuance-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxApprovalCandidateEligibility {
  readonly issuanceAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly issuancePrepared: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly decisionNotIssued: boolean;
  readonly decisionNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewApproval: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxApprovalCandidateItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly issuanceId: string;
  readonly approvalPrepared: boolean;
  readonly approvalCreated: false;
  readonly approvalPersisted: false;
  readonly approvedAt: null;
}

export interface PaymentSandboxApprovalCandidateEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3n-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    approvalCandidateId: string;
    issuanceId: string;
    upstreamIssuanceFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    approvalPrepared: boolean;
    approvalCreated: false;
    approvalPersisted: false;
    approvalTokenCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxApprovalCandidateArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxApprovalCandidateResult {
  readonly schemaVersion: "f07a-3n-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamIssuanceId: string;
  readonly upstreamIssuanceFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly approvalCandidateId: string;
  readonly approvalStatus: PaymentSandboxApprovalCandidateStatus;
  readonly eligibility: PaymentSandboxApprovalCandidateEligibility;
  readonly items: readonly PaymentSandboxApprovalCandidateItem[];
  readonly approvalEnvelope: PaymentSandboxApprovalCandidateEnvelope;
  readonly artifacts: PaymentSandboxApprovalCandidateArtifacts;
}

export interface PaymentSandboxApprovalCandidateObservation {
  readonly upstreamIssuanceFingerprint: string;
  readonly approvalCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly issuanceSigned: boolean;
  readonly issuanceSubmitted: boolean;
  readonly issuancePersisted: boolean;
  readonly decisionIssued: boolean;
  readonly decisionPersisted: boolean;
  readonly approvalCreated: boolean;
  readonly approvalPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxApprovalCandidateAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly issuanceAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly approvalCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly decisionNotIssued: boolean;
  readonly decisionNotPersisted: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly activationArtifactAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxApprovalCandidateAudit {
  readonly schemaVersion: "f07a-3n-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxApprovalCandidateAuditChecks;
}
