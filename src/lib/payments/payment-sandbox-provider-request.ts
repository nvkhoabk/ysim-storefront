// F07A-3S_PAYMENT_SANDBOX_PROVIDER_REQUEST_R1
// F07A_3S_REUSE_F07A_3R_ACTIVATION_TOKEN_WITHOUT_DUPLICATION
// F07A_3S_PROVIDER_REQUEST_PREPARED_BUT_NEVER_CREATED_SUBMITTED_OR_PERSISTED
// F07A_3S_ACTIVATION_TOKEN_REMAINS_UNCREATED_UNSIGNED_AND_UNPERSISTED
// F07A_3S_NO_PROVIDER_EXECUTION_SETTLEMENT_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import type { PaymentSandboxApprovalIssuanceResult } from "./payment-sandbox-approval-issuance.types";
import type { PaymentSandboxApprovalTokenResult } from "./payment-sandbox-approval-token.types";
import type { PaymentSandboxActivationCandidateResult } from "./payment-sandbox-activation-candidate.types";
import {
  auditPaymentSandboxActivationToken,
  validatePaymentSandboxActivationToken,
} from "./payment-sandbox-activation-token";
import type { PaymentSandboxActivationTokenResult } from "./payment-sandbox-activation-token.types";
import type {
  PaymentSandboxProviderRequestAudit,
  PaymentSandboxProviderRequestAuditChecks,
  PaymentSandboxProviderRequestEligibility,
  PaymentSandboxProviderRequestObservation,
  PaymentSandboxProviderRequestResult,
  PaymentSandboxProviderRequestStatus,
} from "./payment-sandbox-provider-request.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const REQUEST_KIND = "sandbox-provider-payment-request-preview-only" as const;
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

