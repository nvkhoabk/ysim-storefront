// F07A-3U_PAYMENT_SANDBOX_PROVIDER_SUBMISSION_GATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxProviderSubmissionGateView =
  "gate" | "eligibility" | "gate-envelope" | "audit";

export type PaymentSandboxProviderSubmissionGateStatus =
  | "prepared-closed"
  | "blocked-issuance-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxProviderSubmissionGateEligibility {
  readonly providerRequestIssuanceAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly issuancePrepared: boolean;
  readonly issuanceNotIssued: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly providerRequestNotSubmitted: boolean;
  readonly providerRequestNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewGate: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxProviderSubmissionGateItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly providerRequestIssuanceCandidateId: string;
  readonly gatePrepared: boolean;
  readonly gateOpen: false;
  readonly submissionAuthorized: false;
  readonly providerCallAllowed: false;
  readonly evaluatedAt: null;
}

export interface PaymentSandboxProviderSubmissionGateEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3u-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    providerSubmissionGateCandidateId: string;
    providerRequestIssuanceCandidateId: string;
    upstreamProviderRequestIssuanceFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    gateKind: "sandbox-provider-submission-gate-preview-only";
    gatePrepared: boolean;
    gateOpen: false;
    submissionAuthorized: false;
    providerCallAllowed: false;
    providerRequestCreated: false;
    providerRequestSubmitted: false;
    providerRequestPersisted: false;
    settlementInstructionCreated: false;
  }>;
}

export interface PaymentSandboxProviderSubmissionGateArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationRecordCreated: false;
  readonly activationTokenRecordCreated: false;
  readonly providerRequestRecordCreated: false;
  readonly providerRequestIssuanceRecordCreated: false;
  readonly providerSubmissionGateRecordCreated: false;
  readonly providerSubmissionAttemptCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxProviderSubmissionGateResult {
  readonly schemaVersion: "f07a-3u-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamProviderRequestIssuanceCandidateId: string;
  readonly upstreamProviderRequestIssuanceFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly providerSubmissionGateCandidateId: string;
  readonly gateStatus: PaymentSandboxProviderSubmissionGateStatus;
  readonly eligibility: PaymentSandboxProviderSubmissionGateEligibility;
  readonly items: readonly PaymentSandboxProviderSubmissionGateItem[];
  readonly gateEnvelope: PaymentSandboxProviderSubmissionGateEnvelope;
  readonly artifacts: PaymentSandboxProviderSubmissionGateArtifacts;
}

export interface PaymentSandboxProviderSubmissionGateObservation {
  readonly upstreamProviderRequestIssuanceFingerprint: string;
  readonly providerSubmissionGateCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly issuanceIssued: boolean;
  readonly issuanceSigned: boolean;
  readonly issuanceSubmitted: boolean;
  readonly issuancePersisted: boolean;
  readonly providerRequestCreated: boolean;
  readonly providerRequestSubmitted: boolean;
  readonly providerRequestPersisted: boolean;
  readonly gateOpen: boolean;
  readonly submissionAuthorized: boolean;
  readonly providerCallAllowed: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxProviderSubmissionGateAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly providerRequestIssuanceAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly providerSubmissionGateCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly issuanceNotIssued: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly providerRequestNotSubmitted: boolean;
  readonly providerRequestNotPersisted: boolean;
  readonly gateClosed: boolean;
  readonly submissionNotAuthorized: boolean;
  readonly providerCallNotAllowed: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly settlementArtifactAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxProviderSubmissionGateAudit {
  readonly schemaVersion: "f07a-3u-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxProviderSubmissionGateAuditChecks;
}
