// F07A-3L_PAYMENT_SANDBOX_REVIEW_DECISION_CANDIDATE_R1
// F07A_3L_REUSE_F07A_3K_ATTESTATION_WITHOUT_DUPLICATION
// F07A_3L_DECISION_PREPARED_BUT_NEVER_ISSUED_OR_PERSISTED
// F07A_3L_OPAQUE_FIXTURE_REVIEWER_ALIAS_ONLY
// F07A_3L_APPROVAL_ACTIVATION_ALWAYS_ABSENT
// F07A_3L_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import {
  auditPaymentSandboxReviewerAttestation,
  validatePaymentSandboxReviewerAttestation,
} from "./payment-sandbox-reviewer-attestation";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type {
  PaymentSandboxReviewDecisionAudit,
  PaymentSandboxReviewDecisionAuditChecks,
  PaymentSandboxReviewDecisionEligibility,
  PaymentSandboxReviewDecisionItem,
  PaymentSandboxReviewDecisionItemStatus,
  PaymentSandboxReviewDecisionObservation,
  PaymentSandboxReviewDecisionOutcome,
  PaymentSandboxReviewDecisionResult,
  PaymentSandboxReviewDecisionStatus,
} from "./payment-sandbox-review-decision.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const DECISION_OUTCOME = "sandbox-approval-recommended-preview-only" as const;
const DECISION_REASON = "review-attestation-matched-preview-only" as const;

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

