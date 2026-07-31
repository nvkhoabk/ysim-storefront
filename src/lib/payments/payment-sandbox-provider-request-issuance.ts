// F07A-3T_PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_R1
// F07A_3T_REUSE_F07A_3S_PROVIDER_REQUEST_WITHOUT_DUPLICATION
// F07A_3T_ISSUANCE_PREPARED_BUT_NEVER_ISSUED_SIGNED_SUBMITTED_OR_PERSISTED
// F07A_3T_PROVIDER_REQUEST_REMAINS_UNCREATED_UNSUBMITTED_AND_UNPERSISTED
// F07A_3T_NO_PROVIDER_EXECUTION_SETTLEMENT_OR_REGISTRY_MUTATION

import type { PaymentSandboxApprovalReviewHandoffResult } from "./payment-sandbox-approval-review-handoff.types";
import type { PaymentSandboxReviewerAssignmentResult } from "./payment-sandbox-reviewer-assignment.types";
import type { PaymentSandboxReviewerAttestationResult } from "./payment-sandbox-reviewer-attestation.types";
import type { PaymentSandboxReviewDecisionResult } from "./payment-sandbox-review-decision.types";
import type { PaymentSandboxReviewDecisionIssuanceResult } from "./payment-sandbox-review-decision-issuance.types";
import type { PaymentSandboxApprovalCandidateResult } from "./payment-sandbox-approval-candidate.types";
import type { PaymentSandboxApprovalIssuanceResult } from "./payment-sandbox-approval-issuance.types";
import type { PaymentSandboxApprovalTokenResult } from "./payment-sandbox-approval-token.types";
import type { PaymentSandboxActivationCandidateResult } from "./payment-sandbox-activation-candidate.types";
import type { PaymentSandboxActivationTokenResult } from "./payment-sandbox-activation-token.types";
import {
  auditPaymentSandboxProviderRequest,
  validatePaymentSandboxProviderRequest,
} from "./payment-sandbox-provider-request";
import type { PaymentSandboxProviderRequestResult } from "./payment-sandbox-provider-request.types";
import type {
  PaymentSandboxProviderRequestIssuanceAudit,
  PaymentSandboxProviderRequestIssuanceAuditChecks,
  PaymentSandboxProviderRequestIssuanceEligibility,
  PaymentSandboxProviderRequestIssuanceObservation,
  PaymentSandboxProviderRequestIssuanceResult,
  PaymentSandboxProviderRequestIssuanceStatus,
} from "./payment-sandbox-provider-request-issuance.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const ISSUANCE_KIND = "sandbox-provider-request-issuance-preview-only" as const;
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

