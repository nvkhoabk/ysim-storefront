// F07A-3P_PAYMENT_SANDBOX_APPROVAL_TOKEN_R1
// F07A_3P_REUSE_F07A_3O_APPROVAL_ISSUANCE_WITHOUT_DUPLICATION
// F07A_3P_TOKEN_PREPARED_BUT_NEVER_CREATED_SIGNED_OR_PERSISTED
// F07A_3P_APPROVAL_REMAINS_UNCREATED_AND_UNPERSISTED
// F07A_3P_ACTIVATION_ALWAYS_ABSENT
// F07A_3P_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import {
  auditPaymentSandboxApprovalIssuance,
  validatePaymentSandboxApprovalIssuance,
} from "./payment-sandbox-approval-issuance";
import type { PaymentSandboxApprovalIssuanceResult } from "./payment-sandbox-approval-issuance.types";
import type {
  PaymentSandboxApprovalTokenAudit,
  PaymentSandboxApprovalTokenAuditChecks,
  PaymentSandboxApprovalTokenEligibility,
  PaymentSandboxApprovalTokenObservation,
  PaymentSandboxApprovalTokenResult,
  PaymentSandboxApprovalTokenStatus,
} from "./payment-sandbox-approval-token.types";

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
  issuance: PaymentSandboxApprovalIssuanceResult,
): PaymentSandboxApprovalTokenStatus {
  if (issuance.issuanceStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (issuance.issuanceStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (issuance.issuanceStatus === "blocked-approval-not-prepared") {
    return "blocked-approval-not-prepared";
  }
  if (issuance.issuanceStatus !== "prepared-not-issued") {
    return "blocked-issuance-not-prepared";
  }
  return "prepared-not-created";
}

function createEligibility(
  issuance: PaymentSandboxApprovalIssuanceResult,
  issuanceAuditMatched: boolean,
): PaymentSandboxApprovalTokenEligibility {
  const issuancePrepared =
    issuance.issuanceStatus === "prepared-not-issued" &&
    issuance.eligibility.eligibleForPreviewIssuance &&
    issuance.items.every((item) => item.issuancePrepared);

  const issuanceUnsigned =
    issuance.issuanceEnvelope.signed === false &&
    issuance.items.every((item) => item.issuanceSigned === false);

  const issuanceNotSubmitted =
    issuance.issuanceEnvelope.submitted === false &&
    issuance.items.every((item) => item.issuanceSubmitted === false);

  const issuanceNotPersisted =
    issuance.issuanceEnvelope.persisted === false &&
    issuance.items.every((item) => item.issuancePersisted === false);

  const approvalNotCreated =
    issuance.eligibility.approvalNotCreated &&
    issuance.issuanceEnvelope.body.approvalCreated === false &&
    issuance.artifacts.approvalRecordCreated === false;

  const approvalNotPersisted =
    issuance.eligibility.approvalNotPersisted &&
    issuance.issuanceEnvelope.body.approvalPersisted === false;

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

  const eligibleForPreviewToken =
    issuanceAuditMatched &&
    issuance.environment === "sandbox" &&
    issuancePrepared &&
    issuanceUnsigned &&
    issuanceNotSubmitted &&
    issuanceNotPersisted &&
    approvalNotCreated &&
    approvalNotPersisted &&
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
    approvalNotCreated,
    approvalNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewToken,
    reasons: Object.freeze(
      eligibleForPreviewToken
        ? ["eligible-for-preview-approval-token"]
        : [
            ...(issuanceAuditMatched
              ? []
              : ["approval-issuance-audit-mismatch"]),
            ...(issuance.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(issuancePrepared ? [] : ["approval-issuance-not-prepared"]),
            ...(issuanceUnsigned ? [] : ["approval-issuance-signed"]),
            ...(issuanceNotSubmitted ? [] : ["approval-issuance-submitted"]),
            ...(issuanceNotPersisted ? [] : ["approval-issuance-persisted"]),
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

function tokenCandidateIdFor(
  issuance: PaymentSandboxApprovalIssuanceResult,
  status: PaymentSandboxApprovalTokenStatus,
): string {
  return fingerprint([
    "f07a-3p-r1",
    issuance.approvalIssuanceId,
    issuance.upstreamApprovalCandidateFingerprint,
    REVIEWER_ALIAS,
    status,
  ]);
}

export function createPaymentSandboxApprovalToken(
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxApprovalTokenResult {
  validatePaymentSandboxApprovalIssuance(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const issuanceAudit = auditPaymentSandboxApprovalIssuance(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );
  if (issuanceAudit.status !== "matched") {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_ISSUANCE_AUDIT_FAILED");
  }

  const eligibility = createEligibility(upstreamApprovalIssuance, true);
  const tokenStatus = statusFor(upstreamApprovalIssuance);
  const approvalTokenCandidateId = tokenCandidateIdFor(
    upstreamApprovalIssuance,
    tokenStatus,
  );

  const items = Object.freeze(
    upstreamApprovalIssuance.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: eligibility.eligibleForPreviewToken
          ? REVIEWER_ALIAS
          : null,
        approvalIssuanceId: upstreamApprovalIssuance.approvalIssuanceId,
        tokenPrepared: eligibility.eligibleForPreviewToken,
        tokenCreated: false as const,
        tokenSigned: false as const,
        tokenPersisted: false as const,
        createdAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3p-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamApprovalIssuanceId: upstreamApprovalIssuance.approvalIssuanceId,
    upstreamApprovalIssuanceFingerprint:
      upstreamApprovalIssuance.approvalIssuanceId,
    providerKey: upstreamApprovalIssuance.providerKey,
    adapterState: upstreamApprovalIssuance.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    approvalTokenCandidateId,
    tokenStatus,
    eligibility,
    items,
    tokenEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3p-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        approvalTokenCandidateId,
        approvalIssuanceId: upstreamApprovalIssuance.approvalIssuanceId,
        upstreamApprovalIssuanceFingerprint:
          upstreamApprovalIssuance.approvalIssuanceId,
        providerKey: upstreamApprovalIssuance.providerKey,
        adapterState: upstreamApprovalIssuance.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        tokenPrepared: eligibility.eligibleForPreviewToken,
        tokenCreated: false as const,
        tokenSigned: false as const,
        tokenPersisted: false as const,
        approvalCreated: false as const,
        approvalPersisted: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalIssuanceRecordCreated: false as const,
      approvalTokenRecordCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxApprovalToken(
    result,
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

export function validatePaymentSandboxApprovalToken(
  result: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
): void {
  validatePaymentSandboxApprovalIssuance(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const issuanceAudit = auditPaymentSandboxApprovalIssuance(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const expectedEligibility = createEligibility(
    upstreamApprovalIssuance,
    issuanceAudit.status === "matched",
  );
  const expectedStatus = statusFor(upstreamApprovalIssuance);
  const expectedTokenId = tokenCandidateIdFor(
    upstreamApprovalIssuance,
    expectedStatus,
  );
  const itemKeys = result.items.map((item) => item.key);

  if (
    result.schemaVersion !== "f07a-3p-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_SCHEMA_INVALID");
  }

  if (
    result.upstreamApprovalIssuanceId !==
      upstreamApprovalIssuance.approvalIssuanceId ||
    result.upstreamApprovalIssuanceFingerprint !==
      upstreamApprovalIssuance.approvalIssuanceId ||
    result.providerKey !== upstreamApprovalIssuance.providerKey ||
    result.adapterState !== upstreamApprovalIssuance.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.tokenStatus !== expectedStatus ||
    result.approvalTokenCandidateId !== expectedTokenId
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_BINDING_MISMATCH");
  }

  if (
    itemKeys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_ITEM_SET_INVALID");
  }

  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !==
          (expectedEligibility.eligibleForPreviewToken
            ? REVIEWER_ALIAS
            : null) ||
        item.approvalIssuanceId !==
          upstreamApprovalIssuance.approvalIssuanceId ||
        item.tokenPrepared !== expectedEligibility.eligibleForPreviewToken ||
        item.tokenCreated !== false ||
        item.tokenSigned !== false ||
        item.tokenPersisted !== false ||
        item.createdAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_ITEM_INVALID");
  }

  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_ELIGIBILITY_INVALID");
  }

  const envelope = result.tokenEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.approvalTokenCandidateId !==
      result.approvalTokenCandidateId ||
    envelope.body.approvalIssuanceId !==
      upstreamApprovalIssuance.approvalIssuanceId ||
    envelope.body.tokenPrepared !==
      expectedEligibility.eligibleForPreviewToken ||
    envelope.body.tokenCreated !== false ||
    envelope.body.tokenSigned !== false ||
    envelope.body.tokenPersisted !== false ||
    envelope.body.approvalCreated !== false ||
    envelope.body.approvalPersisted !== false ||
    envelope.body.activationCreated !== false ||
    envelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_TOKEN_ENVELOPE_INVALID");
  }

  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_APPROVAL_TOKEN_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxApprovalTokenResult,
): PaymentSandboxApprovalTokenObservation {
  return Object.freeze({
    upstreamApprovalIssuanceFingerprint:
      result.upstreamApprovalIssuanceFingerprint,
    approvalTokenCandidateId: result.approvalTokenCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    issuanceSigned: false,
    issuanceSubmitted: false,
    issuancePersisted: false,
    approvalCreated: false,
    approvalPersisted: false,
    tokenCreated: false,
    tokenSigned: false,
    tokenPersisted: false,
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

export function auditPaymentSandboxApprovalToken(
  result: PaymentSandboxApprovalTokenResult,
  upstreamApprovalIssuance: PaymentSandboxApprovalIssuanceResult,
  upstreamApproval: PaymentSandboxApprovalCandidateResult,
  upstreamDecisionIssuance: PaymentSandboxReviewDecisionIssuanceResult,
  upstreamDecision: PaymentSandboxReviewDecisionResult,
  upstreamAttestation: PaymentSandboxReviewerAttestationResult,
  upstreamAssignment: PaymentSandboxReviewerAssignmentResult,
  upstreamHandoff: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxApprovalTokenObservation = defaultObservation(
    result,
  ),
): PaymentSandboxApprovalTokenAudit {
  validatePaymentSandboxApprovalToken(
    result,
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const issuanceAudit = auditPaymentSandboxApprovalIssuance(
    upstreamApprovalIssuance,
    upstreamApproval,
    upstreamDecisionIssuance,
    upstreamDecision,
    upstreamAttestation,
    upstreamAssignment,
    upstreamHandoff,
  );

  const observedKeys = observation.itemKeys;
  const checks: PaymentSandboxApprovalTokenAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3p-r1",
    environmentSandbox: result.environment === "sandbox",
    issuanceAuditMatched: issuanceAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamApprovalIssuanceFingerprint ===
      result.upstreamApprovalIssuanceFingerprint,
    tokenCandidateIdMatches:
      observation.approvalTokenCandidateId === result.approvalTokenCandidateId,
    requiredItemSetMatches:
      observedKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key)),
    reviewerAliasOpaque:
      observation.reviewerAlias === REVIEWER_ALIAS &&
      result.reviewerAlias === REVIEWER_ALIAS,
    reviewerPiiAbsent: observation.reviewerPiiPresent === false,
    reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
    issuanceUnsigned: observation.issuanceSigned === false,
    issuanceNotSubmitted: observation.issuanceSubmitted === false,
    issuanceNotPersisted: observation.issuancePersisted === false,
    approvalNotCreated: observation.approvalCreated === false,
    approvalNotPersisted: observation.approvalPersisted === false,
    tokenNotCreated: observation.tokenCreated === false,
    tokenUnsigned: observation.tokenSigned === false,
    tokenNotPersisted: observation.tokenPersisted === false,
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
    schemaVersion: "f07a-3p-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
