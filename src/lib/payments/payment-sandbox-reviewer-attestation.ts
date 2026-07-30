// F07A-3K_PAYMENT_SANDBOX_REVIEWER_ATTESTATION_CANDIDATE_R1
// F07A_3K_REUSE_F07A_3J_ASSIGNMENT_WITHOUT_DUPLICATION
// F07A_3K_OPAQUE_FIXTURE_REVIEWER_ALIAS_ONLY
// F07A_3K_ATTESTATION_PREPARED_BUT_NEVER_SIGNED_OR_PERSISTED
// F07A_3K_DECISION_APPROVAL_ACTIVATION_ALWAYS_ABSENT
// F07A_3K_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import {
  auditPaymentSandboxReviewerAssignment,
  validatePaymentSandboxReviewerAssignment,
} from "./payment-sandbox-reviewer-assignment";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type {
  PaymentSandboxReviewerAttestationAudit,
  PaymentSandboxReviewerAttestationAuditChecks,
  PaymentSandboxReviewerAttestationEligibility,
  PaymentSandboxReviewerAttestationItem,
  PaymentSandboxReviewerAttestationItemStatus,
  PaymentSandboxReviewerAttestationObservation,
  PaymentSandboxReviewerAttestationResult,
  PaymentSandboxReviewerAttestationStatus,
} from "./payment-sandbox-reviewer-attestation.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const ATTESTATION_STATEMENT = "review-packet-inspected-preview-only" as const;
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