function issuanceStatusFor(
  providerRequest: PaymentSandboxProviderRequestResult,
): PaymentSandboxProviderRequestIssuanceStatus {
  if (providerRequest.requestStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (providerRequest.requestStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (providerRequest.requestStatus !== "prepared-not-created") {
    return "blocked-provider-request-not-prepared";
  }
  return "prepared-not-issued";
}

function createEligibility(
  providerRequest: PaymentSandboxProviderRequestResult,
  providerRequestAuditMatched: boolean,
): PaymentSandboxProviderRequestIssuanceEligibility {
  const providerRequestPrepared =
    providerRequest.requestStatus === "prepared-not-created" &&
    providerRequest.eligibility.eligibleForPreviewRequest &&
    providerRequest.items.every((item) => item.requestPrepared);

  const providerRequestNotCreated =
    providerRequest.items.every((item) => item.requestCreated === false) &&
    providerRequest.requestEnvelope.body.requestCreated === false &&
    providerRequest.artifacts.providerRequestRecordCreated === false;

  const providerRequestNotSubmitted =
    providerRequest.items.every((item) => item.requestSubmitted === false) &&
    providerRequest.requestEnvelope.body.requestSubmitted === false &&
    providerRequest.requestEnvelope.submitted === false;

  const providerRequestNotPersisted =
    providerRequest.items.every((item) => item.requestPersisted === false) &&
    providerRequest.requestEnvelope.body.requestPersisted === false &&
    providerRequest.requestEnvelope.persisted === false;

  const activationTokenNotCreated =
    providerRequest.eligibility.activationTokenNotCreated;
  const activationTokenUnsigned =
    providerRequest.eligibility.activationTokenUnsigned;
  const activationTokenNotPersisted =
    providerRequest.eligibility.activationTokenNotPersisted;
  const reviewerAliasOpaque = providerRequest.reviewerAlias === REVIEWER_ALIAS;

  const itemKeys = providerRequest.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));

  const noExecutionGuardrailsIntact =
    providerRequest.productionEligible === false &&
    providerRequest.executionEligible === false &&
    Object.values(providerRequest.artifacts).every((value) => value === false);

  const eligibleForPreviewIssuance =
    providerRequestAuditMatched &&
    providerRequest.environment === "sandbox" &&
    providerRequestPrepared &&
    providerRequestNotCreated &&
    providerRequestNotSubmitted &&
    providerRequestNotPersisted &&
    activationTokenNotCreated &&
    activationTokenUnsigned &&
    activationTokenNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    providerRequestAuditMatched,
    environmentSandbox: providerRequest.environment === "sandbox",
    providerRequestPrepared,
    providerRequestNotCreated,
    providerRequestNotSubmitted,
    providerRequestNotPersisted,
    activationTokenNotCreated,
    activationTokenUnsigned,
    activationTokenNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewIssuance,
    reasons: Object.freeze(
      eligibleForPreviewIssuance
        ? ["eligible-for-preview-provider-request-issuance"]
        : [
            ...(providerRequestAuditMatched
              ? []
              : ["provider-request-audit-mismatch"]),
            ...(providerRequest.environment === "sandbox"
              ? []
              : ["environment-not-sandbox"]),
            ...(providerRequestPrepared
              ? []
              : ["provider-request-not-prepared"]),
            ...(providerRequestNotCreated ? [] : ["provider-request-created"]),
            ...(providerRequestNotSubmitted
              ? []
              : ["provider-request-submitted"]),
            ...(providerRequestNotPersisted
              ? []
              : ["provider-request-persisted"]),
            ...(activationTokenNotCreated ? [] : ["activation-token-created"]),
            ...(activationTokenUnsigned ? [] : ["activation-token-signed"]),
            ...(activationTokenNotPersisted
              ? []
              : ["activation-token-persisted"]),
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
  providerRequest: PaymentSandboxProviderRequestResult,
  status: PaymentSandboxProviderRequestIssuanceStatus,
): string {
  return fingerprint([
    "f07a-3t-r1",
    providerRequest.providerRequestCandidateId,
    providerRequest.upstreamActivationTokenFingerprint,
    providerRequest.providerKey,
    providerRequest.adapterState,
    REVIEWER_ALIAS,
    ISSUANCE_KIND,
    status,
  ]);
}

export function createPaymentSandboxProviderRequestIssuance(
  upstreamProviderRequest: PaymentSandboxProviderRequestResult,
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
): PaymentSandboxProviderRequestIssuanceResult {
  validatePaymentSandboxProviderRequest(
    upstreamProviderRequest,
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

  const upstreamAudit = auditPaymentSandboxProviderRequest(
    upstreamProviderRequest,
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
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_UPSTREAM_AUDIT_FAILED",
    );
  }

  const eligibility = createEligibility(upstreamProviderRequest, true);
  const issuanceStatus = issuanceStatusFor(upstreamProviderRequest);
  const providerRequestIssuanceCandidateId = candidateIdFor(
    upstreamProviderRequest,
    issuanceStatus,
  );
  const issuancePrepared =
    eligibility.eligibleForPreviewIssuance &&
    issuanceStatus === "prepared-not-issued";

  const items = Object.freeze(
    upstreamProviderRequest.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: issuancePrepared ? REVIEWER_ALIAS : null,
        providerRequestCandidateId:
          upstreamProviderRequest.providerRequestCandidateId,
        issuancePrepared,
        issuanceIssued: false as const,
        issuanceSigned: false as const,
        issuanceSubmitted: false as const,
        issuancePersisted: false as const,
        issuedAt: null,
      }),
    ),
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3t-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamProviderRequestCandidateId:
      upstreamProviderRequest.providerRequestCandidateId,
    upstreamProviderRequestFingerprint:
      upstreamProviderRequest.providerRequestCandidateId,
    providerKey: upstreamProviderRequest.providerKey,
    adapterState: upstreamProviderRequest.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    providerRequestIssuanceCandidateId,
    issuanceStatus,
    eligibility,
    items,
    issuanceEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3t-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        providerRequestIssuanceCandidateId,
        providerRequestCandidateId:
          upstreamProviderRequest.providerRequestCandidateId,
        upstreamProviderRequestFingerprint:
          upstreamProviderRequest.providerRequestCandidateId,
        providerKey: upstreamProviderRequest.providerKey,
        adapterState: upstreamProviderRequest.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        issuanceKind: ISSUANCE_KIND,
        issuancePrepared,
        issuanceIssued: false as const,
        issuanceSigned: false as const,
        issuanceSubmitted: false as const,
        issuancePersisted: false as const,
        providerRequestCreated: false as const,
        providerRequestSubmitted: false as const,
        providerRequestPersisted: false as const,
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
      providerRequestIssuanceRecordCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxProviderRequestIssuance(
    result,
    upstreamProviderRequest,
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

export function validatePaymentSandboxProviderRequestIssuance(
  result: PaymentSandboxProviderRequestIssuanceResult,
  upstreamProviderRequest: PaymentSandboxProviderRequestResult,
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
  validatePaymentSandboxProviderRequest(
    upstreamProviderRequest,
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
  const upstreamAudit = auditPaymentSandboxProviderRequest(
    upstreamProviderRequest,
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
    upstreamProviderRequest,
    upstreamAudit.status === "matched",
  );
  const expectedStatus = issuanceStatusFor(upstreamProviderRequest);
  const expectedId = candidateIdFor(upstreamProviderRequest, expectedStatus);
  const expectedPrepared =
    expectedEligibility.eligibleForPreviewIssuance &&
    expectedStatus === "prepared-not-issued";

  if (
    result.schemaVersion !== "f07a-3t-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_SCHEMA_INVALID");
  }
  if (
    result.upstreamProviderRequestCandidateId !==
      upstreamProviderRequest.providerRequestCandidateId ||
    result.upstreamProviderRequestFingerprint !==
      upstreamProviderRequest.providerRequestCandidateId ||
    result.providerKey !== upstreamProviderRequest.providerKey ||
    result.adapterState !== upstreamProviderRequest.adapterState ||
    result.reviewerAlias !== REVIEWER_ALIAS ||
    result.providerRequestIssuanceCandidateId !== expectedId ||
    result.issuanceStatus !== expectedStatus
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_BINDING_MISMATCH",
    );
  }
  if (
    JSON.stringify(result.eligibility) !== JSON.stringify(expectedEligibility)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_ELIGIBILITY_INVALID",
    );
  }

  const keys = result.items.map((item) => item.key);
  if (
    keys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(keys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !keys.includes(key))
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_ITEM_SET_INVALID",
    );
  }
  if (
    result.items.some(
      (item) =>
        item.reviewerAlias !== (expectedPrepared ? REVIEWER_ALIAS : null) ||
        item.providerRequestCandidateId !==
          upstreamProviderRequest.providerRequestCandidateId ||
        item.issuancePrepared !== expectedPrepared ||
        item.issuanceIssued !== false ||
        item.issuanceSigned !== false ||
        item.issuanceSubmitted !== false ||
        item.issuancePersisted !== false ||
        item.issuedAt !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_ITEM_INVALID");
  }

  const envelope = result.issuanceEnvelope;
  if (
    envelope.signed !== false ||
    envelope.containsSecret !== false ||
    envelope.containsPii !== false ||
    envelope.submitted !== false ||
    envelope.persisted !== false ||
    envelope.body.providerRequestIssuanceCandidateId !== expectedId ||
    envelope.body.providerRequestCandidateId !==
      upstreamProviderRequest.providerRequestCandidateId ||
    envelope.body.issuanceKind !== ISSUANCE_KIND ||
    envelope.body.issuancePrepared !== expectedPrepared ||
    envelope.body.issuanceIssued !== false ||
    envelope.body.issuanceSigned !== false ||
    envelope.body.issuanceSubmitted !== false ||
    envelope.body.issuancePersisted !== false ||
    envelope.body.providerRequestCreated !== false ||
    envelope.body.providerRequestSubmitted !== false ||
    envelope.body.providerRequestPersisted !== false ||
    envelope.body.settlementInstructionCreated !== false
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_ENVELOPE_INVALID",
    );
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(result.artifacts).some((value) => value !== false)
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_REQUEST_ISSUANCE_EXECUTION_ARTIFACT_CREATED",
    );
  }
}

