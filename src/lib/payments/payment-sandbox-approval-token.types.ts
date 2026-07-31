// F07A-3P_PAYMENT_SANDBOX_APPROVAL_TOKEN_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxApprovalTokenView =
  "token" | "eligibility" | "token-envelope" | "audit";

export type PaymentSandboxApprovalTokenStatus =
  | "prepared-not-created"
  | "blocked-issuance-not-prepared"
  | "blocked-approval-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxApprovalTokenEligibility {
  readonly issuanceAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly issuancePrepared: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewToken: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxApprovalTokenItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly approvalIssuanceId: string;
  readonly tokenPrepared: boolean;
  readonly tokenCreated: false;
  readonly tokenSigned: false;
  readonly tokenPersisted: false;
  readonly createdAt: null;
}

export interface PaymentSandboxApprovalTokenEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3p-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    approvalTokenCandidateId: string;
    approvalIssuanceId: string;
    upstreamApprovalIssuanceFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    tokenPrepared: boolean;
    tokenCreated: false;
    tokenSigned: false;
    tokenPersisted: false;
    approvalCreated: false;
    approvalPersisted: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxApprovalTokenArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxApprovalTokenResult {
  readonly schemaVersion: "f07a-3p-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamApprovalIssuanceId: string;
  readonly upstreamApprovalIssuanceFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly approvalTokenCandidateId: string;
  readonly tokenStatus: PaymentSandboxApprovalTokenStatus;
  readonly eligibility: PaymentSandboxApprovalTokenEligibility;
  readonly items: readonly PaymentSandboxApprovalTokenItem[];
  readonly tokenEnvelope: PaymentSandboxApprovalTokenEnvelope;
  readonly artifacts: PaymentSandboxApprovalTokenArtifacts;
}

export interface PaymentSandboxApprovalTokenObservation {
  readonly upstreamApprovalIssuanceFingerprint: string;
  readonly approvalTokenCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly issuanceSigned: boolean;
  readonly issuanceSubmitted: boolean;
  readonly issuancePersisted: boolean;
  readonly approvalCreated: boolean;
  readonly approvalPersisted: boolean;
  readonly tokenCreated: boolean;
  readonly tokenSigned: boolean;
  readonly tokenPersisted: boolean;
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

export interface PaymentSandboxApprovalTokenAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly issuanceAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly tokenCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly tokenNotCreated: boolean;
  readonly tokenUnsigned: boolean;
  readonly tokenNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly activationArtifactAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxApprovalTokenAudit {
  readonly schemaVersion: "f07a-3p-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxApprovalTokenAuditChecks;
}
