// F07A-3W_PAYMENT_SANDBOX_PROVIDER_RESPONSE_RECEIPT_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxProviderResponseReceiptView =
  "receipt" | "normalization" | "receipt-envelope" | "audit";

export type PaymentSandboxProviderResponseReceiptStatus =
  | "prepared-no-response"
  | "blocked-boundary-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxProviderResponseReceiptEligibility {
  readonly providerExecutionBoundaryContractValid: boolean;
  readonly environmentSandbox: boolean;
  readonly boundaryPrepared: boolean;
  readonly boundaryClosed: boolean;
  readonly executionNotAuthorized: boolean;
  readonly credentialResolutionNotAttempted: boolean;
  readonly providerCallNotAttempted: boolean;
  readonly providerResponseAbsent: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly normalizationProfilePrepared: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewReceipt: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxProviderResponseReceiptItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly providerExecutionBoundaryCandidateId: string;
  readonly normalizationPrepared: boolean;
  readonly providerResponseReceived: false;
  readonly providerResponseNormalized: false;
  readonly responseReceiptCreated: false;
  readonly responseReceiptPersisted: false;
  readonly providerReference: null;
  readonly providerStatus: null;
  readonly providerCode: null;
  readonly receivedAt: null;
}

export interface PaymentSandboxProviderResponseReceiptEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3w-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    providerResponseReceiptCandidateId: string;
    providerExecutionBoundaryCandidateId: string;
    upstreamProviderExecutionBoundaryFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    normalizationProfile: "sandbox-provider-response-receipt-v1";
    expectedResponseFields: readonly [
      "providerReference",
      "providerStatus",
      "providerCode",
      "receivedAt",
    ];
    normalizationPrepared: boolean;
    providerResponseReceived: false;
    providerResponseNormalized: false;
    responseReceiptCreated: false;
    responseReceiptPersisted: false;
    providerReference: null;
    providerStatus: null;
    providerCode: null;
    receivedAt: null;
    settlementInstructionCreated: false;
  }>;
}

export interface PaymentSandboxProviderResponseReceiptArtifacts {
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
  readonly settlementInstructionCreated: false;
  readonly registryMutationCreated: false;
}

export interface PaymentSandboxProviderResponseReceiptResult {
  readonly schemaVersion: "f07a-3w-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamProviderExecutionBoundaryCandidateId: string;
  readonly upstreamProviderExecutionBoundaryFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly providerResponseReceiptCandidateId: string;
  readonly receiptStatus: PaymentSandboxProviderResponseReceiptStatus;
  readonly eligibility: PaymentSandboxProviderResponseReceiptEligibility;
  readonly items: readonly PaymentSandboxProviderResponseReceiptItem[];
  readonly receiptEnvelope: PaymentSandboxProviderResponseReceiptEnvelope;
  readonly artifacts: PaymentSandboxProviderResponseReceiptArtifacts;
}

export interface PaymentSandboxProviderResponseReceiptObservation {
  readonly upstreamProviderExecutionBoundaryFingerprint: string;
  readonly providerResponseReceiptCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly boundaryOpen: boolean;
  readonly executionAuthorized: boolean;
  readonly credentialResolutionAttempted: boolean;
  readonly providerCallAttempted: boolean;
  readonly providerResponseReceived: boolean;
  readonly providerResponseNormalized: boolean;
  readonly responseReceiptCreated: boolean;
  readonly responseReceiptPersisted: boolean;
  readonly providerReferencePresent: boolean;
  readonly providerStatusPresent: boolean;
  readonly providerCodePresent: boolean;
  readonly receivedAtPresent: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxProviderResponseReceiptAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly providerExecutionBoundaryContractValid: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly providerResponseReceiptCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly boundaryClosed: boolean;
  readonly executionNotAuthorized: boolean;
  readonly credentialResolutionNotAttempted: boolean;
  readonly providerCallNotAttempted: boolean;
  readonly providerResponseAbsent: boolean;
  readonly providerResponseNotNormalized: boolean;
  readonly responseReceiptNotCreated: boolean;
  readonly responseReceiptNotPersisted: boolean;
  readonly providerFieldsAbsent: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly settlementArtifactAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxProviderResponseReceiptAudit {
  readonly schemaVersion: "f07a-3w-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxProviderResponseReceiptAuditChecks;
}
