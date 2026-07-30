// F07A-3I_PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_CANDIDATE_R1

export type PaymentSandboxApprovalReviewHandoffView =
  | "handoff"
  | "checklist"
  | "export-envelope"
  | "audit";

export type PaymentSandboxApprovalReviewHandoffItemKey =
  | "request-identity"
  | "verification-binding"
  | "approval-prerequisites"
  | "no-execution-guardrails";

export type PaymentSandboxApprovalReviewHandoffItemStatus =
  | "pending-manual-review"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxApprovalReviewHandoffSafeSummary {
  readonly schemaVersion: string;
  readonly environment: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly providerCurrency: string;
  readonly providerAmountMinor: string;
  readonly requestId: string;
  readonly requestStatus: string;
  readonly requestFingerprint: string;
  readonly verificationFingerprint: string;
  readonly blockerCount: number;
  readonly prerequisiteCount: number;
}

export interface PaymentSandboxApprovalReviewHandoffItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly status: PaymentSandboxApprovalReviewHandoffItemStatus;
  readonly reviewerRole: "independent-operator-required";
  readonly reviewMethod: "manual-non-secret-handoff-review";
  readonly reviewerId: null;
  readonly reviewedAt: null;
  readonly decision: null;
  readonly decisionReason: null;
}

export interface PaymentSandboxApprovalReviewHandoffExportEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3i-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly submitted: false;
  readonly body: Readonly<{
    handoffId: string;
    environment: "sandbox";
    upstreamRequestFingerprint: string;
    providerKey: string;
    adapterState: string;
    requestStatus: string;
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    reviewerAssigned: false;
    decisionCreated: false;
    approvalCreated: false;
    activationCreated: false;
    providerRequestCreated: false;
  }>;
}

export interface PaymentSandboxApprovalReviewHandoffArtifacts {
  readonly reviewerAssignmentCreated: false;
  readonly reviewerAttestationCreated: false;
  readonly verificationDecisionCreated: false;
  readonly approvalCreated: false;
  readonly approvalTokenCreated: false;
  readonly activationTokenCreated: false;
  readonly providerRequestCreated: false;
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxApprovalReviewHandoffResult {
  readonly schemaVersion: "f07a-3i-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly handoffId: string;
  readonly handoffStatus:
    | "blocked-pending-manual-review"
    | "blocked-adapter-disabled"
    | "blocked-adapter-missing";
  readonly upstreamRequestFingerprint: string;
  readonly upstreamSummary: PaymentSandboxApprovalReviewHandoffSafeSummary;
  readonly items: readonly PaymentSandboxApprovalReviewHandoffItem[];
  readonly exportEnvelope: PaymentSandboxApprovalReviewHandoffExportEnvelope;
  readonly artifacts: PaymentSandboxApprovalReviewHandoffArtifacts;
}

export interface PaymentSandboxApprovalReviewHandoffAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly itemStatusesMatchAdapterState: boolean;
  readonly reviewerIdentityAbsent: boolean;
  readonly reviewDecisionAbsent: boolean;
  readonly exportEnvelopeUnsigned: boolean;
  readonly exportEnvelopeContainsNoSecret: boolean;
  readonly exportEnvelopeNotSubmitted: boolean;
  readonly approvalAndActivationArtifactsAbsent: boolean;
  readonly providerAndSettlementArtifactsAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxApprovalReviewHandoffObservation {
  readonly upstreamRequestFingerprint: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerIdentityPresent: boolean;
  readonly reviewDecisionPresent: boolean;
  readonly exportEnvelopeSigned: boolean;
  readonly exportEnvelopeContainsSecret: boolean;
  readonly exportEnvelopeSubmitted: boolean;
  readonly approvalArtifactPresent: boolean;
  readonly activationArtifactPresent: boolean;
  readonly providerRequestPresent: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxApprovalReviewHandoffAudit {
  readonly schemaVersion: "f07a-3i-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxApprovalReviewHandoffAuditChecks;
}
