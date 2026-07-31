// F07A-3T_PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxProviderRequestIssuanceView =
  "issuance" | "eligibility" | "issuance-envelope" | "audit";

export type PaymentSandboxProviderRequestIssuanceStatus =
  | "prepared-not-issued"
  | "blocked-provider-request-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxProviderRequestIssuanceEligibility {
  readonly providerRequestAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly providerRequestPrepared: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly providerRequestNotSubmitted: boolean;
  readonly providerRequestNotPersisted: boolean;
  readonly activationTokenNotCreated: boolean;
  readonly activationTokenUnsigned: boolean;
  readonly activationTokenNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewIssuance: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxProviderRequestIssuanceItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly providerRequestCandidateId: string;
  readonly issuancePrepared: boolean;
  readonly issuanceIssued: false;
  readonly issuanceSigned: false;
  readonly issuanceSubmitted: false;
  readonly issuancePersisted: false;
  readonly issuedAt: null;
}

export interface PaymentSandboxProviderRequestIssuanceEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3t-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    providerRequestIssuanceCandidateId: string;
    providerRequestCandidateId: string;
    upstreamProviderRequestFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    issuanceKind: "sandbox-provider-request-issuance-preview-only";
    issuancePrepared: boolean;
    issuanceIssued: false;
    issuanceSigned: false;
    issuanceSubmitted: false;
    issuancePersisted: false;
    providerRequestCreated: false;
    providerRequestSubmitted: false;
    providerRequestPersisted: false;
    settlementInstructionCreated: false;
  }>;
}

export interface PaymentSandboxProviderRequestIssuanceArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationRecordCreated: false;
  readonly activationTokenRecordCreated: false;
  readonly providerRequestRecordCreated: false;
  readonly providerRequestIssuanceRecordCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxProviderRequestIssuanceResult {
  readonly schemaVersion: "f07a-3t-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamProviderRequestCandidateId: string;
  readonly upstreamProviderRequestFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly providerRequestIssuanceCandidateId: string;
  readonly issuanceStatus: PaymentSandboxProviderRequestIssuanceStatus;
  readonly eligibility: PaymentSandboxProviderRequestIssuanceEligibility;
  readonly items: readonly PaymentSandboxProviderRequestIssuanceItem[];
  readonly issuanceEnvelope: PaymentSandboxProviderRequestIssuanceEnvelope;
  readonly artifacts: PaymentSandboxProviderRequestIssuanceArtifacts;
}

export interface PaymentSandboxProviderRequestIssuanceObservation {
  readonly upstreamProviderRequestFingerprint: string;
  readonly providerRequestIssuanceCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly providerRequestCreated: boolean;
  readonly providerRequestSubmitted: boolean;
  readonly providerRequestPersisted: boolean;
  readonly issuanceIssued: boolean;
  readonly issuanceSigned: boolean;
  readonly issuanceSubmitted: boolean;
  readonly issuancePersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxProviderRequestIssuanceAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly providerRequestAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly providerRequestIssuanceCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly providerRequestNotSubmitted: boolean;
  readonly providerRequestNotPersisted: boolean;
  readonly issuanceNotIssued: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly settlementArtifactAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxProviderRequestIssuanceAudit {
  readonly schemaVersion: "f07a-3t-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxProviderRequestIssuanceAuditChecks;
}
