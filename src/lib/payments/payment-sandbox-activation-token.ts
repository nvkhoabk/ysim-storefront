// F07A-3R_PAYMENT_SANDBOX_ACTIVATION_TOKEN_R1
// F07A_3R_REUSE_F07A_3Q_ACTIVATION_WITHOUT_DUPLICATION
// F07A_3R_ACTIVATION_TOKEN_PREPARED_BUT_NEVER_CREATED_SIGNED_OR_PERSISTED
// F07A_3R_ACTIVATION_REMAINS_UNCREATED_AND_UNPERSISTED
// F07A_3R_APPROVAL_TOKEN_REMAINS_UNCREATED_UNSIGNED_AND_UNPERSISTED
// F07A_3R_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import type { PaymentSandboxApprovalIssuanceResult } from "./payment-sandbox-approval-issuance.types";
import type { PaymentSandboxApprovalTokenResult } from "./payment-sandbox-approval-token.types";
import {
  auditPaymentSandboxActivationCandidate,
  validatePaymentSandboxActivationCandidate,
} from "./payment-sandbox-activation-candidate";
import type { PaymentSandboxActivationCandidateResult } from "./payment-sandbox-activation-candidate.types";
import type {
  PaymentSandboxActivationTokenAudit,
  PaymentSandboxActivationTokenAuditChecks,
  PaymentSandboxActivationTokenEligibility,
  PaymentSandboxActivationTokenObservation,
  PaymentSandboxActivationTokenResult,
  PaymentSandboxActivationTokenStatus,
} from "./payment-sandbox-activation-token.types";

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
  activation: PaymentSandboxActivationCandidateResult,
): PaymentSandboxActivationTokenStatus {
  if (activation.activationStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (activation.activationStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (activation.activationStatus !== "prepared-not-created") {
    return "blocked-activation-not-prepared";
  }
  return "prepared-not-created";
}

function createEligibility(
  activation: PaymentSandboxActivationCandidateResult,
  activationAuditMatched: boolean,
): PaymentSandboxActivationTokenEligibility {
  const activationPrepared =
    activation.activationStatus === "prepared-not-created" &&
    activation.eligibility.eligibleForPreviewActivation &&
    activation.items.every((item) => item.activationPrepared);
  const activationNotCreated =
    activation.items.every((item) => item.activationCreated === false) &&
    activation.activationEnvelope.body.activationCreated === false &&
    activation.artifacts.activationRecordCreated === false;
  const activationNotPersisted =
    activation.items.every((item) => item.activationPersisted === false) &&
    activation.activationEnvelope.body.activationPersisted === false &&
    activation.activationEnvelope.persisted === false;
  const approvalTokenNotCreated =
    activation.eligibility.tokenNotCreated &&
    activation.activationEnvelope.body.activationTokenCreated === false &&
    activation.artifacts.approvalTokenRecordCreated === false;
  const approvalTokenUnsigned =
    activation.eligibility.tokenUnsigned &&
    activation.activationEnvelope.signed === false;
  const approvalTokenNotPersisted =
    activation.eligibility.tokenNotPersisted &&
    activation.activationEnvelope.persisted === false;
  const reviewerAliasOpaque = activation.reviewerAlias === REVIEWER_ALIAS;
  const itemKeys = activation.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    activation.productionEligible === false &&
    activation.executionEligible === false &&
    Object.values(activation.artifacts).every((value) => value === false);
  const eligibleForPreviewToken =
    activationAuditMatched &&
    activation.environment === "sandbox" &&
    activationPrepared &&
    activationNotCreated &&
    activationNotPersisted &&
    approvalTokenNotCreated &&
    approvalTokenUnsigned &&
    approvalTokenNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;
  return Object.freeze({
    activationAuditMatched,
    environmentSandbox: activation.environment === "sandbox",
    activationPrepared,
    activationNotCreated,
    activationNotPersisted,
    approvalTokenNotCreated,
    approvalTokenUnsigned,
    approvalTokenNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewToken,
    reasons: Object.freeze(
      eligibleForPreviewToken
        ? ["eligible-for-preview-activation-token"]
        : [
            ...(activationAuditMatched ? [] : ["activation-audit-mismatch"]),
            ...(activation.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(activationPrepared ? [] : ["activation-not-prepared"]),
            ...(activationNotCreated ? [] : ["activation-created"]),
            ...(activationNotPersisted ? [] : ["activation-persisted"]),
            ...(approvalTokenNotCreated ? [] : ["approval-token-created"]),
            ...(approvalTokenUnsigned ? [] : ["approval-token-signed"]),
            ...(approvalTokenNotPersisted ? [] : ["approval-token-persisted"]),
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

function activationTokenCandidateIdFor(
  activation: PaymentSandboxActivationCandidateResult,
  status: PaymentSandboxActivationTokenStatus,
): string {
  return fingerprint([
    "f07a-3r-r1",
    activation.activationCandidateId,
    activation.upstreamApprovalTokenFingerprint,
    REVIEWER_ALIAS,
    status,
  ]);
}

export function createPaymentSandboxActivationToken(
  upstreamActivation: PaymentSandboxActivationCandidateResult,
  upstreamApprovalToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxActivationTokenResult {
  validatePaymentSandboxActivationCandidate(
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
  const activationAudit = auditPaymentSandboxActivationCandidate(
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
  if (activationAudit.status !== "matched") {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_ACTIVATION_AUDIT_FAILED");
  }
  const eligibility = createEligibility(upstreamActivation, true);
  const tokenStatus = statusFor(upstreamActivation);
  const activationTokenCandidateId = activationTokenCandidateIdFor(
    upstreamActivation,
    tokenStatus,
  );
  const items = Object.freeze(
    upstreamActivation.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: eligibility.eligibleForPreviewToken
          ? REVIEWER_ALIAS
          : null,
        activationCandidateId: upstreamActivation.activationCandidateId,
        tokenPrepared: eligibility.eligibleForPreviewToken,
        tokenCreated: false as const,
        tokenSigned: false as const,
        tokenPersisted: false as const,
        expiresAt: null,
      }),
    ),
  );
  const result = Object.freeze({
    schemaVersion: "f07a-3r-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamActivationCandidateId: upstreamActivation.activationCandidateId,
    upstreamActivationFingerprint: upstreamActivation.activationCandidateId,
    providerKey: upstreamActivation.providerKey,
    adapterState: upstreamActivation.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    activationTokenCandidateId,
    tokenStatus,
    eligibility,
    items,
    tokenEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3r-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        activationTokenCandidateId,
        activationCandidateId: upstreamActivation.activationCandidateId,
        upstreamActivationFingerprint: upstreamActivation.activationCandidateId,
        providerKey: upstreamActivation.providerKey,
        adapterState: upstreamActivation.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        tokenPrepared: eligibility.eligibleForPreviewToken,
        tokenCreated: false as const,
        tokenSigned: false as const,
        tokenPersisted: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalIssuanceRecordCreated: false as const,
      approvalTokenRecordCreated: false as const,
      activationRecordCreated: false as const,
      activationTokenRecordCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });
  validatePaymentSandboxActivationToken(
    result,
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

export function validatePaymentSandboxActivationToken(
  result: PaymentSandboxActivationTokenResult,
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
  validatePaymentSandboxActivationCandidate(
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
  const audit = auditPaymentSandboxActivationCandidate(
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
  const expectedEligibility = createEligibility(
    upstreamActivation,
    audit.status === "matched",
  );
  const expectedStatus = statusFor(upstreamActivation);
  const expectedId = activationTokenCandidateIdFor(
    upstreamActivation,
    expectedStatus,
  );
  const itemKeys = result.items.map((item) => item.key);
  if (
    result.schemaVersion !== "f07a-3r-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_SCHEMA_INVALID");
  }
  if (
    result.upstreamActivationCandidateId !==
      upstreamActivation.activationCandidateId ||
    result.upstreamActivationFingerprint !==
      upstreamActivation.activationCandidateId ||
    result.providerKey !== upstreamActivation.providerKey ||
    result.adapterState !== upstreamActivation.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.activationTokenCandidateId !== expectedId ||
    result.tokenStatus !== expectedStatus
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_BINDING_MISMATCH");
  }
  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_ITEM_SET_INVALID");
  }
  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewToken
            ? REVIEWER_ALIAS
            : null) ||
        item.activationCandidateId !==
          upstreamActivation.activationCandidateId ||
        item.tokenPrepared !== expectedEligibility.eligibleForPreviewToken ||
        item.tokenCreated !== false ||
        item.tokenSigned !== false ||
        item.tokenPersisted !== false ||
        item.expiresAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_ITEM_INVALID");
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_ELIGIBILITY_INVALID");
  }
  const envelope = result.tokenEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.activationTokenCandidateId !==
      result.activationTokenCandidateId ||
    envelope.body.activationCandidateId !==
      upstreamActivation.activationCandidateId ||
    envelope.body.tokenPrepared !==
      expectedEligibility.eligibleForPreviewToken ||
    envelope.body.tokenCreated !== false ||
    envelope.body.tokenSigned !== false ||
    envelope.body.tokenPersisted !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_ACTIVATION_TOKEN_ENVELOPE_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_ACTIVATION_TOKEN_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxActivationTokenResult,
): PaymentSandboxActivationTokenObservation {
  return Object.freeze({
    upstreamActivationFingerprint: result.upstreamActivationFingerprint,
    activationTokenCandidateId: result.activationTokenCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    activationCreated: false,
    activationPersisted: false,
    approvalTokenCreated: false,
    approvalTokenSigned: false,
    approvalTokenPersisted: false,
    activationTokenCreated: false,
    activationTokenSigned: false,
    activationTokenPersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxActivationToken(
  result: PaymentSandboxActivationTokenResult,
  upstreamActivation: PaymentSandboxActivationCandidateResult,
  upstreamApprovalToken: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxActivationTokenObservation = defaultObservation(
    result,
  ),
): PaymentSandboxActivationTokenAudit {
  validatePaymentSandboxActivationToken(
    result,
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
  const activationAudit = auditPaymentSandboxActivationCandidate(
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
  const observedKeys = observation.itemKeys;
  const checks: PaymentSandboxActivationTokenAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3r-r1",
    environmentSandbox: result.environment === "sandbox",
    activationAuditMatched: activationAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamActivationFingerprint ===
      result.upstreamActivationFingerprint,
    activationTokenCandidateIdMatches:
      observation.activationTokenCandidateId ===
      result.activationTokenCandidateId,
    requiredItemSetMatches:
      observedKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key)),
    reviewerAliasOpaque:
      observation.reviewerAlias === REVIEWER_ALIAS &&
      result.reviewerAlias === REVIEWER_ALIAS,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    activationNotCreated: observation.activationCreated === false,
    activationNotPersisted: observation.activationPersisted === false,
    approvalTokenNotCreated: observation.approvalTokenCreated === false,
    approvalTokenUnsigned: observation.approvalTokenSigned === false,
    approvalTokenNotPersisted: observation.approvalTokenPersisted === false,
    activationTokenNotCreated: observation.activationTokenCreated === false,
    activationTokenUnsigned: observation.activationTokenSigned === false,
    activationTokenNotPersisted: observation.activationTokenPersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    providerAndSettlementArtifactsAbsent:
      observation.providerRequestPresent === false &&
      observation.settlementInstructionPresent === false,
    registryMutationAbsent: observation.registryMutationPresent === false,
    productionAndExecutionBlocked:
      observation.productionEligible === false &&
      observation.executionEligible === false,
  });
  return Object.freeze({
    schemaVersion: "f07a-3r-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
