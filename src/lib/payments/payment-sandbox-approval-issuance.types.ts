// F07A-3O_PAYMENT_SANDBOX_APPROVAL_ISSUANCE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxApprovalIssuanceView =
  "issuance" | "eligibility" | "issuance-envelope" | "audit";

export type PaymentSandboxApprovalIssuanceStatus =
  | "prepared-not-issued"
  | "blocked-approval-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxApprovalIssuanceEligibility {
  readonly approvalAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly approvalPrepared: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly approvalEnvelopeUnsigned: boolean;
  readonly approvalEnvelopeNotSubmitted: boolean;
  readonly approvalEnvelopeNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewIssuance: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxApprovalIssuanceItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly approvalCandidateId: string;
  readonly issuancePrepared: boolean;
  readonly issuanceSigned: false;
  readonly issuanceSubmitted: false;
  readonly issuancePersisted: false;
  readonly issuedAt: null;
}

export interface PaymentSandboxApprovalIssuanceEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3o-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    approvalIssuanceId: string;
    approvalCandidateId: string;
    upstreamApprovalCandidateFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    issuancePrepared: boolean;
    issuanceSigned: false;
    issuanceSubmitted: false;
    issuancePersisted: false;
    approvalCreated: false;
    approvalPersisted: false;
    approvalTokenCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxApprovalIssuanceArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxApprovalIssuanceResult {
  readonly schemaVersion: "f07a-3o-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamApprovalCandidateId: string;
  readonly upstreamApprovalCandidateFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly approvalIssuanceId: string;
  readonly issuanceStatus: PaymentSandboxApprovalIssuanceStatus;
  readonly eligibility: PaymentSandboxApprovalIssuanceEligibility;
  readonly items: readonly PaymentSandboxApprovalIssuanceItem[];
  readonly issuanceEnvelope: PaymentSandboxApprovalIssuanceEnvelope;
  readonly artifacts: PaymentSandboxApprovalIssuanceArtifacts;
}

export interface PaymentSandboxApprovalIssuanceObservation {
  readonly upstreamApprovalCandidateFingerprint: string;
  readonly approvalIssuanceId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly approvalCreated: boolean;
  readonly approvalPersisted: boolean;
  readonly issuanceSigned: boolean;
  readonly issuanceSubmitted: boolean;
  readonly issuancePersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly approvalTokenPresent: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxApprovalIssuanceAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly approvalAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly approvalIssuanceIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly approvalNotCreated: boolean;
  readonly approvalNotPersisted: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly approvalTokenAbsent: boolean;
  readonly activationArtifactAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxApprovalIssuanceAudit {
  readonly schemaVersion: "f07a-3o-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxApprovalIssuanceAuditChecks;
}