function requestStatusFor(
  activationToken: PaymentSandboxActivationTokenResult,
): PaymentSandboxProviderRequestStatus {
  if (activationToken.tokenStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (activationToken.tokenStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (activationToken.tokenStatus !== "prepared-not-created") {
    return "blocked-activation-token-not-prepared";
  }
  return "prepared-not-created";
}

function createEligibility(
  activationToken: PaymentSandboxActivationTokenResult,
  activationTokenAuditMatched: boolean,
): PaymentSandboxProviderRequestEligibility {
  const activationTokenPrepared =
    activationToken.tokenStatus === "prepared-not-created" &&
    activationToken.eligibility.eligibleForPreviewToken &&
    activationToken.items.every((item) => item.tokenPrepared);

  const activationTokenNotCreated =
    activationToken.items.every((item) => item.tokenCreated === false) &&
    activationToken.tokenEnvelope.body.tokenCreated === false &&
    activationToken.artifacts.activationTokenRecordCreated === false;

  const activationTokenUnsigned =
    activationToken.items.every((item) => item.tokenSigned === false) &&
    activationToken.tokenEnvelope.signed === false;

  const activationTokenNotPersisted =
    activationToken.items.every((item) => item.tokenPersisted === false) &&
    activationToken.tokenEnvelope.persisted === false;

  const activationNotCreated =
    activationToken.eligibility.activationNotCreated &&
    activationToken.artifacts.activationRecordCreated === false;

  const activationNotPersisted =
    activationToken.eligibility.activationNotPersisted;

  const approvalTokenNotCreated =
    activationToken.eligibility.approvalTokenNotCreated &&
    activationToken.artifacts.approvalTokenRecordCreated === false;

  const approvalTokenUnsigned =
    activationToken.eligibility.approvalTokenUnsigned;

  const approvalTokenNotPersisted =
    activationToken.eligibility.approvalTokenNotPersisted;

  const reviewerAliasOpaque = activationToken.reviewerAlias === REVIEWER_ALIAS;

  const itemKeys = activationToken.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));

  const noExecutionGuardrailsIntact =
    activationToken.productionEligible === false &&
    activationToken.executionEligible === false &&
    Object.values(activationToken.artifacts).every((value) => value === false);

  const eligibleForPreviewRequest =
    activationTokenAuditMatched &&
    activationToken.environment === "sandbox" &&
    activationTokenPrepared &&
    activationTokenNotCreated &&
    activationTokenUnsigned &&
    activationTokenNotPersisted &&
    activationNotCreated &&
    activationNotPersisted &&
    approvalTokenNotCreated &&
    approvalTokenUnsigned &&
    approvalTokenNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    activationTokenAuditMatched,
    environmentSandbox: activationToken.environment === "sandbox",
    activationTokenPrepared,
    activationTokenNotCreated,
    activationTokenUnsigned,
    activationTokenNotPersisted,
    activationNotCreated,
    activationNotPersisted,
    approvalTokenNotCreated,
    approvalTokenUnsigned,
    approvalTokenNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewRequest,
    reasons: Object.freeze(
      eligibleForPreviewRequest
        ? ["eligible-for-preview-provider-request"]
        : [
            ...(activationTokenAuditMatched
              ? []
              : ["activation-token-audit-mismatch"]),
            ...(activationToken.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(activationTokenPrepared
              ? []
              : ["activation-token-not-prepared"]),
            ...(activationTokenNotCreated ? [] : ["activation-token-created"]),
            ...(activationTokenUnsigned ? [] : ["activation-token-signed"]),
            ...(activationTokenNotPersisted
              ? []
              : ["activation-token-persisted"]),
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

function candidateIdFor(
  activationToken: PaymentSandboxActivationTokenResult,
  status: PaymentSandboxProviderRequestStatus,
): string {
  return fingerprint([
    "f07a-3s-r1",
    activationToken.activationTokenCandidateId,
    activationToken.upstreamActivationFingerprint,
    activationToken.providerKey,
    activationToken.adapterState,
    REVIEWER_ALIAS,
    REQUEST_KIND,
    status,
  ]);
}

export function createPaymentSandboxProviderRequest(
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
): PaymentSandboxProviderRequestResult {
  validatePaymentSandboxActivationToken(
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

  const upstreamAudit = auditPaymentSandboxActivationToken(
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
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ACTIVATION_TOKEN_AUDIT_FAILED",
    );
  }

  const eligibility = createEligibility(upstreamActivationToken, true);
  const requestStatus = requestStatusFor(upstreamActivationToken);
  const providerRequestCandidateId = candidateIdFor(
    upstreamActivationToken,
    requestStatus,
  );
  const requestPrepared =
    eligibility.eligibleForPreviewRequest &&
    requestStatus === "prepared-not-created";

  const items = Object.freeze(
    upstreamActivationToken.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: requestPrepared ? REVIEWER_ALIAS : null,
        activationTokenCandidateId:
          upstreamActivationToken.activationTokenCandidateId,
        requestPrepared,
        requestCreated: false as const,
        requestSubmitted: false as const,
        requestPersisted: false as const,
        submittedAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3s-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamActivationTokenCandidateId:
      upstreamActivationToken.activationTokenCandidateId,
    upstreamActivationTokenFingerprint:
      upstreamActivationToken.activationTokenCandidateId,
    providerKey: upstreamActivationToken.providerKey,
    adapterState: upstreamActivationToken.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    providerRequestCandidateId,
    requestStatus,
    eligibility,
    items,
    requestEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3s-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        providerRequestCandidateId,
        activationTokenCandidateId:
          upstreamActivationToken.activationTokenCandidateId,
        upstreamActivationTokenFingerprint:
          upstreamActivationToken.activationTokenCandidateId,
        providerKey: upstreamActivationToken.providerKey,
        adapterState: upstreamActivationToken.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        requestKind: REQUEST_KIND,
        requestPrepared,
        requestCreated: false as const,
        requestSubmitted: false as const,
        requestPersisted: false as const,
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
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxProviderRequest(
    result,
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

export function validatePaymentSandboxProviderRequest(
  result: PaymentSandboxProviderRequestResult,
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
  validatePaymentSandboxActivationToken(
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

  const upstreamAudit = auditPaymentSandboxActivationToken(
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

  const expectedEligibility = createEligibility(
    upstreamActivationToken,
    upstreamAudit.status === "matched",
  );
  const expectedStatus = requestStatusFor(upstreamActivationToken);
  const expectedId = candidateIdFor(upstreamActivationToken, expectedStatus);
  const expectedPrepared =
    expectedEligibility.eligibleForPreviewRequest &&
    expectedStatus === "prepared-not-created";

  if (
    result.schemaVersion !== "f07a-3s-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_SCHEMA_INVALID");
  }

  if (
    result.upstreamActivationTokenCandidateId !==
      upstreamActivationToken.activationTokenCandidateId ||
    result.upstreamActivationTokenFingerprint !==
      upstreamActivationToken.activationTokenCandidateId ||
    result.providerKey !== upstreamActivationToken.providerKey ||
    result.adapterState !== upstreamActivationToken.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.providerRequestCandidateId !== expectedId ||
    result.requestStatus !== expectedStatus
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_BINDING_MISMATCH");
  }

  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_ELIGIBILITY_INVALID");
  }

  const keys = result.items.map((item) => item.key);
  if (
    keys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(keys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !keys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_ITEM_SET_INVALID");
  }

  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !== (expectedPrepared ? REVIEWER_ALIAS : null) ||
        item.activationTokenCandidateId !==
          upstreamActivationToken.activationTokenCandidateId ||
        item.requestPrepared !== expectedPrepared ||
        item.requestCreated !== false ||
        item.requestSubmitted !== false ||
        item.requestPersisted !== false ||
        item.submittedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_ITEM_INVALID");
  }

  const envelope = result.requestEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.providerRequestCandidateId !== expectedId ||
    envelope.body.activationTokenCandidateId !==
      upstreamActivationToken.activationTokenCandidateId ||
    envelope.body.requestKind !== REQUEST_KIND ||
    envelope.body.requestPrepared !== expectedPrepared ||
    envelope.body.requestCreated !== false ||
    envelope.body.requestSubmitted !== false ||
    envelope.body.requestPersisted !== false ||
    envelope.body.settlementInstructionCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_ENVELOPE_INVALID");
  }

  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxProviderRequestResult,
): PaymentSandboxProviderRequestObservation {
  return Object.freeze({
    upstreamActivationTokenFingerprint:
      result.upstreamActivationTokenFingerprint,
    providerRequestCandidateId: result.providerRequestCandidateId,
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
    providerRequestCreated: false,
    providerRequestSubmitted: false,
    providerRequestPersisted: false,
    envelopeSigned: false,
    envelopeContainsSecret: false,
    envelopeContainsPii: false,
    envelopeSubmitted: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxProviderRequest(
  result: PaymentSandboxProviderRequestResult,
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
  observation: PaymentSandboxProviderRequestObservation = defaultObservation(
    result,
  ),
): PaymentSandboxProviderRequestAudit {
  validatePaymentSandboxProviderRequest(
    result,
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

  const upstreamAudit = auditPaymentSandboxActivationToken(
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

  const observedKeys = observation.itemKeys;

  const checks: PaymentSandboxProviderRequestAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3s-r1",
    environmentSandbox: result.environment === "sandbox",
    activationTokenAuditMatched: upstreamAudit.status === "matched",
    upstreamFingerprintMatches:
      observation.upstreamActivationTokenFingerprint ===
      result.upstreamActivationTokenFingerprint,
    providerRequestCandidateIdMatches:
      observation.providerRequestCandidateId ===
      result.providerRequestCandidateId,
    requiredItemSetMatches:
      observedKeys.length === REQUIRED_ITEM_KEYS.length &&
      REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key)),
    reviewerAliasOpaque: observation.reviewerAlias === REVIEWER_ALIAS,
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
    providerRequestNotCreated: observation.providerRequestCreated === false,
    providerRequestNotSubmitted: observation.providerRequestSubmitted === false,
    providerRequestNotPersisted: observation.providerRequestPersisted === false,
    envelopeUnsigned: observation.envelopeSigned === false,
    envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
    envelopeContainsNoPii: observation.envelopeContainsPii === false,
    envelopeNotSubmitted: observation.envelopeSubmitted === false,
    settlementArtifactAbsent:
      observation.settlementInstructionPresent === false,
    registryMutationAbsent: observation.registryMutationPresent === false,
    productionAndExecutionBlocked:
      observation.productionEligible === false &&
      observation.executionEligible === false,
  });

  return Object.freeze({
    schemaVersion: "f07a-3s-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