function attestationStatusFor(
  assignment: PaymentSandboxReviewerAssignmentResult,
): PaymentSandboxReviewerAttestationStatus {
  if (assignment.assignmentStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (assignment.assignmentStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  return "prepared-not-signed";
}

function itemStatusFor(
  status: PaymentSandboxReviewerAttestationStatus,
): PaymentSandboxReviewerAttestationItemStatus {
  if (status === "blocked-adapter-disabled") return "blocked-adapter-disabled";
  if (status === "blocked-adapter-missing") return "blocked-adapter-missing";
  return "attestation-prepared-preview-only";
}

function createEligibility(
  assignment: PaymentSandboxReviewerAssignmentResult,
  assignmentAuditMatched: boolean,
): PaymentSandboxReviewerAttestationEligibility {
  const assignmentPrepared =
    assignment.assignmentStatus === "prepared-not-persisted" &&
    assignment.eligibility.eligibleForPreviewAssignment;
  const reviewerAliasOpaque =
    assignment.reviewerCandidate.alias === REVIEWER_ALIAS &&
    assignment.reviewerCandidate.identityKind === "opaque-preview-alias" &&
    assignment.reviewerCandidate.containsPii === false &&
    assignment.reviewerCandidate.containsCredential === false;
  const assignmentNotPersisted =
    assignment.assignmentEnvelope.persisted === false &&
    assignment.items.every((item) => item.assignmentPersisted === false);
  const itemKeys = assignment.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    assignment.productionEligible === false &&
    assignment.executionEligible === false &&
    Object.values(assignment.artifacts).every((value) => value === false);
  const eligibleForPreviewAttestation =
    assignmentAuditMatched &&
    assignment.environment === "sandbox" &&
    assignmentPrepared &&
    reviewerAliasOpaque &&
    assignmentNotPersisted &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    assignmentAuditMatched,
    environmentSandbox: assignment.environment === "sandbox",
    assignmentPrepared,
    reviewerAliasOpaque,
    assignmentNotPersisted,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewAttestation,
    reasons: Object.freeze(
      eligibleForPreviewAttestation
        ? ["eligible-for-preview-attestation"]
        : [
            ...(assignmentAuditMatched ? [] : ["assignment-audit-mismatch"]),
            ...(assignment.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(assignmentPrepared ? [] : ["assignment-not-prepared"]),
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

function attestationIdFor(
  assignment: PaymentSandboxReviewerAssignmentResult,
  status: PaymentSandboxReviewerAttestationStatus,
): string {
  return fingerprint([
    "f07a-3k-r1",
    assignment.assignmentId,
    assignment.upstreamHandoffFingerprint,
    REVIEWER_ALIAS,
    ATTESTATION_STATEMENT,
    status,
  ]);
}

function createItems(
  assignment: PaymentSandboxReviewerAssignmentResult,
  status: PaymentSandboxReviewerAttestationStatus,
  eligible: boolean,
): readonly PaymentSandboxReviewerAttestationItem[] {
  const itemStatus = itemStatusFor(status);
  return Object.freeze(
    assignment.items.map((item) =>
      Object.freeze({
        key: item.key,
        status: itemStatus,
        reviewerAlias: eligible ? REVIEWER_ALIAS : null,
        assignmentId: assignment.assignmentId,
        attestationStatement: ATTESTATION_STATEMENT,
        attestationPrepared: eligible,
        attestationSigned: false as const,
        attestationPersisted: false as const,
        reviewedAt: null,
        decision: null,
        decisionReason: null,
      }),
    ),
  );
}

export function createPaymentSandboxReviewerAttestation(
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxReviewerAttestationResult {
  validatePaymentSandboxReviewerAssignment(upstreamAssignment, upstreamHandoff);
  const assignmentAudit = auditPaymentSandboxReviewerAssignment(
    upstreamAssignment,
    upstreamHandoff,
  );
  if (assignmentAudit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEWER_ATTESTATION_ASSIGNMENT_AUDIT_FAILED",
    );
  }

  const eligibility = createEligibility(upstreamAssignment, true);
  const attestationStatus = attestationStatusFor(upstreamAssignment);
  const attestationId = attestationIdFor(upstreamAssignment, attestationStatus);
  const items = createItems(
    upstreamAssignment,
    attestationStatus,
    eligibility.eligibleForPreviewAttestation,
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3k-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamAssignmentId: upstreamAssignment.assignmentId,
    upstreamAssignmentFingerprint: upstreamAssignment.assignmentId,
    providerKey: upstreamAssignment.providerKey,
    adapterState: upstreamAssignment.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    attestationId,
    attestationStatus,
    eligibility,
    items,
    attestationEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3k-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        attestationId,
        assignmentId: upstreamAssignment.assignmentId,
        upstreamAssignmentFingerprint: upstreamAssignment.assignmentId,
        providerKey: upstreamAssignment.providerKey,
        adapterState: upstreamAssignment.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        statement: ATTESTATION_STATEMENT,
        attestationPrepared: eligibility.eligibleForPreviewAttestation,
        attestationSigned: false as const,
        attestationPersisted: false as const,
        reviewDecisionCreated: false as const,
        approvalCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      assignmentRecordCreated: false as const,
      reviewerIdentityRecordCreated: false as const,
      reviewerAttestationRecordCreated: false as const,
      verificationDecisionCreated: false as const,
      approvalCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxReviewerAttestation(
    result,
    upstreamAssignment,
    upstreamHandoff,
  );
  return result;
}

export function validatePaymentSandboxReviewerAttestation(
  result: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxReviewerAssignment(upstreamAssignment, upstreamHandoff);
  const assignmentAudit = auditPaymentSandboxReviewerAssignment(
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedEligibility = createEligibility(
    upstreamAssignment,
    assignmentAudit.status === "matched",
  );
  const expectedStatus = attestationStatusFor(upstreamAssignment);
  const expectedItemStatus = itemStatusFor(expectedStatus);
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3k-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ATTESTATION_SCHEMA_INVALID");
  }
  if (
    result.upstreamAssignmentId !== upstreamAssignment.assignmentId ||
    result.upstreamAssignmentFingerprint !== upstreamAssignment.assignmentId ||
    result.providerKey !== upstreamAssignment.providerKey ||
    result.adapterState !== upstreamAssignment.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.attestationStatus !== expectedStatus ||
    result.attestationId !==
      attestationIdFor(upstreamAssignment, expectedStatus)
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ATTESTATION_BINDING_MISMATCH");
  }
  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ATTESTATION_ITEM_SET_INVALID");
  }
  if (
    result.items.some(
      (item) =>
        item.status !== expectedItemStatus ||
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewAttestation
            ? REVIEWER_ALIAS
            : null) ||
        item.assignmentId !== upstreamAssignment.assignmentId ||
        item.attestationStatement !== ATTESTATION_STATEMENT ||
        item.attestationPrepared !==
          expectedEligibility.eligibleForPreviewAttestation ||
        item.attestationSigned !== false ||
        item.attestationPersisted !== false ||
        item.reviewedAt !== null ||
        item.decision !== null ||
        item.decisionReason !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ATTESTATION_ITEM_INVALID");
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ATTESTATION_ELIGIBILITY_INVALID");
  }
  if (
    result.attestationEnvelope.signed !== false ||
    result.attestationEnvelope.containsSecret !== false ||
    result.attestationEnvelope.containsPii !== false ||
    result.attestationEnvelope.submitted !== false ||
    result.attestationEnvelope.persisted !== false ||
    result.attestationEnvelope.body.attestationId !== result.attestationId ||
    result.attestationEnvelope.body.assignmentId !==
      upstreamAssignment.assignmentId ||
    result.attestationEnvelope.body.attestationPrepared !==
      expectedEligibility.eligibleForPreviewAttestation ||
    result.attestationEnvelope.body.attestationSigned !== false ||
    result.attestationEnvelope.body.attestationPersisted !== false ||
    result.attestationEnvelope.body.reviewDecisionCreated !== false ||
    result.attestationEnvelope.body.approvalCreated !== false ||
    result.attestationEnvelope.body.activationCreated !== false ||
    result.attestationEnvelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_REVIEWER_ATTESTATION_ENVELOPE_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false) ||
    upstreamAssignment.items.some(
      (item) =>
        item.assignmentPersisted !== false ||
        item.reviewedAt !== null ||
        item.decision !== null ||
        item.attestationCreated !== false,
    ) ||
    Object.values(upstreamAssignment.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_REVIEWER_ATTESTATION_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxReviewerAttestationResult,
): PaymentSandboxReviewerAttestationObservation {
  return Object.freeze({
    upstreamAssignmentFingerprint: result.upstreamAssignmentFingerprint,
    attestationId: result.attestationId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.eligibility.eligibleForPreviewAttestation
      ? REVIEWER_ALIAS
      : null,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    assignmentPersisted: false,
    attestationSigned: false,
    attestationPersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    reviewDecisionPresent: false,
    approvalArtifactPresent: false,
    activationArtifactPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxReviewerAttestation(
  result: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxReviewerAttestationObservation = defaultObservation(
    result,
  ),
): PaymentSandboxReviewerAttestationAudit {
  validatePaymentSandboxReviewerAttestation(
    result,
    upstreamAssignment,
    upstreamHandoff,
  );
  const assignmentAudit = auditPaymentSandboxReviewerAssignment(
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedStatus = itemStatusFor(result.attestationStatus);
  const checks: PaymentSandboxReviewerAttestationAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3k-r1",
    environmentSandbox: result.environment === "sandbox",
    assignmentAuditMatched: assignmentAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamAssignmentFingerprint ===
      result.upstreamAssignmentFingerprint,
    attestationIdMatches: observation.attestationId === result.attestationId,
    requiredItemSetMatches:
      observation.itemKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observation.itemKeys.includes(key)),
    itemStatusesMatchEligibility: result.items.every(
      (item) => item.status === expectedStatus,
    ),
    reviewerAliasOpaque:
      observation.reviewerAlias ===
      (result.eligibility.eligibleForPreviewAttestation
        ? REVIEWER_ALIAS
        : null),
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    assignmentNotPersisted: observation.assignmentPersisted === false,
    attestationUnsigned: observation.attestationSigned === false,
    attestationNotPersisted: observation.attestationPersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    reviewDecisionAbsent: observation.reviewDecisionPresent === false,
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
    schemaVersion: "f07a-3k-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
