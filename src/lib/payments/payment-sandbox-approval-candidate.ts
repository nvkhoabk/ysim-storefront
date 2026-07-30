// F07A-3N_PAYMENT_SANDBOX_APPROVAL_CANDIDATE_R1
// F07A_3N_REUSE_F07A_3M_ISSUANCE_WITHOUT_DUPLICATION
// F07A_3N_APPROVAL_PREPARED_BUT_NEVER_CREATED_OR_PERSISTED
// F07A_3N_ISSUANCE_REMAINS_UNSIGNED_UNSUBMITTED_AND_UNPERSISTED
// F07A_3N_ACTIVATION_ALWAYS_ABSENT
// F07A_3N_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import {
  auditPaymentSandboxReviewDecisionIssuance,
  validatePaymentSandboxReviewDecisionIssuance,
} from "./payment-sandbox-review-decision-issuance";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type {
  PaymentSandboxApprovalCandidateAudit,
  PaymentSandboxApprovalCandidateAuditChecks,
  PaymentSandboxApprovalCandidateEligibility,
  PaymentSandboxApprovalCandidateObservation,
  PaymentSandboxApprovalCandidateResult,
  PaymentSandboxApprovalCandidateStatus,
} from "./payment-sandbox-approval-candidate.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
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

function statusFor(
  issuance: PaymentSandboxReviewDecisionIssuanceResult,
): PaymentSandboxApprovalCandidateStatus {
  if (issuance.issuanceStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (issuance.issuanceStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (!issuance.eligibility.eligibleForPreviewIssuance) {
    return "blocked-issuance-not-prepared";
  }
  return "prepared-not-created";
}

function createEligibility(
  issuance: PaymentSandboxReviewDecisionIssuanceResult,
  issuanceAuditMatched: boolean,
): PaymentSandboxApprovalCandidateEligibility {
  const issuancePrepared =
    issuance.issuanceStatus === "prepared-not-issued" &&
    issuance.eligibility.eligibleForPreviewIssuance &&
    issuance.items.every((item) => item.issuancePrepared);
  const issuanceUnsigned =
    issuance.items.every((item) => item.issuanceSigned === false) &&
    issuance.issuanceEnvelope.signed === false &&
    issuance.issuanceEnvelope.body.issuanceSigned === false;
  const issuanceNotSubmitted =
    issuance.items.every((item) => item.issuanceSubmitted === false) &&
    issuance.issuanceEnvelope.submitted === false &&
    issuance.issuanceEnvelope.body.issuanceSubmitted === false;
  const issuanceNotPersisted =
    issuance.items.every((item) => item.issuancePersisted === false) &&
    issuance.issuanceEnvelope.persisted === false &&
    issuance.issuanceEnvelope.body.issuancePersisted === false;
  const decisionNotIssued =
    issuance.eligibility.decisionNotIssued &&
    issuance.issuanceEnvelope.body.decisionIssued === false;
  const decisionNotPersisted =
    issuance.eligibility.decisionNotPersisted &&
    issuance.issuanceEnvelope.body.decisionPersisted === false;
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

  const eligibleForPreviewApproval =
    issuanceAuditMatched &&
    issuance.environment === "sandbox" &&
    issuancePrepared &&
    issuanceUnsigned &&
    issuanceNotSubmitted &&
    issuanceNotPersisted &&
    decisionNotIssued &&
    decisionNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    issuanceAuditMatched,
    environmentSandbox: issuance.environment === "sandbox",
    issuancePrepared,
    issuanceUnsigned,
    issuanceNotSubmitted,
    issuanceNotPersisted,
    decisionNotIssued,
    decisionNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewApproval,
    reasons: Object.freeze(
      eligibleForPreviewApproval
        ? ["eligible-for-preview-approval-candidate"]
        : [
            ...(issuanceAuditMatched ? [] : ["issuance-audit-mismatch"]),
            ...(issuance.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(issuancePrepared ? [] : ["issuance-not-prepared"]),
            ...(issuanceUnsigned ? [] : ["issuance-signed"]),
            ...(issuanceNotSubmitted ? [] : ["issuance-submitted"]),
            ...(issuanceNotPersisted ? [] : ["issuance-persisted"]),
            ...(decisionNotIssued ? [] : ["decision-issued"]),
            ...(decisionNotPersisted ? [] : ["decision-persisted"]),
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

function approvalCandidateIdFor(
  issuance: PaymentSandboxReviewDecisionIssuanceResult,
  status: PaymentSandboxApprovalCandidateStatus,
): string {
  return fingerprint([
    "f07a-3n-r1",
    issuance.issuanceId,
    issuance.upstreamDecisionFingerprint,
    REVIEWER_ALIAS,
    status,
  ]);
}

export function createPaymentSandboxApprovalCandidate(
  upstreamIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxApprovalCandidateResult {
  validatePaymentSandboxReviewDecisionIssuance(
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const issuanceAudit = auditPaymentSandboxReviewDecisionIssuance(
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (issuanceAudit.status !== "matched") {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_ISSUANCE_AUDIT_FAILED");
  }

  const eligibility = createEligibility(upstreamIssuance, true);
  const approvalStatus = statusFor(upstreamIssuance);
  const approvalCandidateId = approvalCandidateIdFor(
    upstreamIssuance,
    approvalStatus,
  );

  const items = Object.freeze(
    upstreamIssuance.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: eligibility.eligibleForPreviewApproval
          ? REVIEWER_ALIAS
          : null,
        issuanceId: upstreamIssuance.issuanceId,
        approvalPrepared: eligibility.eligibleForPreviewApproval,
        approvalCreated: false as const,
        approvalPersisted: false as const,
        approvedAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3n-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamIssuanceId: upstreamIssuance.issuanceId,
    upstreamIssuanceFingerprint: upstreamIssuance.issuanceId,
    providerKey: upstreamIssuance.providerKey,
    adapterState: upstreamIssuance.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    approvalCandidateId,
    approvalStatus,
    eligibility,
    items,
    approvalEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3n-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        approvalCandidateId,
        issuanceId: upstreamIssuance.issuanceId,
        upstreamIssuanceFingerprint: upstreamIssuance.issuanceId,
        providerKey: upstreamIssuance.providerKey,
        adapterState: upstreamIssuance.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        approvalPrepared: eligibility.eligibleForPreviewApproval,
        approvalCreated: false as const,
        approvalPersisted: false as const,
        approvalTokenCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxApprovalCandidate(
    result,
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  return result;
}

export function validatePaymentSandboxApprovalCandidate(
  result: PaymentSandboxApprovalCandidateResult,
  upstreamIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxReviewDecisionIssuance(
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const issuanceAudit = auditPaymentSandboxReviewDecisionIssuance(
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedEligibility = createEligibility(
    upstreamIssuance,
    issuanceAudit.status === "matched",
  );
  const expectedStatus = statusFor(upstreamIssuance);
  const expectedId = approvalCandidateIdFor(upstreamIssuance, expectedStatus);
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3n-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_SCHEMA_INVALID");
  }

  if (
    result.upstreamIssuanceId !== upstreamIssuance.issuanceId ||
    result.upstreamIssuanceFingerprint !== upstreamIssuance.issuanceId ||
    result.providerKey !== upstreamIssuance.providerKey ||
    result.adapterState !== upstreamIssuance.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.approvalStatus !== expectedStatus ||
    result.approvalCandidateId !== expectedId
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_BINDING_MISMATCH");
  }

  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_ITEM_SET_INVALID");
  }

  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewApproval
            ? REVIEWER_ALIAS
            : null) ||
        item.issuanceId !== upstreamIssuance.issuanceId ||
        item.approvalPrepared !==
          expectedEligibility.eligibleForPreviewApproval ||
        item.approvalCreated !== false ||
        item.approvalPersisted !== false ||
        item.approvedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_ITEM_INVALID");
  }

  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_ELIGIBILITY_INVALID");
  }

  const envelope = result.approvalEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.approvalCandidateId !== result.approvalCandidateId ||
    envelope.body.issuanceId !== upstreamIssuance.issuanceId ||
    envelope.body.approvalPrepared !==
      expectedEligibility.eligibleForPreviewApproval ||
    envelope.body.approvalCreated !== false ||
    envelope.body.approvalPersisted !== false ||
    envelope.body.approvalTokenCreated !== false ||
    envelope.body.activationCreated !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_CANDIDATE_ENVELOPE_INVALID");
  }

  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_APPROVAL_CANDIDATE_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxApprovalCandidateResult,
): PaymentSandboxApprovalCandidateObservation {
  return Object.freeze({
    upstreamIssuanceFingerprint: result.upstreamIssuanceFingerprint,
    approvalCandidateId: result.approvalCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    issuanceSigned: false,
    issuanceSubmitted: false,
    issuancePersisted: false,
    decisionIssued: false,
    decisionPersisted: false,
    approvalCreated: false,
    approvalPersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    activationArtifactPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxApprovalCandidate(
  result: PaymentSandboxApprovalCandidateResult,
  upstreamIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxApprovalCandidateObservation = defaultObservation(
    result,
  ),
): PaymentSandboxApprovalCandidateAudit {
  validatePaymentSandboxApprovalCandidate(
    result,
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const issuanceAudit = auditPaymentSandboxReviewDecisionIssuance(
    upstreamIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedKeys = REQUIRED_ITEM_KEYS;

  const checks: PaymentSandboxApprovalCandidateAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3n-r1",
    environmentSandbox: result.environment === "sandbox",
    issuanceAuditMatched: issuanceAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamIssuanceFingerprint ===
      result.upstreamIssuanceFingerprint,
    approvalCandidateIdMatches:
      observation.approvalCandidateId === result.approvalCandidateId,
    requiredItemSetMatches:
      observation.itemKeys.length === expectedKeys.length &&
      expectedKeys.every((key) => observation.itemKeys.includes(key)),
    reviewerAliasOpaque:
      observation.reviewerAlias === REVIEWER_ALIAS &&
      result.reviewerAlias === REVIEWER_ALIAS,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    issuanceUnsigned: observation.issuanceSigned === false,
    issuanceNotSubmitted: observation.issuanceSubmitted === false,
    issuanceNotPersisted: observation.issuancePersisted === false,
    decisionNotIssued: observation.decisionIssued === false,
    decisionNotPersisted: observation.decisionPersisted === false,
    approvalNotCreated: observation.approvalCreated === false,
    approvalNotPersisted: observation.approvalPersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    activationArtifactAbsent: observation.activationArtifactPresent === false,
    providerAndSettlementArtifactsAbsent:
      observation.providerRequestPresent === false &&
      observation.settlementInstructionPresent === false,
    registryMutationAbsent: observation.registryMutationPresent === false,
    productionAndExecutionBlocked:
      observation.productionEligible === false &&
      observation.executionEligible === false,
  });

  return Object.freeze({
    schemaVersion: "f07a-3n-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