function defaultObservation(
  result: PaymentSandboxProviderRequestIssuanceResult,
): PaymentSandboxProviderRequestIssuanceObservation {
  return Object.freeze({
    upstreamProviderRequestFingerprint:
      result.upstreamProviderRequestFingerprint,
    providerRequestIssuanceCandidateId:
      result.providerRequestIssuanceCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    providerRequestCreated: false,
    providerRequestSubmitted: false,
    providerRequestPersisted: false,
    issuanceIssued: false,
    issuanceSigned: false,
    issuanceSubmitted: false,
    issuancePersisted: false,
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

export function auditPaymentSandboxProviderRequestIssuance(
  result: PaymentSandboxProviderRequestIssuanceResult,
  upstreamProviderRequest: PaymentSandboxProviderRequestResult,
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
  observation: PaymentSandboxProviderRequestIssuanceObservation = defaultObservation(
    result,
  ),
): PaymentSandboxProviderRequestIssuanceAudit {
  validatePaymentSandboxProviderRequestIssuance(
    result,
    upstreamProviderRequest,
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
  const upstreamAudit = auditPaymentSandboxProviderRequest(
    upstreamProviderRequest,
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
  const checks: PaymentSandboxProviderRequestIssuanceAuditChecks =
    Object.freeze({
      schemaMatches: result.schemaVersion === "f07a-3t-r1",
      environmentSandbox: result.environment === "sandbox",
      providerRequestAuditMatched: upstreamAudit.status === "matched",
      upstreamFingerprintMatches:
        observation.upstreamProviderRequestFingerprint ===
        result.upstreamProviderRequestFingerprint,
      providerRequestIssuanceCandidateIdMatches:
        observation.providerRequestIssuanceCandidateId ===
        result.providerRequestIssuanceCandidateId,
      requiredItemSetMatches:
        observedKeys.length === REQUIRED_ITEM_KEYS.length &&
        REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key)),
      reviewerAliasOpaque: observation.reviewerAlias === REVIEWER_ALIAS,
      reviewerPiiAbsent: observation.reviewerPiiPresent === false,
      reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
      providerRequestNotCreated: observation.providerRequestCreated === false,
      providerRequestNotSubmitted:
        observation.providerRequestSubmitted === false,
      providerRequestNotPersisted:
        observation.providerRequestPersisted === false,
      issuanceNotIssued: observation.issuanceIssued === false,
      issuanceUnsigned: observation.issuanceSigned === false,
      issuanceNotSubmitted: observation.issuanceSubmitted === false,
      issuanceNotPersisted: observation.issuancePersisted === false,
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
    schemaVersion: "f07a-3t-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
