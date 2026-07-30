// F07A-3M_PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_CANDIDATE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxReviewDecisionIssuanceView =
  "issuance" | "eligibility" | "issuance-envelope" | "audit";

export type PaymentSandboxReviewDecisionIssuanceStatus =
  | "prepared-not-issued"
  | "blocked-decision-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxReviewDecisionIssuanceEligibility {
  readonly decisionAuditMatched: boolean;
  readonly environmentSandbox: boolean;
  readonly decisionPrepared: boolean;
  readonly decisionNotIssued: boolean;
  readonly decisionNotPersisted: boolean;
  readonly attestationUnsigned: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewIssuance: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxReviewDecisionIssuanceItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly decisionId: string;
  readonly issuancePrepared: boolean;
  readonly issuanceSigned: false;
  readonly issuanceSubmitted: false;
  readonly issuancePersisted: false;
  readonly issuedAt: null;
}

export interface PaymentSandboxReviewDecisionIssuanceEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3m-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    issuanceId: string;
    decisionId: string;
    upstreamDecisionFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    issuancePrepared: boolean;
    issuanceSigned: false;
    issuanceSubmitted: false;
    issuancePersisted: false;
    decisionIssued: false;
    decisionPersisted: false;
    approvalCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxReviewDecisionIssuanceArtifacts {
  readonly decisionIssuanceRecordCreated: false;
  readonly reviewDecisionRecordCreated: false;
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxReviewDecisionIssuanceResult {
  readonly schemaVersion: "f07a-3m-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamDecisionId: string;
  readonly upstreamDecisionFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly issuanceId: string;
  readonly issuanceStatus: PaymentSandboxReviewDecisionIssuanceStatus;
  readonly eligibility: PaymentSandboxReviewDecisionIssuanceEligibility;
  readonly items: readonly PaymentSandboxReviewDecisionIssuanceItem[];
  readonly issuanceEnvelope: PaymentSandboxReviewDecisionIssuanceEnvelope;
  readonly artifacts: PaymentSandboxReviewDecisionIssuanceArtifacts;
}

export interface PaymentSandboxReviewDecisionIssuanceObservation {
  readonly upstreamDecisionFingerprint: string;
  readonly issuanceId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly decisionIssued: boolean;
  readonly decisionPersisted: boolean;
  readonly attestationSigned: boolean;
  readonly issuanceSigned: boolean;
  readonly issuanceSubmitted: boolean;
  readonly issuancePersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly approvalArtifactPresent: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxReviewDecisionIssuanceAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly decisionAuditMatched: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly issuanceIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly decisionNotIssued: boolean;
  readonly decisionNotPersisted: boolean;
  readonly attestationUnsigned: boolean;
  readonly issuanceUnsigned: boolean;
  readonly issuanceNotSubmitted: boolean;
  readonly issuanceNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxReviewDecisionIssuanceAudit {
  readonly schemaVersion: "f07a-3m-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxReviewDecisionIssuanceAuditChecks;
}
