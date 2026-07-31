// F07A-3S_PAYMENT_SANDBOX_PROVIDER_REQUEST_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxProviderRequestView =
  "request" | "eligibility" | "request-envelope" | "audit";

export type PaymentSandboxProviderRequestStatus =
  | "prepared-not-created"
  | "blocked-activation-token-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxProviderRequestEligibility {
  readonly activationTokenAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly activationTokenPrepared: boolean;
  readonly activationTokenNotCreated: boolean;
  readonly activationTokenUnsigned: boolean;
  readonly activationTokenNotPersisted: boolean;
  readonly activationNotCreated: boolean;
  readonly activationNotPersisted: boolean;
  readonly approvalTokenNotCreated: boolean;
  readonly approvalTokenUnsigned: boolean;
  readonly approvalTokenNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewRequest: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxProviderRequestItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly activationTokenCandidateId: string;
  readonly requestPrepared: boolean;
  readonly requestCreated: false;
  readonly requestSubmitted: false;
  readonly requestPersisted: false;
  readonly submittedAt: null;
}

export interface PaymentSandboxProviderRequestEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3s-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    providerRequestCandidateId: string;
    activationTokenCandidateId: string;
    upstreamActivationTokenFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    requestKind: "sandbox-provider-payment-request-preview-only";
    requestPrepared: boolean;
    requestCreated: false;
    requestSubmitted: false;
    requestPersisted: false;
    settlementInstructionCreated: false;
  }>;
}

export interface PaymentSandboxProviderRequestArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationRecordCreated: false;
  readonly activationTokenRecordCreated: false;
  readonly providerRequestRecordCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxProviderRequestResult {
  readonly schemaVersion: "f07a-3s-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamActivationTokenCandidateId: string;
  readonly upstreamActivationTokenFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly providerRequestCandidateId: string;
  readonly requestStatus: PaymentSandboxProviderRequestStatus;
  readonly eligibility: PaymentSandboxProviderRequestEligibility;
  readonly items: readonly PaymentSandboxProviderRequestItem[];
  readonly requestEnvelope: PaymentSandboxProviderRequestEnvelope;
  readonly artifacts: PaymentSandboxProviderRequestArtifacts;
}

export interface PaymentSandboxProviderRequestObservation {
  readonly upstreamActivationTokenFingerprint: string;
  readonly providerRequestCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly activationCreated: boolean;
  readonly activationPersisted: boolean;
  readonly approvalTokenCreated: boolean;
  readonly approvalTokenSigned: boolean;
  readonly approvalTokenPersisted: boolean;
  readonly activationTokenCreated: boolean;
  readonly activationTokenSigned: boolean;
  readonly activationTokenPersisted: boolean;
  readonly providerRequestCreated: boolean;
  readonly providerRequestSubmitted: boolean;
  readonly providerRequestPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxProviderRequestAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly activationTokenAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly providerRequestCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly activationNotCreated: boolean;
  readonly activationNotPersisted: boolean;
  readonly approvalTokenNotCreated: boolean;
  readonly approvalTokenUnsigned: boolean;
  readonly approvalTokenNotPersisted: boolean;
  readonly activationTokenNotCreated: boolean;
  readonly activationTokenUnsigned: boolean;
  readonly activationTokenNotPersisted: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly providerRequestNotSubmitted: boolean;
  readonly providerRequestNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly settlementArtifactAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxProviderRequestAudit {
  readonly schemaVersion: "f07a-3s-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxProviderRequestAuditChecks;
}
