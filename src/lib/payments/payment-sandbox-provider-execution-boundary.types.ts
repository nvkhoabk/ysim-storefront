// F07A-3V_PAYMENT_SANDBOX_PROVIDER_EXECUTION_BOUNDARY_R1

import type { PaymentSandboxApprovalReviewHandoffItemKey } from "./payment-sandbox-approval-review-handoff.types";

export type PaymentSandboxProviderExecutionBoundaryView =
  "boundary" | "eligibility" | "boundary-envelope" | "audit";

export type PaymentSandboxProviderExecutionBoundaryStatus =
  | "prepared-closed"
  | "blocked-gate-not-prepared"
  | "blocked-adapter-disabled"
  | "blocked-adapter-missing";

export interface PaymentSandboxProviderExecutionBoundaryEligibility {
  readonly providerSubmissionGateContractValid: boolean;
  readonly environmentSandbox: boolean;
  readonly gatePrepared: boolean;
  readonly gateClosed: boolean;
  readonly submissionNotAuthorized: boolean;
  readonly providerCallNotAllowed: boolean;
  readonly providerRequestNotCreated: boolean;
  readonly providerRequestNotSubmitted: boolean;
  readonly providerRequestNotPersisted: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly requiredItemSetComplete: boolean;
  readonly noExecutionGuardrailsIntact: boolean;
  readonly eligibleForPreviewBoundary: boolean;
  readonly reasons: readonly string[];
}

export interface PaymentSandboxProviderExecutionBoundaryItem {
  readonly key: PaymentSandboxApprovalReviewHandoffItemKey;
  readonly reviewerAlias: "sandbox-reviewer-fixture" | null;
  readonly providerSubmissionGateCandidateId: string;
  readonly boundaryPrepared: boolean;
  readonly boundaryOpen: false;
  readonly executionAuthorized: false;
  readonly credentialResolutionAttempted: false;
  readonly providerCallAttempted: false;
  readonly providerResponseReceived: false;
  readonly evaluatedAt: null;
}

export interface PaymentSandboxProviderExecutionBoundaryEnvelope {
  readonly mediaType: "application/json";
  readonly schemaVersion: "f07a-3v-r1";
  readonly signed: false;
  readonly containsSecret: false;
  readonly containsPii: false;
  readonly submitted: false;
  readonly persisted: false;
  readonly body: Readonly<{
    providerExecutionBoundaryCandidateId: string;
    providerSubmissionGateCandidateId: string;
    upstreamProviderSubmissionGateFingerprint: string;
    providerKey: string;
    adapterState: string;
    reviewerAlias: "sandbox-reviewer-fixture";
    reviewItemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
    boundaryKind: "sandbox-provider-execution-boundary-preview-only";
    boundaryPrepared: boolean;
    boundaryOpen: false;
    executionAuthorized: false;
    providerCallAllowed: false;
    credentialResolutionAttempted: false;
    providerCallAttempted: false;
    providerResponseReceived: false;
    providerRequestCreated: false;
    providerRequestSubmitted: false;
    providerRequestPersisted: false;
    settlementInstructionCreated: false;
  }>;
}

export interface PaymentSandboxProviderExecutionBoundaryArtifacts {
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

export interface PaymentSandboxProviderExecutionBoundaryResult {
  readonly schemaVersion: "f07a-3v-r1";
  readonly purpose: "ui-preview-only";
  readonly environment: "sandbox";
  readonly productionEligible: false;
  readonly executionEligible: false;
  readonly upstreamProviderSubmissionGateCandidateId: string;
  readonly upstreamProviderSubmissionGateFingerprint: string;
  readonly providerKey: string;
  readonly adapterState: string;
  readonly reviewerAlias: "sandbox-reviewer-fixture";
  readonly providerExecutionBoundaryCandidateId: string;
  readonly boundaryStatus: PaymentSandboxProviderExecutionBoundaryStatus;
  readonly eligibility: PaymentSandboxProviderExecutionBoundaryEligibility;
  readonly items: readonly PaymentSandboxProviderExecutionBoundaryItem[];
  readonly boundaryEnvelope: PaymentSandboxProviderExecutionBoundaryEnvelope;
  readonly artifacts: PaymentSandboxProviderExecutionBoundaryArtifacts;
}

export interface PaymentSandboxProviderExecutionBoundaryObservation {
  readonly upstreamProviderSubmissionGateFingerprint: string;
  readonly providerExecutionBoundaryCandidateId: string;
  readonly itemKeys: readonly PaymentSandboxApprovalReviewHandoffItemKey[];
  readonly reviewerAlias: string | null;
  readonly reviewerPiiPresent: boolean;
  readonly reviewerCredentialPresent: boolean;
  readonly gateOpen: boolean;
  readonly submissionAuthorized: boolean;
  readonly providerCallAllowed: boolean;
  readonly boundaryOpen: boolean;
  readonly executionAuthorized: boolean;
  readonly credentialResolutionAttempted: boolean;
  readonly providerCallAttempted: boolean;
  readonly providerResponseReceived: boolean;
  readonly envelopeSigned: boolean;
  readonly envelopeContainsSecret: boolean;
  readonly envelopeContainsPii: boolean;
  readonly envelopeSubmitted: boolean;
  readonly settlementInstructionPresent: boolean;
  readonly registryMutationPresent: boolean;
  readonly productionEligible: boolean;
  readonly executionEligible: boolean;
}

export interface PaymentSandboxProviderExecutionBoundaryAuditChecks {
  readonly schemaMatches: boolean;
  readonly environmentSandbox: boolean;
  readonly providerSubmissionGateContractValid: boolean;
  readonly upstreamFingerprintMatches: boolean;
  readonly providerExecutionBoundaryCandidateIdMatches: boolean;
  readonly requiredItemSetMatches: boolean;
  readonly reviewerAliasOpaque: boolean;
  readonly reviewerPiiAbsent: boolean;
  readonly reviewerCredentialAbsent: boolean;
  readonly gateClosed: boolean;
  readonly submissionNotAuthorized: boolean;
  readonly providerCallNotAllowed: boolean;
  readonly boundaryClosed: boolean;
  readonly executionNotAuthorized: boolean;
  readonly credentialResolutionNotAttempted: boolean;
  readonly providerCallNotAttempted: boolean;
  readonly providerResponseAbsent: boolean;
  readonly envelopeUnsigned: boolean;
  readonly envelopeContainsNoSecret: boolean;
  readonly envelopeContainsNoPii: boolean;
  readonly envelopeNotSubmitted: boolean;
  readonly settlementArtifactAbsent: boolean;
  readonly registryMutationAbsent: boolean;
  readonly productionAndExecutionBlocked: boolean;
}

export interface PaymentSandboxProviderExecutionBoundaryAudit {
  readonly schemaVersion: "f07a-3v-audit-r1";
  readonly status: "matched" | "mismatched";
  readonly checks: PaymentSandboxProviderExecutionBoundaryAuditChecks;
}
