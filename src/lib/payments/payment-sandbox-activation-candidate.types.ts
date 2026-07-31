// F07A-3Q_PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxActivationCandidateView =
  "activation" | "eligibility" | "activation-envelope" | "audit";

export type PaymentSandboxActivationCandidateStatus =
  | "prepared-not-created"
  | "blocked-token-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxActivationCandidateEligibility {
  readonly tokenAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly tokenPrepared: boolean;
  readonly tokenNotCreated: boolean;
  readonly tokenUnsigned: boolean;
  readonly tokenNotPersisted: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewActivation: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxActivationCandidateItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly approvalTokenCandidateId: string;
  readonly activationPrepared: boolean;
  readonly activationCreated: false;
  readonly activationPersisted: false;
  readonly activatedAt: null;
}

export interface PaymentSandboxActivationCandidateEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3q-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    activationCandidateId: string;
    approvalTokenCandidateId: string;
    upstreamApprovalTokenFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    activationPrepared: boolean;
    activationCreated: false;
    activationPersisted: false;
    activationTokenCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxActivationCandidateArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationRecordCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxActivationCandidateResult {
  readonly schemaVersion: "f07a-3q-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamApprovalTokenCandidateId: string;
  readonly upstreamApprovalTokenFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly activationCandidateId: string;
  readonly activationStatus: PaymentSandboxActivationCandidateStatus;
  readonly eligibility: PaymentSandboxActivationCandidateEligibility;
  readonly items: readonly PaymentSandboxActivationCandidateItem[];
  readonly activationEnvelope: PaymentSandboxActivationCandidateEnvelope;
  readonly artifacts: PaymentSandboxActivationCandidateArtifacts;
}

export interface PaymentSandboxActivationCandidateObservation {
  readonly upstreamApprovalTokenFingerprint: string;
  readonly activationCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly tokenCreated: boolean;
  readonly tokenSigned: boolean;
  readonly tokenPersisted: boolean;
  readonly approvalCreated: boolean;
  readonly approvalPersisted: boolean;
  readonly activationCreated: boolean;
  readonly activationPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly activationTokenPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxActivationCandidateAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly tokenAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly activationCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly tokenNotCreated: boolean;
  readonly tokenUnsigned: boolean;
  readonly tokenNotPersisted: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly activationNotCreated: boolean;
  readonly activationNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly activationTokenAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxActivationCandidateAudit {
  readonly schemaVersion: "f07a-3q-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxActivationCandidateAuditChecks;
}
