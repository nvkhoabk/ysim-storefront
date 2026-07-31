// F07A-3R_PAYMENT_SANDBOX_ACTIVATION_TOKEN_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxActivationTokenView =
  "token" | "eligibility" | "token-envelope" | "audit";

export type PaymentSandboxActivationTokenStatus =
  | "prepared-not-created"
  | "blocked-activation-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxActivationTokenEligibility {
  readonly activationAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly activationPrepared: boolean;
  readonly activationNotCreated: boolean;
  readonly activationNotPersisted: boolean;
  readonly approvalTokenNotCreated: boolean;
  readonly approvalTokenUnsigned: boolean;
  readonly approvalTokenNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewToken: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxActivationTokenItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly activationCandidateId: string;
  readonly tokenPrepared: boolean;
  readonly tokenCreated: false;
  readonly tokenSigned: false;
  readonly tokenPersisted: false;
  readonly expiresAt: null;
}

export interface PaymentSandboxActivationTokenEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3r-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    activationTokenCandidateId: string;
    activationCandidateId: string;
    upstreamActivationFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    tokenPrepared: boolean;
    tokenCreated: false;
    tokenSigned: false;
    tokenPersisted: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxActivationTokenArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationRecordCreated: false;
  readonly activationTokenRecordCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxActivationTokenResult {
  readonly schemaVersion: "f07a-3r-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamActivationCandidateId: string;
  readonly upstreamActivationFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly activationTokenCandidateId: string;
  readonly tokenStatus: PaymentSandboxActivationTokenStatus;
  readonly eligibility: PaymentSandboxActivationTokenEligibility;
  readonly items: readonly PaymentSandboxActivationTokenItem[];
  readonly tokenEnvelope: PaymentSandboxActivationTokenEnvelope;
  readonly artifacts: PaymentSandboxActivationTokenArtifacts;
}

export interface PaymentSandboxActivationTokenObservation {
  readonly upstreamActivationFingerprint: string;
  readonly activationTokenCandidateId: string;
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
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxActivationTokenAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly activationAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly activationTokenCandidateIdMatches: boolean;
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
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxActivationTokenAudit {
  readonly schemaVersion: "f07a-3r-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxActivationTokenAuditChecks;
}
