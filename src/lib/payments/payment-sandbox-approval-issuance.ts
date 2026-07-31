// F07A-3O_PAYMENT_SANDBOX_APPROVAL_ISSUANCE_R1
// F07A_3O_REUSE_F07A_3N_APPROVAL_WITHOUT_DUPLICATION
// F07A_3O_ISSUANCE_PREPARED_BUT_NEVER_SIGNED_SUBMITTED_OR_PERSISTED
// F07A_3O_APPROVAL_REMAINS_UNCREATED_AND_UNPERSISTED
// F07A_3O_ACTIVATION_ALWAYS_ABSENT
// F07A_3O_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import {
  auditPaymentSandboxApprovalCandidate,
  validatePaymentSandboxApprovalCandidate,
} from "./payment-sandbox-approval-candidate";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type {
  PaymentSandboxApprovalIssuanceAudit,
  PaymentSandboxApprovalIssuanceAuditChecks,
  PaymentSandboxApprovalIssuanceEligibility,
  PaymentSandboxApprovalIssuanceObservation,
  PaymentSandboxApprovalIssuanceResult,
  PaymentSandboxApprovalIssuanceStatus,
} from "./payment-sandbox-approval-issuance.types";

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
  approval: PaymentSandboxApprovalCandidateResult,
): PaymentSandboxApprovalIssuanceStatus {
  if (approval.approvalStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (approval.approvalStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (!approval.eligibility.eligibleForPreviewApproval) {
    return "blocked-approval-not-prepared";
  }
  return "prepared-not-issued";
}

function createEligibility(
  approval: PaymentSandboxApprovalCandidateResult,
  approvalAuditMatched: boolean,
): PaymentSandboxApprovalIssuanceEligibility {
  const approvalPrepared =
    approval.approvalStatus === "prepared-not-created" &&
    approval.eligibility.eligibleForPreviewApproval &&
    approval.items.every((item) => item.approvalPrepared);
  const approvalNotCreated =
    approval.items.every((item) => item.approvalCreated === false) &&
    approval.approvalEnvelope.body.approvalCreated === false &&
    approval.artifacts.approvalRecordCreated === false;
  const approvalNotPersisted =
    approval.items.every((item) => item.approvalPersisted === false) &&
    approval.approvalEnvelope.body.approvalPersisted === false &&
    approval.approvalEnvelope.persisted === false;
  const approvalEnvelopeUnsigned = approval.approvalEnvelope.signed === false;
  const approvalEnvelopeNotSubmitted =
    approval.approvalEnvelope.submitted === false;
  const approvalEnvelopeNotPersisted =
    approval.approvalEnvelope.persisted === false;
  const reviewerAliasOpaque = approval.reviewerAlias === REVIEWER_ALIAS;
  const itemKeys = approval.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    approval.productionEligible === false &&
    approval.executionEligible === false &&
    Object.values(approval.artifacts).every((value) => value === false);

  const eligibleForPreviewIssuance =
    approvalAuditMatched &&
    approval.environment === "sandbox" &&
    approvalPrepared &&
    approvalNotCreated &&
    approvalNotPersisted &&
    approvalEnvelopeUnsigned &&
    approvalEnvelopeNotSubmitted &&
    approvalEnvelopeNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    approvalAuditMatched,
    environmentSandbox: approval.environment === "sandbox",
    approvalPrepared,
    approvalNotCreated,
    approvalNotPersisted,
    approvalEnvelopeUnsigned,
    approvalEnvelopeNotSubmitted,
    approvalEnvelopeNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewIssuance,
    reasons: Object.freeze(
      eligibleForPreviewIssuance
        ? ["eligible-for-preview-approval-issuance"]
        : [
            ...(approvalAuditMatched ? [] : ["approval-audit-mismatch"]),
            ...(approval.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(approvalPrepared ? [] : ["approval-not-prepared"]),
            ...(approvalNotCreated ? [] : ["approval-created"]),
            ...(approvalNotPersisted ? [] : ["approval-persisted"]),
            ...(approvalEnvelopeUnsigned ? [] : ["approval-envelope-signed"]),
            ...(approvalEnvelopeNotSubmitted
              ? []
              : ["approval-envelope-submitted"]),
            ...(approvalEnvelopeNotPersisted
              ? []
              : ["approval-envelope-persisted"]),
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

function approvalIssuanceIdFor(
  approval: PaymentSandboxApprovalCandidateResult,
  status: PaymentSandboxApprovalIssuanceStatus,
): string {
  return fingerprint([
    "f07a-3o-r1",
    approval.approvalCandidateId,
    approval.upstreamIssuanceFingerprint,
    REVIEWER_ALIAS,
    status,
  ]);
}

export function createPaymentSandboxApprovalIssuance(
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxApprovalIssuanceResult {
  validatePaymentSandboxApprovalCandidate(
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const approvalAudit = auditPaymentSandboxApprovalCandidate(
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (approvalAudit.status !== "matched") {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_APPROVAL_AUDIT_FAILED");
  }

  const eligibility = createEligibility(upstreamApproval, true);
  const issuanceStatus = statusFor(upstreamApproval);
  const approvalIssuanceId = approvalIssuanceIdFor(
    upstreamApproval,
    issuanceStatus,
  );
  const items = Object.freeze(
    upstreamApproval.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: eligibility.eligibleForPreviewIssuance
          ? REVIEWER_ALIAS
          : null,
        approvalCandidateId: upstreamApproval.approvalCandidateId,
        issuancePrepared: eligibility.eligibleForPreviewIssuance,
        issuanceSigned: false as const,
        issuanceSubmitted: false as const,
        issuancePersisted: false as const,
        issuedAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3o-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamApprovalCandidateId: upstreamApproval.approvalCandidateId,
    upstreamApprovalCandidateFingerprint: upstreamApproval.approvalCandidateId,
    providerKey: upstreamApproval.providerKey,
    adapterState: upstreamApproval.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    approvalIssuanceId,
    issuanceStatus,
    eligibility,
    items,
    issuanceEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3o-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        approvalIssuanceId,
        approvalCandidateId: upstreamApproval.approvalCandidateId,
        upstreamApprovalCandidateFingerprint:
          upstreamApproval.approvalCandidateId,
        providerKey: upstreamApproval.providerKey,
        adapterState: upstreamApproval.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        issuancePrepared: eligibility.eligibleForPreviewIssuance,
        issuanceSigned: false as const,
        issuanceSubmitted: false as const,
        issuancePersisted: false as const,
        approvalCreated: false as const,
        approvalPersisted: false as const,
        approvalTokenCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalIssuanceRecordCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxApprovalIssuance(
    result,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  return result;
}

export function validatePaymentSandboxApprovalIssuance(
  result: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxApprovalCandidate(
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const approvalAudit = auditPaymentSandboxApprovalCandidate(
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedEligibility = createEligibility(
    upstreamApproval,
    approvalAudit.status === "matched",
  );
  const expectedStatus = statusFor(upstreamApproval);
  const expectedId = approvalIssuanceIdFor(upstreamApproval, expectedStatus);
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3o-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_SCHEMA_INVALID");
  }
  if (
    result.upstreamApprovalCandidateId !==
      upstreamApproval.approvalCandidateId ||
    result.upstreamApprovalCandidateFingerprint !==
      upstreamApproval.approvalCandidateId ||
    result.providerKey !== upstreamApproval.providerKey ||
    result.adapterState !== upstreamApproval.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.issuanceStatus !== expectedStatus ||
    result.approvalIssuanceId !== expectedId
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_BINDING_MISMATCH");
  }
  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_ITEM_SET_INVALID");
  }
  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewIssuance
            ? REVIEWER_ALIAS
            : null) ||
        item.approvalCandidateId !== upstreamApproval.approvalCandidateId ||
        item.issuancePrepared !==
          expectedEligibility.eligibleForPreviewIssuance ||
        item.issuanceSigned !== false ||
        item.issuanceSubmitted !== false ||
        item.issuancePersisted !== false ||
        item.issuedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_ITEM_INVALID");
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_ELIGIBILITY_INVALID");
  }
  const envelope = result.issuanceEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.approvalIssuanceId !== result.approvalIssuanceId ||
    envelope.body.approvalCandidateId !==
      upstreamApproval.approvalCandidateId ||
    envelope.body.issuancePrepared !==
      expectedEligibility.eligibleForPreviewIssuance ||
    envelope.body.issuanceSigned !== false ||
    envelope.body.issuanceSubmitted !== false ||
    envelope.body.issuancePersisted !== false ||
    envelope.body.approvalCreated !== false ||
    envelope.body.approvalPersisted !== false ||
    envelope.body.approvalTokenCreated !== false ||
    envelope.body.activationCreated !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_ISSUANCE_ENVELOPE_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_APPROVAL_ISSUANCE_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxApprovalIssuanceResult,
): PaymentSandboxApprovalIssuanceObservation {
  return Object.freeze({
    upstreamApprovalCandidateFingerprint:
      result.upstreamApprovalCandidateFingerprint,
    approvalIssuanceId: result.approvalIssuanceId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    approvalCreated: false,
    approvalPersisted: false,
    issuanceSigned: false,
    issuanceSubmitted: false,
    issuancePersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    approvalTokenPresent: false,
    activationArtifactPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxApprovalIssuance(
  result: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxApprovalIssuanceObservation = defaultObservation(
    result,
  ),
): PaymentSandboxApprovalIssuanceAudit {
  validatePaymentSandboxApprovalIssuance(
    result,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const approvalAudit = auditPaymentSandboxApprovalCandidate(
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedKeys = REQUIRED_ITEM_KEYS;
  const checks: PaymentSandboxApprovalIssuanceAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3o-r1",
    environmentSandbox: result.environment === "sandbox",
    approvalAuditMatched: approvalAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamApprovalCandidateFingerprint ===
      result.upstreamApprovalCandidateFingerprint,
    approvalIssuanceIdMatches:
      observation.approvalIssuanceId === result.approvalIssuanceId,
    requiredItemSetMatches:
      observation.itemKeys.length === expectedKeys.length &&
      expectedKeys.every((key) => observation.itemKeys.includes(key)),
    reviewerAliasOpaque:
      observation.reviewerAlias === REVIEWER_ALIAS &&
      result.reviewerAlias === REVIEWER_ALIAS,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    approvalNotCreated: observation.approvalCreated === false,
    approvalNotPersisted: observation.approvalPersisted === false,
    issuanceUnsigned: observation.issuanceSigned === false,
    issuanceNotSubmitted: observation.issuanceSubmitted === false,
    issuanceNotPersisted: observation.issuancePersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    approvalTokenAbsent: observation.approvalTokenPresent === false,
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
    schemaVersion: "f07a-3o-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
