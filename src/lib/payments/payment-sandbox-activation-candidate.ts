// F07A-3Q_PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_R1
// F07A_3Q_REUSE_F07A_3P_APPROVAL_TOKEN_WITHOUT_DUPLICATION
// F07A_3Q_ACTIVATION_PREPARED_BUT_NEVER_CREATED_OR_PERSISTED
// F07A_3Q_APPROVAL_TOKEN_REMAINS_UNCREATED_UNSIGNED_AND_UNPERSISTED
// F07A_3Q_ACTIVATION_TOKEN_ALWAYS_ABSENT
// F07A_3Q_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import type { PaymentSandboxApprovalIssuanceResult } from "./payment-sandbox-approval-issuance.types";
import {
  auditPaymentSandboxApprovalToken,
  validatePaymentSandboxApprovalToken,
} from "./payment-sandbox-approval-token";
import type { PaymentSandboxApprovalTokenResult } from "./payment-sandbox-approval-token.types";
import type {
  PaymentSandboxActivationCandidateAudit,
  PaymentSandboxActivationCandidateAuditChecks,
  PaymentSandboxActivationCandidateEligibility,
  PaymentSandboxActivationCandidateObservation,
  PaymentSandboxActivationCandidateResult,
  PaymentSandboxActivationCandidateStatus,
} from "./payment-sandbox-activation-candidate.types";

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
  token: PaymentSandboxApprovalTokenResult,
): PaymentSandboxActivationCandidateStatus {
  if (token.tokenStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (token.tokenStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (token.tokenStatus !== "prepared-not-created") {
    return "blocked-token-not-prepared";
  }
  return "prepared-not-created";
}

function createEligibility(
  token: PaymentSandboxApprovalTokenResult,
  tokenAuditMatched: boolean,
): PaymentSandboxActivationCandidateEligibility {
  const tokenPrepared =
    token.tokenStatus === "prepared-not-created" &&
    token.eligibility.eligibleForPreviewToken &&
    token.items.every((item) => item.tokenPrepared);

  const tokenNotCreated =
    token.items.every((item) => item.tokenCreated === false) &&
    token.tokenEnvelope.body.tokenCreated === false &&
    token.artifacts.approvalTokenRecordCreated === false;

  const tokenUnsigned =
    token.items.every((item) => item.tokenSigned === false) &&
    token.tokenEnvelope.signed === false;

  const tokenNotPersisted =
    token.items.every((item) => item.tokenPersisted === false) &&
    token.tokenEnvelope.persisted === false;

  const approvalNotCreated =
    token.eligibility.approvalNotCreated &&
    token.tokenEnvelope.body.approvalCreated === false &&
    token.artifacts.approvalRecordCreated === false;

  const approvalNotPersisted =
    token.eligibility.approvalNotPersisted &&
    token.tokenEnvelope.body.approvalPersisted === false;

  const reviewerAliasOpaque = token.reviewerAlias === REVIEWER_ALIAS;
  const itemKeys = token.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));

  const noExecutionGuardrailsIntact =
    token.productionEligible === false &&
    token.executionEligible === false &&
    Object.values(token.artifacts).every((value) => value === false);

  const eligibleForPreviewActivation =
    tokenAuditMatched &&
    token.environment === "sandbox" &&
    tokenPrepared &&
    tokenNotCreated &&
    tokenUnsigned &&
    tokenNotPersisted &&
    approvalNotCreated &&
    approvalNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    tokenAuditMatched,
    environmentSandbox: token.environment === "sandbox",
    tokenPrepared,
    tokenNotCreated,
    tokenUnsigned,
    tokenNotPersisted,
    approvalNotCreated,
    approvalNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewActivation,
    reasons: Object.freeze(
      eligibleForPreviewActivation
        ? ["eligible-for-preview-activation"]
        : [
            ...(tokenAuditMatched ? [] : ["token-audit-mismatch"]),
            ...(token.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(tokenPrepared ? [] : ["token-not-prepared"]),
            ...(tokenNotCreated ? [] : ["token-created"]),
            ...(tokenUnsigned ? [] : ["token-signed"]),
            ...(tokenNotPersisted ? [] : ["token-persisted"]),
            ...(approvalNotCreated ? [] : ["approval-created"]),
            ...(approvalNotPersisted ? [] : ["approval-persisted"]),
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

function activationCandidateIdFor(
  token: PaymentSandboxApprovalTokenResult,
  status: PaymentSandboxActivationCandidateStatus,
): string {
  return fingerprint([
    "f07a-3q-r1",
    token.approvalTokenCandidateId,
    token.upstreamApprovalIssuanceFingerprint,
    REVIEWER_ALIAS,
    status,
  ]);
}

export function createPaymentSandboxActivationCandidate(
  upstreamToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxActivationCandidateResult {
  validatePaymentSandboxApprovalToken(
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const tokenAudit = auditPaymentSandboxApprovalToken(
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (tokenAudit.status !== "matched") {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_TOKEN_AUDIT_FAILED");
  }

  const eligibility = createEligibility(upstreamToken, true);
  const activationStatus = statusFor(upstreamToken);
  const activationCandidateId = activationCandidateIdFor(
    upstreamToken,
    activationStatus,
  );

  const items = Object.freeze(
    upstreamToken.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: eligibility.eligibleForPreviewActivation
          ? REVIEWER_ALIAS
          : null,
        approvalTokenCandidateId: upstreamToken.approvalTokenCandidateId,
        activationPrepared: eligibility.eligibleForPreviewActivation,
        activationCreated: false as const,
        activationPersisted: false as const,
        activatedAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3q-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamApprovalTokenCandidateId: upstreamToken.approvalTokenCandidateId,
    upstreamApprovalTokenFingerprint: upstreamToken.approvalTokenCandidateId,
    providerKey: upstreamToken.providerKey,
    adapterState: upstreamToken.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    activationCandidateId,
    activationStatus,
    eligibility,
    items,
    activationEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3q-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        activationCandidateId,
        approvalTokenCandidateId: upstreamToken.approvalTokenCandidateId,
        upstreamApprovalTokenFingerprint:
          upstreamToken.approvalTokenCandidateId,
        providerKey: upstreamToken.providerKey,
        adapterState: upstreamToken.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        activationPrepared: eligibility.eligibleForPreviewActivation,
        activationCreated: false as const,
        activationPersisted: false as const,
        activationTokenCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalIssuanceRecordCreated: false as const,
      approvalTokenRecordCreated: false as const,
      activationRecordCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxActivationCandidate(
    result,
    upstreamToken,
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

export function validatePaymentSandboxActivationCandidate(
  result: PaymentSandboxActivationCandidateResult,
  upstreamToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxApprovalToken(
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const tokenAudit = auditPaymentSandboxApprovalToken(
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  const expectedEligibility = createEligibility(
    upstreamToken,
    tokenAudit.status === "matched",
  );
  const expectedStatus = statusFor(upstreamToken);
  const expectedId = activationCandidateIdFor(upstreamToken, expectedStatus);
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3q-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_SCHEMA_INVALID");
  }

  if (
    result.upstreamApprovalTokenCandidateId !==
      upstreamToken.approvalTokenCandidateId ||
    result.upstreamApprovalTokenFingerprint !==
      upstreamToken.approvalTokenCandidateId ||
    result.providerKey !== upstreamToken.providerKey ||
    result.adapterState !== upstreamToken.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.activationStatus !== expectedStatus ||
    result.activationCandidateId !== expectedId
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_BINDING_MISMATCH");
  }

  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_ITEM_SET_INVALID");
  }

  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewActivation
            ? REVIEWER_ALIAS
            : null) ||
        item.approvalTokenCandidateId !==
          upstreamToken.approvalTokenCandidateId ||
        item.activationPrepared !==
          expectedEligibility.eligibleForPreviewActivation ||
        item.activationCreated !== false ||
        item.activationPersisted !== false ||
        item.activatedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_ITEM_INVALID");
  }

  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_ELIGIBILITY_INVALID");
  }

  const envelope = result.activationEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.activationCandidateId !== result.activationCandidateId ||
    envelope.body.approvalTokenCandidateId !==
      upstreamToken.approvalTokenCandidateId ||
    envelope.body.activationPrepared !==
      expectedEligibility.eligibleForPreviewActivation ||
    envelope.body.activationCreated !== false ||
    envelope.body.activationPersisted !== false ||
    envelope.body.activationTokenCreated !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_ENVELOPE_INVALID");
  }

  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_ACTIVATION_CANDIDATE_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxActivationCandidateResult,
): PaymentSandboxActivationCandidateObservation {
  return Object.freeze({
    upstreamApprovalTokenFingerprint: result.upstreamApprovalTokenFingerprint,
    activationCandidateId: result.activationCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    tokenCreated: false,
    tokenSigned: false,
    tokenPersisted: false,
    approvalCreated: false,
    approvalPersisted: false,
    activationCreated: false,
    activationPersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    activationTokenPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxActivationCandidate(
  result: PaymentSandboxActivationCandidateResult,
  upstreamToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxActivationCandidateObservation = defaultObservation(
    result,
  ),
): PaymentSandboxActivationCandidateAudit {
  validatePaymentSandboxActivationCandidate(
    result,
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const tokenAudit = auditPaymentSandboxApprovalToken(
    upstreamToken,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const observedKeys = observation.itemKeys;
  const checks: PaymentSandboxActivationCandidateAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3q-r1",
    environmentSandbox: result.environment === "sandbox",
    tokenAuditMatched: tokenAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamApprovalTokenFingerprint ===
      result.upstreamApprovalTokenFingerprint,
    activationCandidateIdMatches:
      observation.activationCandidateId === result.activationCandidateId,
    requiredItemSetMatches:
      observedKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key)),
    reviewerAliasOpaque:
      observation.reviewerAlias === REVIEWER_ALIAS &&
      result.reviewerAlias === REVIEWER_ALIAS,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    tokenNotCreated: observation.tokenCreated === false,
    tokenUnsigned: observation.tokenSigned === false,
    tokenNotPersisted: observation.tokenPersisted === false,
    approvalNotCreated: observation.approvalCreated === false,
    approvalNotPersisted: observation.approvalPersisted === false,
    activationNotCreated: observation.activationCreated === false,
    activationNotPersisted: observation.activationPersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    activationTokenAbsent: observation.activationTokenPresent === false,
    providerAndSettlementArtifactsAbsent:
      observation.providerRequestPresent === false &&
      observation.settlementInstructionPresent === false,
    registryMutationAbsent: observation.registryMutationPresent === false,
    productionAndExecutionBlocked:
      observation.productionEligible === false &&
      observation.executionEligible === false,
  });

  return Object.freeze({
    schemaVersion: "f07a-3q-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
