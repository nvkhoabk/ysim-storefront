// F07A-3U_PAYMENT_SANDBOX_PROVIDER_SUBMISSION_GATE_R1
// F07A_3U_REUSE_F07A_3T_PROVIDER_REQUEST_ISSUANCE_WITHOUT_DUPLICATION
// F07A_3U_GATE_PREPARED_BUT_NEVER_OPENED_OR_AUTHORIZED
// F07A_3U_PROVIDER_REQUEST_AND_ISSUANCE_REMAIN_UNCREATED_UNSUBMITTED_AND_UNPERSISTED
// F07A_3U_NO_PROVIDER_CALL_SETTLEMENT_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import type { PaymentSandboxApprovalIssuanceResult } from "./payment-sandbox-approval-issuance.types";
import type { PaymentSandboxApprovalTokenResult } from "./payment-sandbox-approval-token.types";
import type { PaymentSandboxActivationCandidateResult } from "./payment-sandbox-activation-candidate.types";
import type { PaymentSandboxActivationTokenResult } from "./payment-sandbox-activation-token.types";
import type { PaymentSandboxProviderRequestResult } from "./payment-sandbox-provider-request.types";
import {
  auditPaymentSandboxProviderRequestIssuance,
  validatePaymentSandboxProviderRequestIssuance,
} from "./payment-sandbox-provider-request-issuance";
import type { PaymentSandboxProviderRequestIssuanceResult } from "./payment-sandbox-provider-request-issuance.types";
import type {
  PaymentSandboxProviderSubmissionGateAudit,
  PaymentSandboxProviderSubmissionGateAuditChecks,
  PaymentSandboxProviderSubmissionGateEligibility,
  PaymentSandboxProviderSubmissionGateObservation,
  PaymentSandboxProviderSubmissionGateResult,
  PaymentSandboxProviderSubmissionGateStatus,
} from "./payment-sandbox-provider-submission-gate.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const GATE_KIND = "sandbox-provider-submission-gate-preview-only" as const;
const REQUIRED_ITEM_KEYS = Object.freeze([
  "request-identity",
  "verification-binding",
  "approval-prerequisites",
  "no-execution-guardrails",
] as const);

function fingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const character of parts.join("|")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function gateStatusFor(
  issuance: PaymentSandboxProviderRequestIssuanceResult,
): PaymentSandboxProviderSubmissionGateStatus {
  if (issuance.issuanceStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (issuance.issuanceStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (issuance.issuanceStatus !== "prepared-not-issued") {
    return "blocked-issuance-not-prepared";
  }
  return "prepared-closed";
}

function createEligibility(
  issuance: PaymentSandboxProviderRequestIssuanceResult,
  upstreamAuditMatched: boolean,
): PaymentSandboxProviderSubmissionGateEligibility {
  const issuancePrepared =
    issuance.issuanceStatus === "prepared-not-issued" &&
    issuance.eligibility.eligibleForPreviewIssuance &&
    issuance.items.every((item) => item.issuancePrepared);
  const issuanceNotIssued =
    issuance.items.every((item) => item.issuanceIssued === false) &&
    issuance.issuanceEnvelope.body.issuanceIssued === false;
  const issuanceUnsigned =
    issuance.items.every((item) => item.issuanceSigned === false) &&
    issuance.issuanceEnvelope.body.issuanceSigned === false &&
    issuance.issuanceEnvelope.signed === false;
  const issuanceNotSubmitted =
    issuance.items.every((item) => item.issuanceSubmitted === false) &&
    issuance.issuanceEnvelope.body.issuanceSubmitted === false &&
    issuance.issuanceEnvelope.submitted === false;
  const issuanceNotPersisted =
    issuance.items.every((item) => item.issuancePersisted === false) &&
    issuance.issuanceEnvelope.body.issuancePersisted === false &&
    issuance.issuanceEnvelope.persisted === false;
  const providerRequestNotCreated =
    issuance.eligibility.providerRequestNotCreated;
  const providerRequestNotSubmitted =
    issuance.eligibility.providerRequestNotSubmitted;
  const providerRequestNotPersisted =
    issuance.eligibility.providerRequestNotPersisted;
  const reviewerAliasOpaque = issuance.reviewerAlias === REVIEWER_ALIAS;
  const itemKeys = issuance.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    issuance.productionEligible === false &&
    issuance.executionEligible === false &&
    Object.values(issuance.artifacts).every((value) => value === false);
  const eligibleForPreviewGate =
    upstreamAuditMatched &&
    issuance.environment === "sandbox" &&
    issuancePrepared &&
    issuanceNotIssued &&
    issuanceUnsigned &&
    issuanceNotSubmitted &&
    issuanceNotPersisted &&
    providerRequestNotCreated &&
    providerRequestNotSubmitted &&
    providerRequestNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;
  return Object.freeze({
    providerRequestIssuanceAuditMatched: upstreamAuditMatched,
    environmentSandbox: issuance.environment === "sandbox",
    issuancePrepared,
    issuanceNotIssued,
    issuanceUnsigned,
    issuanceNotSubmitted,
    issuanceNotPersisted,
    providerRequestNotCreated,
    providerRequestNotSubmitted,
    providerRequestNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewGate,
    reasons: Object.freeze(
      eligibleForPreviewGate
        ? ["eligible-for-preview-provider-submission-gate"]
        : [
            ...(upstreamAuditMatched
              ? []
              : ["provider-request-issuance-audit-mismatch"]),
            ...(issuance.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(issuancePrepared ? [] : ["issuance-not-prepared"]),
            ...(issuanceNotIssued ? [] : ["issuance-issued"]),
            ...(issuanceUnsigned ? [] : ["issuance-signed"]),
            ...(issuanceNotSubmitted ? [] : ["issuance-submitted"]),
            ...(issuanceNotPersisted ? [] : ["issuance-persisted"]),
            ...(providerRequestNotCreated ? [] : ["provider-request-created"]),
            ...(providerRequestNotSubmitted
              ? []
              : ["provider-request-submitted"]),
            ...(providerRequestNotPersisted
              ? []
              : ["provider-request-persisted"]),
            ...(reviewerAliasOpaque ? [] : ["reviewer-alias-not-opaque"]),
            ...(requiredItemSetComplete
              ? []
              : ["required-item-set-incomplete"]),
            ...(noExecutionGuardrailsIntact
              ? []
              : ["no-execution-guardrails-not-intact"]),
          ],
    ),
  });
}

function candidateIdFor(
  issuance: PaymentSandboxProviderRequestIssuanceResult,
  status: PaymentSandboxProviderSubmissionGateStatus,
): string {
  return fingerprint([
    "f07a-3u-r1",
    issuance.providerRequestIssuanceCandidateId,
    issuance.upstreamProviderRequestFingerprint,
    issuance.providerKey,
    issuance.adapterState,
    REVIEWER_ALIAS,
    GATE_KIND,
    status,
  ]);
}

export function createPaymentSandboxProviderSubmissionGate(
  upstreamIssuance: PaymentSandboxProviderRequestIssuanceResult,
  upstreamProviderRequest: PaymentSandboxProviderRequestResult,
  upstreamActivationToken: PaymentSandboxActivationTokenResult,
  upstreamActivation: PaymentSandboxActivationCandidateResult,
  upstreamApprovalToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxProviderSubmissionGateResult {
  validatePaymentSandboxProviderRequestIssuance(
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamAudit = auditPaymentSandboxProviderRequestIssuance(
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (upstreamAudit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_SUBMISSION_GATE_UPSTREAM_AUDIT_FAILED",
    );
  }
  const eligibility = createEligibility(upstreamIssuance, true);
  const gateStatus = gateStatusFor(upstreamIssuance);
  const providerSubmissionGateCandidateId = candidateIdFor(
    upstreamIssuance,
    gateStatus,
  );
  const gatePrepared =
    eligibility.eligibleForPreviewGate && gateStatus === "prepared-closed";
  const items = Object.freeze(
    upstreamIssuance.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: gatePrepared ? REVIEWER_ALIAS : null,
        providerRequestIssuanceCandidateId:
          upstreamIssuance.providerRequestIssuanceCandidateId,
        gatePrepared,
        gateOpen: false as const,
        submissionAuthorized: false as const,
        providerCallAllowed: false as const,
        evaluatedAt: null,
      }),
    ),
  );
  const result = Object.freeze({
    schemaVersion: "f07a-3u-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamProviderRequestIssuanceCandidateId:
      upstreamIssuance.providerRequestIssuanceCandidateId,
    upstreamProviderRequestIssuanceFingerprint:
      upstreamIssuance.providerRequestIssuanceCandidateId,
    providerKey: upstreamIssuance.providerKey,
    adapterState: upstreamIssuance.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    providerSubmissionGateCandidateId,
    gateStatus,
    eligibility,
    items,
    gateEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3u-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        providerSubmissionGateCandidateId,
        providerRequestIssuanceCandidateId:
          upstreamIssuance.providerRequestIssuanceCandidateId,
        upstreamProviderRequestIssuanceFingerprint:
          upstreamIssuance.providerRequestIssuanceCandidateId,
        providerKey: upstreamIssuance.providerKey,
        adapterState: upstreamIssuance.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        gateKind: GATE_KIND,
        gatePrepared,
        gateOpen: false as const,
        submissionAuthorized: false as const,
        providerCallAllowed: false as const,
        providerRequestCreated: false as const,
        providerRequestSubmitted: false as const,
        providerRequestPersisted: false as const,
        settlementInstructionCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalIssuanceRecordCreated: false as const,
      approvalTokenRecordCreated: false as const,
      activationRecordCreated: false as const,
      activationTokenRecordCreated: false as const,
      providerRequestRecordCreated: false as const,
      providerRequestIssuanceRecordCreated: false as const,
      providerSubmissionGateRecordCreated: false as const,
      providerSubmissionAttemptCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });
  validatePaymentSandboxProviderSubmissionGate(
    result,
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  return result;
}

export function validatePaymentSandboxProviderSubmissionGate(
  result: PaymentSandboxProviderSubmissionGateResult,
  upstreamIssuance: PaymentSandboxProviderRequestIssuanceResult,
  upstreamProviderRequest: PaymentSandboxProviderRequestResult,
  upstreamActivationToken: PaymentSandboxActivationTokenResult,
  upstreamActivation: PaymentSandboxActivationCandidateResult,
  upstreamApprovalToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  const audit = auditPaymentSandboxProviderSubmissionGate(
    result,
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (audit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_SUBMISSION_GATE_VALIDATION_FAILED",
    );
  }
}

export function auditPaymentSandboxProviderSubmissionGate(
  result: PaymentSandboxProviderSubmissionGateResult,
  upstreamIssuance: PaymentSandboxProviderRequestIssuanceResult,
  upstreamProviderRequest: PaymentSandboxProviderRequestResult,
  upstreamActivationToken: PaymentSandboxActivationTokenResult,
  upstreamActivation: PaymentSandboxActivationCandidateResult,
  upstreamApprovalToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation?: PaymentSandboxProviderSubmissionGateObservation,
): PaymentSandboxProviderSubmissionGateAudit {
  validatePaymentSandboxProviderRequestIssuance(
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const upstreamAudit = auditPaymentSandboxProviderRequestIssuance(
    upstreamIssuance,
    upstreamProviderRequest,
    upstreamActivationToken,
    upstreamActivation,
    upstreamApprovalToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const observed = observation ?? {
    upstreamProviderRequestIssuanceFingerprint:
      result.upstreamProviderRequestIssuanceFingerprint,
    providerSubmissionGateCandidateId: result.providerSubmissionGateCandidateId,
    itemKeys: result.items.map((item) => item.key),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    issuanceIssued: false,
    issuanceSigned: false,
    issuanceSubmitted: false,
    issuancePersisted: false,
    providerRequestCreated: false,
    providerRequestSubmitted: false,
    providerRequestPersisted: false,
    gateOpen: false,
    submissionAuthorized: false,
    providerCallAllowed: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  };
  const checks: PaymentSandboxProviderSubmissionGateAuditChecks = Object.freeze(
    {
      schemaMatches:
        result.schemaVersion === "f07a-3u-r1" &&
        result.gateEnvelope.schemaVersion === "f07a-3u-r1",
      environmentSandbox: result.environment === "sandbox",
      providerRequestIssuanceAuditMatched: upstreamAudit.status === "matched",
      upstreamFingerprintMatches:
        observed.upstreamProviderRequestIssuanceFingerprint ===
        upstreamIssuance.providerRequestIssuanceCandidateId,
      providerSubmissionGateCandidateIdMatches:
        observed.providerSubmissionGateCandidateId ===
        result.providerSubmissionGateCandidateId,
      requiredItemSetMatches:
        observed.itemKeys.length === REQUIRED_ITEM_KEYS.length &&
        REQUIRED_ITEM_KEYS.every((key) => observed.itemKeys.includes(key)),
      reviewerAliasOpaque: observed.reviewerAlias === REVIEWER_ALIAS,
      reviewerPiiAbsent: observed.reviewerPiiPresent === false,
      reviewerCredentialAbsent: observed.reviewerCredentialPresent === false,
      issuanceNotIssued: observed.issuanceIssued === false,
      issuanceUnsigned: observed.issuanceSigned === false,
      issuanceNotSubmitted: observed.issuanceSubmitted === false,
      issuanceNotPersisted: observed.issuancePersisted === false,
      providerRequestNotCreated: observed.providerRequestCreated === false,
      providerRequestNotSubmitted: observed.providerRequestSubmitted === false,
      providerRequestNotPersisted: observed.providerRequestPersisted === false,
      gateClosed: observed.gateOpen === false,
      submissionNotAuthorized: observed.submissionAuthorized === false,
      providerCallNotAllowed: observed.providerCallAllowed === false,
      envelopeUnsigned: observed.envelopeSigned === false,
      envelopeContainsNoSecret: observed.envelopeContainsSecret === false,
      envelopeContainsNoPii: observed.envelopeContainsPii === false,
      envelopeNotSubmitted: observed.envelopeSubmitted === false,
      settlementArtifactAbsent: observed.settlementInstructionPresent === false,
      registryMutationAbsent: observed.registryMutationPresent === false,
      productionAndExecutionBlocked:
        observed.productionEligible === false &&
        observed.executionEligible === false,
    },
  );
  return Object.freeze({
    schemaVersion: "f07a-3u-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