function decisionStatusFor(
  attestation: PaymentSandboxReviewerAttestationResult,
): PaymentSandboxReviewDecisionStatus {
  if (attestation.attestationStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (attestation.attestationStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  return "prepared-not-issued";
}

function itemStatusFor(
  status: PaymentSandboxReviewDecisionStatus,
): PaymentSandboxReviewDecisionItemStatus {
  if (status === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (status === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  return "decision-prepared-preview-only";
}

function createEligibility(
  attestation: PaymentSandboxReviewerAttestationResult,
  attestationAuditMatched: boolean,
): PaymentSandboxReviewDecisionEligibility {
  const attestationPrepared =
    attestation.attestationStatus === "prepared-not-signed" &&
    attestation.eligibility.eligibleForPreviewAttestation &&
    attestation.items.every((item) => item.attestationPrepared);

  const attestationUnsigned =
    attestation.attestationEnvelope.signed === false &&
    attestation.items.every((item) => item.attestationSigned === false);

  const attestationNotPersisted =
    attestation.attestationEnvelope.persisted === false &&
    attestation.items.every((item) => item.attestationPersisted === false);

  const reviewerAliasOpaque = attestation.reviewerAlias === REVIEWER_ALIAS;
  const assignmentNotPersisted = attestation.eligibility.assignmentNotPersisted;

  const itemKeys = attestation.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));

  const noExecutionGuardrailsIntact =
    attestation.productionEligible === false &&
    attestation.executionEligible === false &&
    Object.values(attestation.artifacts).every((value) => value === false);

  const eligibleForPreviewDecision =
    attestationAuditMatched &&
    attestation.environment === "sandbox" &&
    attestationPrepared &&
    attestationUnsigned &&
    attestationNotPersisted &&
    reviewerAliasOpaque &&
    assignmentNotPersisted &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    attestationAuditMatched,
    environmentSandbox: attestation.environment === "sandbox",
    attestationPrepared,
    attestationUnsigned,
    attestationNotPersisted,
    reviewerAliasOpaque,
    assignmentNotPersisted,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewDecision,
    reasons: Object.freeze(
      eligibleForPreviewDecision
        ? ["eligible-for-preview-review-decision"]
        : [
            ...(attestationAuditMatched ? [] : ["attestation-audit-mismatch"]),
            ...(attestation.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(attestationPrepared ? [] : ["attestation-not-prepared"]),
            ...(attestationUnsigned ? [] : ["attestation-already-signed"]),
            ...(attestationNotPersisted ? [] : ["attestation-persisted"]),
            ...(reviewerAliasOpaque ? [] : ["reviewer-alias-not-opaque"]),
            ...(assignmentNotPersisted ? [] : ["assignment-persisted"]),
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

function decisionIdFor(
  attestation: PaymentSandboxReviewerAttestationResult,
  status: PaymentSandboxReviewDecisionStatus,
): string {
  return fingerprint([
    "f07a-3l-r1",
    attestation.attestationId,
    attestation.upstreamAssignmentFingerprint,
    REVIEWER_ALIAS,
    DECISION_OUTCOME,
    DECISION_REASON,
    status,
  ]);
}

function createItems(
  attestation: PaymentSandboxReviewerAttestationResult,
  status: PaymentSandboxReviewDecisionStatus,
  eligible: boolean,
): readonly PaymentSandboxReviewDecisionItem[] {
  const itemStatus = itemStatusFor(status);
  return Object.freeze(
    attestation.items.map((item) =>
      Object.freeze({
        key: item.key,
        status: itemStatus,
        reviewerAlias: eligible ? REVIEWER_ALIAS : null,
        attestationId: attestation.attestationId,
        proposedOutcome: eligible ? DECISION_OUTCOME : null,
        decisionReason: DECISION_REASON,
        decisionPrepared: eligible,
        decisionIssued: false as const,
        decisionPersisted: false as const,
        decidedAt: null,
      }),
    ),
  );
}

export function createPaymentSandboxReviewDecision(
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxReviewDecisionResult {
  validatePaymentSandboxReviewerAttestation(
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const attestationAudit = auditPaymentSandboxReviewerAttestation(
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (attestationAudit.status !== "matched") {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ATTESTATION_AUDIT_FAILED");
  }

  const eligibility = createEligibility(upstreamAttestation, true);
  const decisionStatus = decisionStatusFor(upstreamAttestation);
  const decisionId = decisionIdFor(upstreamAttestation, decisionStatus);
  const items = createItems(
    upstreamAttestation,
    decisionStatus,
    eligibility.eligibleForPreviewDecision,
  );
  const proposedOutcome: PaymentSandboxReviewDecisionOutcome | null =
    eligibility.eligibleForPreviewDecision ? DECISION_OUTCOME : null;

  const result = Object.freeze({
    schemaVersion: "f07a-3l-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamAttestationId: upstreamAttestation.attestationId,
    upstreamAttestationFingerprint: upstreamAttestation.attestationId,
    providerKey: upstreamAttestation.providerKey,
    adapterState: upstreamAttestation.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    decisionId,
    decisionStatus,
    eligibility,
    items,
    decisionEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3l-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        decisionId,
        attestationId: upstreamAttestation.attestationId,
        upstreamAttestationFingerprint: upstreamAttestation.attestationId,
        providerKey: upstreamAttestation.providerKey,
        adapterState: upstreamAttestation.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        proposedOutcome,
        decisionReason: DECISION_REASON,
        decisionPrepared: eligibility.eligibleForPreviewDecision,
        decisionIssued: false as const,
        decisionPersisted: false as const,
        approvalCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      assignmentRecordCreated: false as const,
      reviewerIdentityRecordCreated: false as const,
      reviewerAttestationRecordCreated: false as const,
      reviewDecisionRecordCreated: false as const,
      approvalCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxReviewDecision(
    result,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  return result;
}

export function validatePaymentSandboxReviewDecision(
  result: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxReviewerAttestation(
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const attestationAudit = auditPaymentSandboxReviewerAttestation(
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedEligibility = createEligibility(
    upstreamAttestation,
    attestationAudit.status === "matched",
  );
  const expectedStatus = decisionStatusFor(upstreamAttestation);
  const expectedItemStatus = itemStatusFor(expectedStatus);
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3l-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_SCHEMA_INVALID");
  }
  if (
    result.upstreamAttestationId !== upstreamAttestation.attestationId ||
    result.upstreamAttestationFingerprint !==
      upstreamAttestation.attestationId ||
    result.providerKey !== upstreamAttestation.providerKey ||
    result.adapterState !== upstreamAttestation.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.decisionStatus !== expectedStatus ||
    result.decisionId !== decisionIdFor(upstreamAttestation, expectedStatus)
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_BINDING_MISMATCH");
  }
  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ITEM_SET_INVALID");
  }
  if (
    result.items.some(
      (item) =>
        item.status !== expectedItemStatus ||
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewDecision
            ? REVIEWER_ALIAS
            : null) ||
        item.attestationId !== upstreamAttestation.attestationId ||
        item.proposedOutcome !==
          (expectedEligibility.eligibleForPreviewDecision
            ? DECISION_OUTCOME
            : null) ||
        item.decisionReason !== DECISION_REASON ||
        item.decisionPrepared !==
          expectedEligibility.eligibleForPreviewDecision ||
        item.decisionIssued !== false ||
        item.decisionPersisted !== false ||
        item.decidedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ITEM_INVALID");
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ELIGIBILITY_INVALID");
  }

  const envelope = result.decisionEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.decisionId !== result.decisionId ||
    envelope.body.attestationId !== upstreamAttestation.attestationId ||
    envelope.body.decisionPrepared !==
      expectedEligibility.eligibleForPreviewDecision ||
    envelope.body.decisionIssued !== false ||
    envelope.body.decisionPersisted !== false ||
    envelope.body.approvalCreated !== false ||
    envelope.body.activationCreated !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEW_DECISION_ENVELOPE_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEW_DECISION_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxReviewDecisionResult,
): PaymentSandboxReviewDecisionObservation {
  return Object.freeze({
    upstreamAttestationFingerprint: result.upstreamAttestationFingerprint,
    decisionId: result.decisionId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    assignmentPersisted: false,
    attestationSigned: false,
    attestationPersisted: false,
    decisionIssued: false,
    decisionPersisted: false,
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

export function auditPaymentSandboxReviewDecision(
  result: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxReviewDecisionObservation = defaultObservation(
    result,
  ),
): PaymentSandboxReviewDecisionAudit {
  validatePaymentSandboxReviewDecision(
    result,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const attestationAudit = auditPaymentSandboxReviewerAttestation(
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedItemStatus = itemStatusFor(
    decisionStatusFor(upstreamAttestation),
  );
  const checks: PaymentSandboxReviewDecisionAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3l-r1",
    environmentSandbox: result.environment === "sandbox",
    attestationAuditMatched: attestationAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamAttestationFingerprint ===
      result.upstreamAttestationFingerprint,
    decisionIdMatches: observation.decisionId === result.decisionId,
    requiredItemSetMatches:
      observation.itemKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observation.itemKeys.includes(key)),
    itemStatusesMatchEligibility: result.items.every(
      (item) => item.status === expectedItemStatus,
    ),
    reviewerAliasOpaque:
      observation.reviewerAlias === REVIEWER_ALIAS &&
      result.reviewerAlias === REVIEWER_ALIAS,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    assignmentNotPersisted: observation.assignmentPersisted === false,
    attestationUnsigned: observation.attestationSigned === false,
    attestationNotPersisted: observation.attestationPersisted === false,
    decisionNotIssued: observation.decisionIssued === false,
    decisionNotPersisted: observation.decisionPersisted === false,
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
  });

  return Object.freeze({
    schemaVersion: "f07a-3l-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
