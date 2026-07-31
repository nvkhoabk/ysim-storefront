// F07A-3Y_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_ISSUANCE_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxExecutionLifecycleBindingIssuanceView =
  "binding" | "lifecycle" | "binding-envelope" | "audit";

export type PaymentSandboxExecutionLifecycleBindingIssuanceStatus =
  | "prepared-unbound"
  | "blocked-receipt-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxExecutionLifecycleBindingIssuanceEligibility {
  readonly providerResponseReceiptContractValid: boolean;
  readonly environmentSandbox: boolean;
  readonly normalizationPrepared: boolean;
  readonly providerResponseAbsent: boolean;
  readonly responseReceiptAbsent: boolean;
  readonly responseReceiptNotPersisted: boolean;
  readonly boundaryClosed: boolean;
  readonly executionNotAuthorized: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly lifecycleProfilePrepared: boolean;
  readonly noMutationGuardrailsIntact: boolean;
  readonly eligibleForPreviewBinding: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly providerResponseReceiptCandidateId: string;
  readonly lifecycleBindingPrepared: boolean;
  readonly lifecycleBound: false;
  readonly bindingPersisted: false;
  readonly transactionStateMutationCreated: false;
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3y-r2";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    executionLifecycleBindingIssuanceCandidateId: string;
    providerResponseReceiptCandidateId: string;
    upstreamProviderResponseReceiptFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    lifecycleProfile: "sandbox-payment-execution-lifecycle-v1";
    lifecyclePhases: readonly [
      "provider-request",
      "request-issuance",
      "submission-gate",
      "execution-boundary",
      "response-receipt",
    ];
    lifecycleBindingPrepared: boolean;
    lifecycleBound: false;
    bindingPersisted: false;
    providerResponseReceived: false;
    responseReceiptCreated: false;
    settlementInstructionCreated: false;
    transactionStateMutationCreated: false;
  }>;
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceArtifacts {
  readonly approvalRecordCreated: false;
  readonly approvalIssuanceRecordCreated: false;
  readonly approvalTokenRecordCreated: false;
  readonly activationRecordCreated: false;
  readonly activationTokenRecordCreated: false;
  readonly providerRequestRecordCreated: false;
  readonly providerRequestIssuanceRecordCreated: false;
  readonly providerSubmissionGateRecordCreated: false;
  readonly providerExecutionBoundaryRecordCreated: false;
  readonly providerExecutionAttemptCreated: false;
  readonly providerResponseReceiptCreated: false;
  readonly paymentExecutionLifecycleBindingIssuanceCreated: false;
  readonly paymentExecutionLifecycleBindingIssuancePersisted: false;
  readonly settlementInstructionCreated: false;
  readonly transactionStateMutationCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceResult {
  readonly schemaVersion: "f07a-3y-r2";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamProviderResponseReceiptCandidateId: string;
  readonly upstreamProviderResponseReceiptFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly executionLifecycleBindingIssuanceCandidateId: string;
  readonly bindingStatus: PaymentSandboxExecutionLifecycleBindingIssuanceStatus;
  readonly eligibility: PaymentSandboxExecutionLifecycleBindingIssuanceEligibility;
  readonly items: readonly PaymentSandboxExecutionLifecycleBindingIssuanceItem[];
  readonly bindingEnvelope: PaymentSandboxExecutionLifecycleBindingIssuanceEnvelope;
  readonly artifacts: PaymentSandboxExecutionLifecycleBindingIssuanceArtifacts;
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceObservation {
  readonly upstreamProviderResponseReceiptFingerprint: string;
  readonly executionLifecycleBindingIssuanceCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly normalizationPrepared: boolean;
  readonly providerResponseReceived: boolean;
  readonly responseReceiptCreated: boolean;
  readonly responseReceiptPersisted: boolean;
  readonly lifecycleBindingPrepared: boolean;
  readonly lifecycleBound: boolean;
  readonly bindingPersisted: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly transactionStateMutationPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly providerResponseReceiptContractValid: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly executionLifecycleBindingIssuanceCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly normalizationPrepared: boolean;
  readonly providerResponseAbsent: boolean;
  readonly responseReceiptAbsent: boolean;
  readonly responseReceiptNotPersisted: boolean;
  readonly lifecycleBindingPrepared: boolean;
  readonly lifecycleNotBound: boolean;
  readonly bindingNotPersisted: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly settlementArtifactAbsent: boolean;
  readonly transactionStateMutationAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxExecutionLifecycleBindingIssuanceAudit {
  readonly schemaVersion: "f07a-3y-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxExecutionLifecycleBindingIssuanceAuditChecks;
}
