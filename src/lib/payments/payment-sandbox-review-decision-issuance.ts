// F07A-3M_PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_CANDIDATE_R1
// F07A_3M_REUSE_F07A_3L_DECISION_WITHOUT_DUPLICATION
// F07A_3M_ISSUANCE_PREPARED_BUT_NEVER_SIGNED_SUBMITTED_OR_PERSISTED
// F07A_3M_DECISION_REMAINS_UNISSUED_AND_UNPERSISTED
// F07A_3M_APPROVAL_ACTIVATION_ALWAYS_ABSENT
// F07A_3M_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import {
  auditPaymentSandboxReviewDecision,
  validatePaymentSandboxReviewDecision,
} from "./payment-sandbox-review-decision";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type {
  PaymentSandboxReviewDecisionIssuanceAudit,
  PaymentSandboxReviewDecisionIssuanceAuditChecks,
  PaymentSandboxReviewDecisionIssuanceEligibility,
  PaymentSandboxReviewDecisionIssuanceObservation,
  PaymentSandboxReviewDecisionIssuanceResult,
  PaymentSandboxReviewDecisionIssuanceStatus,
} from "./payment-sandbox-review-decision-issuance.types";

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
  decision: PaymentSandboxReviewDecisionResult,
): PaymentSandboxReviewDecisionIssuanceStatus {
  if (decision.decisionStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (decision.decisionStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (!decision.eligibility.eligibleForPreviewDecision) {
    return "blocked-decision-not-prepared";
  }
  return "prepared-not-issued";
}

function createEligibility(
  decision: PaymentSandboxReviewDecisionResult,
  decisionAuditMatched: boolean,
): PaymentSandboxReviewDecisionIssuanceEligibility {
  const decisionPrepared =
    decision.decisionStatus === "prepared-not-issued" &&
    decision.eligibility.eligibleForPreviewDecision &&
    decision.items.every((item) => item.decisionPrepared);
  const decisionNotIssued =
    decision.items.every((item) => item.decisionIssued === false) &&
    decision.decisionEnvelope.body.decisionIssued === false;
  const decisionNotPersisted =
    decision.items.every((item) => item.decisionPersisted === false) &&
    decision.decisionEnvelope.persisted === false &&
    decision.decisionEnvelope.body.decisionPersisted === false;
  const attestationUnsigned = decision.eligibility.attestationUnsigned;
  const reviewerAliasOpaque = decision.reviewerAlias === REVIEWER_ALIAS;
  const itemKeys = decision.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    decision.productionEligible === false &&
    decision.executionEligible === false &&
    Object.values(decision.artifacts).every((value) => value === false);

  const eligibleForPreviewIssuance =
    decisionAuditMatched &&
    decision.environment === "sandbox" &&
    decisionPrepared &&
    decisionNotIssued &&
    decisionNotPersisted &&
    attestationUnsigned &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    decisionAuditMatched,
    environmentSandbox: decision.environment === "sandbox",
    decisionPrepared,
    decisionNotIssued,
    decisionNotPersisted,
    attestationUnsigned,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewIssuance,
    reasons: Object.freeze(
      eligibleForPreviewIssuance
        ? ["eligible-for-preview-decision-issuance"]
        : [
            ...(decisionAuditMatched ? [] : ["decision-audit-mismatch"]),
            ...(decision.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(decisionPrepared ? [] : ["decision-not-prepared"]),
            ...(decisionNotIssued ? [] : ["decision-already-issued"]),
            ...(decisionNotPersisted ? [] : ["decision-persisted"]),
            ...(attestationUnsigned ? [] : ["attestation-signed"]),
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

function issuanceIdFor(
  decision: PaymentSandboxReviewDecisionResult,
  status: PaymentSandboxReviewDecisionIssuanceStatus,
): string {
  return fingerprint([
    "f07a-3m-r1",
    decision.decisionId,
    decision.upstreamAttestationFingerprint,
    REVIEWER_ALIAS,
    status,
  ]);
}

export function createPaymentSandboxReviewDecisionIssuance(
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxReviewDecisionIssuanceResult {
  validatePaymentSandboxReviewDecision(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const decisionAudit = auditPaymentSandboxReviewDecision(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (decisionAudit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_DECISION_AUDIT_FAILED",
    );
  }

  const eligibility = createEligibility(upstreamDecision, true);
  const issuanceStatus = statusFor(upstreamDecision);
  const issuanceId = issuanceIdFor(upstreamDecision, issuanceStatus);
  const items = Object.freeze(
    upstreamDecision.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: eligibility.eligibleForPreviewIssuance
          ? REVIEWER_ALIAS
          : null,
        decisionId: upstreamDecision.decisionId,
        issuancePrepared: eligibility.eligibleForPreviewIssuance,
        issuanceSigned: false as const,
        issuanceSubmitted: false as const,
        issuancePersisted: false as const,
        issuedAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3m-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamDecisionId: upstreamDecision.decisionId,
    upstreamDecisionFingerprint: upstreamDecision.decisionId,
    providerKey: upstreamDecision.providerKey,
    adapterState: upstreamDecision.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    issuanceId,
    issuanceStatus,
    eligibility,
    items,
    issuanceEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3m-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        issuanceId,
        decisionId: upstreamDecision.decisionId,
        upstreamDecisionFingerprint: upstreamDecision.decisionId,
        providerKey: upstreamDecision.providerKey,
        adapterState: upstreamDecision.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        issuancePrepared: eligibility.eligibleForPreviewIssuance,
        issuanceSigned: false as const,
        issuanceSubmitted: false as const,
        issuancePersisted: false as const,
        decisionIssued: false as const,
        decisionPersisted: false as const,
        approvalCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      decisionIssuanceRecordCreated: false as const,
      reviewDecisionRecordCreated: false as const,
      approvalCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxReviewDecisionIssuance(
    result,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  return result;
}

export function validatePaymentSandboxReviewDecisionIssuance(
  result: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxReviewDecision(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const audit = auditPaymentSandboxReviewDecision(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedEligibility = createEligibility(
    upstreamDecision,
    audit.status === "matched",
  );
  const expectedStatus = statusFor(upstreamDecision);
  const expectedId = issuanceIdFor(upstreamDecision, expectedStatus);

  if (
    result.schemaVersion !== "f07a-3m-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_SCHEMA_INVALID");
  }
  if (
    result.upstreamDecisionId !== upstreamDecision.decisionId ||
    result.upstreamDecisionFingerprint !== upstreamDecision.decisionId ||
    result.providerKey !== upstreamDecision.providerKey ||
    result.adapterState !== upstreamDecision.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.issuanceStatus !== expectedStatus ||
    result.issuanceId !== expectedId
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_BINDING_MISMATCH",
    );
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_ELIGIBILITY_INVALID",
    );
  }
  if (
    result.items.length !== REQUIRED_ITEM_KEYS.length ||
    result.items.some(
      (item) =>
        !REQUIRED_ITEM_KEYS.includes(item.key) ||
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewIssuance
            ? REVIEWER_ALIAS
            : null) ||
        item.decisionId !== upstreamDecision.decisionId ||
        item.issuancePrepared !==
          expectedEligibility.eligibleForPreviewIssuance ||
        item.issuanceSigned !== false ||
        item.issuanceSubmitted !== false ||
        item.issuancePersisted !== false ||
        item.issuedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_ITEM_INVALID");
  }

  const envelope = result.issuanceEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.issuanceId !== result.issuanceId ||
    envelope.body.decisionId !== upstreamDecision.decisionId ||
    envelope.body.issuancePrepared !==
      expectedEligibility.eligibleForPreviewIssuance ||
    envelope.body.issuanceSigned !== false ||
    envelope.body.issuanceSubmitted !== false ||
    envelope.body.issuancePersisted !== false ||
    envelope.body.decisionIssued !== false ||
    envelope.body.decisionPersisted !== false ||
    envelope.body.approvalCreated !== false ||
    envelope.body.activationCreated !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_ENVELOPE_INVALID",
    );
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEW_DECISION_ISSUANCE_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxReviewDecisionIssuanceResult,
): PaymentSandboxReviewDecisionIssuanceObservation {
  return Object.freeze({
    upstreamDecisionFingerprint: result.upstreamDecisionFingerprint,
    issuanceId: result.issuanceId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    decisionIssued: false,
    decisionPersisted: false,
    attestationSigned: false,
    issuanceSigned: false,
    issuanceSubmitted: false,
    issuancePersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    approvalArtifactPresent: false,
    activationArtifactPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxReviewDecisionIssuance(
  result: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxReviewDecisionIssuanceObservation = defaultObservation(
    result,
  ),
): PaymentSandboxReviewDecisionIssuanceAudit {
  validatePaymentSandboxReviewDecisionIssuance(
    result,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const decisionAudit = auditPaymentSandboxReviewDecision(
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedKeys = REQUIRED_ITEM_KEYS;

  const checks: PaymentSandboxReviewDecisionIssuanceAuditChecks = Object.freeze(
    {
      schemaMatches: result.schemaVersion === "f07a-3m-r1",
      environmentSandbox: result.environment === "sandbox",
      decisionAuditMatched: decisionAudit.status === "matched",
      upstreamFingerprintMatches:
        observation.upstreamDecisionFingerprint ===
        result.upstreamDecisionFingerprint,
      issuanceIdMatches: observation.issuanceId === result.issuanceId,
      requiredItemSetMatches:
        observation.itemKeys.length === expectedKeys.length &&
        expectedKeys.every((key) => observation.itemKeys.includes(key)),
      reviewerAliasOpaque:
        observation.reviewerAlias === REVIEWER_ALIAS &&
        result.reviewerAlias === REVIEWER_ALIAS,
      reviewerPiiAbsent: observation.reviewerPiiPresent === false,
      reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
      decisionNotIssued: observation.decisionIssued === false,
      decisionNotPersisted: observation.decisionPersisted === false,
      attestationUnsigned: observation.attestationSigned === false,
      issuanceUnsigned: observation.issuanceSigned === false,
      issuanceNotSubmitted: observation.issuanceSubmitted === false,
      issuanceNotPersisted: observation.issuancePersisted === false,
      envelopeUnsigned: observation.envelopeSigned === false,
      envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
      envelopeContainsNoPii: observation.envelopeContainsPii === false,
      envelopeNotSubmitted: observation.envelopeSubmitted === false,
      approvalAndActivationArtifactsAbsent:
        observation.approvalArtifactPresent === false &&
        observation.activationArtifactPresent === false,
      providerAndSettlementArtifactsAbsent:
        observation.providerRequestPresent === false &&
        observation.settlementInstructionPresent === false,
      registryMutationAbsent: observation.registryMutationPresent === false,
      productionAndExecutionBlocked:
        observation.productionEligible === false &&
        observation.executionEligible === false,
    },
  );

  return Object.freeze({
    schemaVersion: "f07a-3m-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
