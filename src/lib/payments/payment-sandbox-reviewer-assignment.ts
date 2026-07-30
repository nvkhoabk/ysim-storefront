// F07A-3J_PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_CANDIDATE_R1
// F07A_3J_REUSE_F07A_3I_HANDOFF_WITHOUT_DUPLICATION
// F07A_3J_OPAQUE_FIXTURE_REVIEWER_ALIAS_ONLY
// F07A_3J_ASSIGNMENT_PREPARED_BUT_NEVER_PERSISTED
// F07A_3J_DECISION_ATTESTATION_APPROVAL_ALWAYS_ABSENT
// F07A_3J_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import {
  auditPaymentSandboxApprovalReviewHandoff,
  validatePaymentSandboxApprovalReviewHandoff,
} from "./payment-sandbox-approval-review-handoff";
import type {
  PaymentSandboxApprovalReviewHandoffItemKey,
  PaymentSandboxApprovalReviewHandoffResult,
} from "./payment-sandbox-approval-review-handoff.types";
import type {
  PaymentSandboxReviewerAssignmentAudit,
  PaymentSandboxReviewerAssignmentAuditChecks,
  PaymentSandboxReviewerAssignmentEligibility,
  PaymentSandboxReviewerAssignmentItem,
  PaymentSandboxReviewerAssignmentItemStatus,
  PaymentSandboxReviewerAssignmentObservation,
  PaymentSandboxReviewerAssignmentResult,
  PaymentSandboxReviewerAssignmentStatus,
} from "./payment-sandbox-reviewer-assignment.types";

const REVIEWER_ROLE = "independent-sandbox-payment-reviewer" as const;
const REVIEWER_QUEUE = "payment-sandbox-independent-review" as const;
const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const REQUIRED_ITEM_KEYS = Object.freeze([
  "request-identity",
  "verification-binding",
  "approval-prerequisites",
  "no-execution-guardrails",
] as const satisfies readonly PaymentSandboxApprovalReviewHandoffItemKey[]);

function fingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const character of parts.join("|")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function assignmentStatusFor(
  handoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxReviewerAssignmentStatus {
  const adapterState = handoff.upstreamSummary.adapterState.toLowerCase();
  if (adapterState.includes("disabled")) return "blocked-adapter-disabled";
  if (adapterState.includes("missing") || adapterState.includes("absent")) {
    return "blocked-adapter-missing";
  }
  return "prepared-not-persisted";
}

function itemStatusFor(
  assignmentStatus: PaymentSandboxReviewerAssignmentStatus,
): PaymentSandboxReviewerAssignmentItemStatus {
  if (assignmentStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (assignmentStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  return "assigned-preview-only";
}

function createEligibility(
  handoff: PaymentSandboxApprovalReviewHandoffResult,
  upstreamAuditMatched: boolean,
): PaymentSandboxReviewerAssignmentEligibility {
  const adapterState = handoff.upstreamSummary.adapterState.toLowerCase();
  const adapterEligible =
    !adapterState.includes("disabled") &&
    !adapterState.includes("missing") &&
    !adapterState.includes("absent");
  const handoffPendingManualReview =
    handoff.handoffStatus === "blocked-pending-manual-review";
  const itemKeys = handoff.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    handoff.productionEligible === false &&
    handoff.executionEligible === false &&
    Object.values(handoff.artifacts).every((value) => value === false);
  const eligibleForPreviewAssignment =
    upstreamAuditMatched &&
    handoff.environment === "sandbox" &&
    adapterEligible &&
    handoffPendingManualReview &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;
  const reasons = Object.freeze(
    eligibleForPreviewAssignment
      ? ["eligible-for-preview-assignment"]
      : [
          ...(upstreamAuditMatched ? [] : ["upstream-audit-mismatch"]),
          ...(handoff.environment === "sandbox"
            ? []
            : ["environment-not-sandbox"]),
          ...(adapterEligible
            ? []
            : [
                adapterState.includes("disabled")
                  ? "provider-adapter-disabled"
                  : "provider-adapter-missing",
              ]),
          ...(handoffPendingManualReview
            ? []
            : ["handoff-not-pending-manual-review"]),
          ...(requiredItemSetComplete ? [] : ["required-item-set-incomplete"]),
          ...(noExecutionGuardrailsIntact
            ? []
            : ["no-execution-guardrails-not-intact"]),
        ],
  );

  return Object.freeze({
    upstreamAuditMatched,
    environmentSandbox: handoff.environment === "sandbox",
    adapterEligible,
    handoffPendingManualReview,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewAssignment,
    reasons,
  });
}

function assignmentIdFor(
  handoff: PaymentSandboxApprovalReviewHandoffResult,
  status: PaymentSandboxReviewerAssignmentStatus,
): string {
  return fingerprint([
    "f07a-3j-r1",
    handoff.handoffId,
    handoff.upstreamRequestFingerprint,
    status,
    REVIEWER_ROLE,
    REVIEWER_QUEUE,
    REVIEWER_ALIAS,
  ]);
}

function createItems(
  handoff: PaymentSandboxApprovalReviewHandoffResult,
  status: PaymentSandboxReviewerAssignmentStatus,
  eligible: boolean,
): readonly PaymentSandboxReviewerAssignmentItem[] {
  const itemStatus = itemStatusFor(status);
  return Object.freeze(
    handoff.items.map((item) =>
      Object.freeze({
        key: item.key,
        status: itemStatus,
        reviewerAlias: eligible ? REVIEWER_ALIAS : null,
        assignmentPrepared: eligible,
        assignmentPersisted: false as const,
        reviewedAt: null,
        decision: null,
        attestationCreated: false as const,
      }),
    ),
  );
}

export function createPaymentSandboxReviewerAssignment(
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxReviewerAssignmentResult {
  validatePaymentSandboxApprovalReviewHandoff(upstreamHandoff);
  const upstreamAudit =
    auditPaymentSandboxApprovalReviewHandoff(upstreamHandoff);
  if (upstreamAudit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_UPSTREAM_AUDIT_FAILED",
    );
  }

  const eligibility = createEligibility(upstreamHandoff, true);
  const assignmentStatus = assignmentStatusFor(upstreamHandoff);
  const assignmentId = assignmentIdFor(upstreamHandoff, assignmentStatus);
  const items = createItems(
    upstreamHandoff,
    assignmentStatus,
    eligibility.eligibleForPreviewAssignment,
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3j-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamHandoffId: upstreamHandoff.handoffId,
    upstreamHandoffFingerprint: upstreamHandoff.upstreamRequestFingerprint,
    providerKey: upstreamHandoff.upstreamSummary.providerKey,
    adapterState: upstreamHandoff.upstreamSummary.adapterState,
    assignmentId,
    assignmentStatus,
    reviewerCandidate: Object.freeze({
      role: REVIEWER_ROLE,
      queue: REVIEWER_QUEUE,
      alias: REVIEWER_ALIAS,
      identityKind: "opaque-preview-alias" as const,
      source: "fixture-only" as const,
      containsPii: false as const,
      containsCredential: false as const,
    }),
    eligibility,
    items,
    assignmentEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3j-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        assignmentId,
        handoffId: upstreamHandoff.handoffId,
        upstreamHandoffFingerprint: upstreamHandoff.upstreamRequestFingerprint,
        providerKey: upstreamHandoff.upstreamSummary.providerKey,
        adapterState: upstreamHandoff.upstreamSummary.adapterState,
        reviewerRole: REVIEWER_ROLE,
        reviewerQueue: REVIEWER_QUEUE,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        assignmentPrepared: eligibility.eligibleForPreviewAssignment,
        assignmentPersisted: false as const,
        reviewDecisionCreated: false as const,
        reviewerAttestationCreated: false as const,
        approvalCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      assignmentRecordCreated: false as const,
      reviewerIdentityRecordCreated: false as const,
      reviewerAttestationCreated: false as const,
      verificationDecisionCreated: false as const,
      approvalCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxReviewerAssignment(result, upstreamHandoff);
  return result;
}

export function validatePaymentSandboxReviewerAssignment(
  result: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxApprovalReviewHandoff(upstreamHandoff);
  const upstreamAudit =
    auditPaymentSandboxApprovalReviewHandoff(upstreamHandoff);
  const expectedEligibility = createEligibility(
    upstreamHandoff,
    upstreamAudit.status === "matched",
  );
  const expectedStatus = assignmentStatusFor(upstreamHandoff);
  const expectedItemStatus = itemStatusFor(expectedStatus);
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3j-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_SCHEMA_INVALID");
  }
  if (
    result.upstreamHandoffId !== upstreamHandoff.handoffId ||
    result.upstreamHandoffFingerprint !==
      upstreamHandoff.upstreamRequestFingerprint ||
    result.providerKey !== upstreamHandoff.upstreamSummary.providerKey ||
    result.adapterState !== upstreamHandoff.upstreamSummary.adapterState ||
    result.assignmentStatus !== expectedStatus ||
    result.assignmentId !== assignmentIdFor(upstreamHandoff, expectedStatus)
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_BINDING_MISMATCH");
  }
  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_ITEM_SET_INVALID");
  }
  if (
    result.items.some(
      (item) =>
        item.status !== expectedItemStatus ||
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewAssignment
            ? REVIEWER_ALIAS
            : null) ||
        item.assignmentPrepared !==
          expectedEligibility.eligibleForPreviewAssignment ||
        item.assignmentPersisted !== false ||
        item.reviewedAt !== null ||
        item.decision !== null ||
        item.attestationCreated !== false,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_ITEM_INVALID");
  }
  if (
    result.reviewerCandidate.role !== REVIEWER_ROLE ||
    result.reviewerCandidate.queue !== REVIEWER_QUEUE ||
    result.reviewerCandidate.alias !== REVIEWER_ALIAS ||
    result.reviewerCandidate.identityKind !== "opaque-preview-alias" ||
    result.reviewerCandidate.source !== "fixture-only" ||
    result.reviewerCandidate.containsPii !== false ||
    result.reviewerCandidate.containsCredential !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_CANDIDATE_INVALID");
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_ELIGIBILITY_INVALID");
  }
  if (
    result.assignmentEnvelope.signed !== false ||
    result.assignmentEnvelope.containsSecret !== false ||
    result.assignmentEnvelope.containsPii !== false ||
    result.assignmentEnvelope.submitted !== false ||
    result.assignmentEnvelope.persisted !== false ||
    result.assignmentEnvelope.body.assignmentId !== result.assignmentId ||
    result.assignmentEnvelope.body.handoffId !== upstreamHandoff.handoffId ||
    result.assignmentEnvelope.body.upstreamHandoffFingerprint !==
      upstreamHandoff.upstreamRequestFingerprint ||
    result.assignmentEnvelope.body.assignmentPrepared !==
      expectedEligibility.eligibleForPreviewAssignment ||
    result.assignmentEnvelope.body.assignmentPersisted !== false ||
    result.assignmentEnvelope.body.reviewDecisionCreated !== false ||
    result.assignmentEnvelope.body.reviewerAttestationCreated !== false ||
    result.assignmentEnvelope.body.approvalCreated !== false ||
    result.assignmentEnvelope.body.activationCreated !== false ||
    result.assignmentEnvelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_ENVELOPE_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false) ||
    upstreamHandoff.items.some(
      (item) =>
        item.reviewerId !== null ||
        item.reviewedAt !== null ||
        item.decision !== null ||
        item.decisionReason !== null,
    ) ||
    Object.values(upstreamHandoff.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxReviewerAssignmentResult,
): PaymentSandboxReviewerAssignmentObservation {
  return Object.freeze({
    upstreamHandoffFingerprint: result.upstreamHandoffFingerprint,
    assignmentId: result.assignmentId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.eligibility.eligibleForPreviewAssignment
      ? REVIEWER_ALIAS
      : null,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    assignmentPersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    reviewDecisionPresent: false,
    reviewerAttestationPresent: false,
    approvalArtifactPresent: false,
    activationArtifactPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxReviewerAssignment(
  result: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxReviewerAssignmentObservation = defaultObservation(
    result,
  ),
): PaymentSandboxReviewerAssignmentAudit {
  validatePaymentSandboxReviewerAssignment(result, upstreamHandoff);
  const upstreamAudit =
    auditPaymentSandboxApprovalReviewHandoff(upstreamHandoff);
  const expectedAlias = result.eligibility.eligibleForPreviewAssignment
    ? REVIEWER_ALIAS
    : null;
  const expectedItemStatus = itemStatusFor(result.assignmentStatus);
  const observedKeys = observation.itemKeys;
  const checks: PaymentSandboxReviewerAssignmentAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3j-r1",
    environmentSandbox: result.environment === "sandbox",
    upstreamAuditMatched: upstreamAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamHandoffFingerprint ===
      result.upstreamHandoffFingerprint,
    assignmentIdMatches: observation.assignmentId === result.assignmentId,
    requiredItemSetMatches:
      observedKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key)),
    itemStatusesMatchEligibility: result.items.every(
      (item) => item.status === expectedItemStatus,
    ),
    reviewerAliasOpaque: observation.reviewerAlias === expectedAlias,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    assignmentNotPersisted: observation.assignmentPersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    decisionAndAttestationAbsent:
      observation.reviewDecisionPresent === false &&
      observation.reviewerAttestationPresent === false,
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
    schemaVersion: "f07a-3j-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
