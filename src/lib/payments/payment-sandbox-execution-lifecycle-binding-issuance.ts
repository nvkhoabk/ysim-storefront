// F07A-3Y_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_ISSUANCE_R1
// F07A_3Y_REUSE_F07A_3X_EXECUTION_LIFECYCLE_BINDING_WITHOUT_DUPLICATION
// F07A_3Y_BINDING_ISSUANCE_PREPARED_BUT_NEVER_PERSISTED_OR_SUBMITTED
// F07A_3Y_UPSTREAM_RESPONSE_AND_RECEIPT_REMAIN_ABSENT
// F07A_3Y_NO_PROVIDER_CALL_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION

import type { PaymentSandboxExecutionLifecycleBindingResult } from "./payment-sandbox-execution-lifecycle-binding.types";
import type {
  PaymentSandboxExecutionLifecycleBindingIssuanceAudit,
  PaymentSandboxExecutionLifecycleBindingIssuanceAuditChecks,
  PaymentSandboxExecutionLifecycleBindingIssuanceEligibility,
  PaymentSandboxExecutionLifecycleBindingIssuanceObservation,
  PaymentSandboxExecutionLifecycleBindingIssuanceResult,
  PaymentSandboxExecutionLifecycleBindingIssuanceStatus,
} from "./payment-sandbox-execution-lifecycle-binding-issuance.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const LIFECYCLE_PROFILE = "sandbox-payment-execution-lifecycle-v1" as const;
const LIFECYCLE_PHASES = Object.freeze([
  "provider-request",
  "request-issuance",
  "submission-gate",
  "execution-boundary",
  "response-receipt",
] as const);
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

function bindingStatusFor(
  binding: PaymentSandboxExecutionLifecycleBindingResult,
): PaymentSandboxExecutionLifecycleBindingIssuanceStatus {
  if (binding.bindingStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (binding.bindingStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (binding.bindingStatus !== "prepared-unbound") {
    return "blocked-receipt-not-prepared";
  }
  return "prepared-unbound";
}

function createEligibility(
  binding: PaymentSandboxExecutionLifecycleBindingResult,
): PaymentSandboxExecutionLifecycleBindingIssuanceEligibility {
  const providerResponseReceiptContractValid =
    binding.schemaVersion === "f07a-3x-r1" &&
    binding.purpose === "ui-preview-only" &&
    binding.environment === "sandbox";
  const normalizationPrepared =
    binding.bindingStatus === "prepared-unbound" &&
    binding.eligibility.eligibleForPreviewBinding &&
    binding.eligibility.normalizationPrepared;
  const providerResponseAbsent = binding.eligibility.providerResponseAbsent;
  const responseReceiptAbsent = binding.eligibility.responseReceiptAbsent;
  const responseReceiptNotPersisted =
    binding.eligibility.responseReceiptNotPersisted;
  const boundaryClosed = binding.eligibility.boundaryClosed;
  const executionNotAuthorized = binding.eligibility.executionNotAuthorized;
  const reviewerAliasOpaque =
    binding.reviewerAlias === REVIEWER_ALIAS &&
    !binding.reviewerAlias.includes("@") &&
    !/\s/u.test(binding.reviewerAlias);
  const itemKeys = binding.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const lifecycleProfilePrepared = true;
  const noMutationGuardrailsIntact =
    binding.productionEligible === false &&
    binding.executionEligible === false &&
    binding.artifacts.providerExecutionAttemptCreated === false &&
    binding.artifacts.paymentExecutionLifecycleBindingCreated === false &&
    binding.artifacts.settlementInstructionCreated === false &&
    binding.artifacts.registryMutationCreated === false;
  const eligibleForPreviewBinding = [
    providerResponseReceiptContractValid,
    normalizationPrepared,
    providerResponseAbsent,
    responseReceiptAbsent,
    responseReceiptNotPersisted,
    boundaryClosed,
    executionNotAuthorized,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    lifecycleProfilePrepared,
    noMutationGuardrailsIntact,
  ].every(Boolean);
  const reasons: string[] = [];
  if (!providerResponseReceiptContractValid)
    reasons.push("receipt-contract-invalid");
  if (!normalizationPrepared) reasons.push("normalization-not-prepared");
  if (!providerResponseAbsent) reasons.push("provider-response-present");
  if (!responseReceiptAbsent) reasons.push("response-receipt-present");
  if (!responseReceiptNotPersisted) reasons.push("response-receipt-persisted");
  if (!boundaryClosed) reasons.push("boundary-open");
  if (!executionNotAuthorized) reasons.push("execution-authorized");
  if (!reviewerAliasOpaque) reasons.push("reviewer-alias-invalid");
  if (!requiredItemSetComplete) reasons.push("required-item-set-incomplete");
  if (!noMutationGuardrailsIntact) reasons.push("mutation-guardrails-broken");
  return Object.freeze({
    providerResponseReceiptContractValid,
    environmentSandbox: binding.environment === "sandbox",
    normalizationPrepared,
    providerResponseAbsent,
    responseReceiptAbsent,
    responseReceiptNotPersisted,
    boundaryClosed,
    executionNotAuthorized,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    lifecycleProfilePrepared,
    noMutationGuardrailsIntact,
    eligibleForPreviewBinding,
    reasons: Object.freeze(reasons),
  });
}

export function createPaymentSandboxExecutionLifecycleBindingIssuance(
  binding: PaymentSandboxExecutionLifecycleBindingResult,
): PaymentSandboxExecutionLifecycleBindingIssuanceResult {
  const eligibility = createEligibility(binding);
  const bindingStatus = bindingStatusFor(binding);
  const upstreamProviderResponseReceiptFingerprint = fingerprint([
    binding.schemaVersion,
    binding.executionLifecycleBindingCandidateId,
    binding.upstreamProviderResponseReceiptFingerprint,
    binding.providerKey,
    binding.adapterState,
    binding.reviewerAlias,
    ...binding.items.map((item) => item.key),
  ]);
  const executionLifecycleBindingIssuanceCandidateId = fingerprint([
    "f07a-3y-r2",
    upstreamProviderResponseReceiptFingerprint,
    LIFECYCLE_PROFILE,
    ...LIFECYCLE_PHASES,
    bindingStatus,
  ]);
  const lifecycleBindingPrepared =
    eligibility.eligibleForPreviewBinding &&
    bindingStatus === "prepared-unbound";
  const items = Object.freeze(
    binding.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: item.reviewerAlias,
        providerResponseReceiptCandidateId:
          binding.upstreamProviderResponseReceiptCandidateId,
        lifecycleBindingPrepared,
        lifecycleBound: false as const,
        bindingPersisted: false as const,
        transactionStateMutationCreated: false as const,
      }),
    ),
  );
  const bindingEnvelope = Object.freeze({
    mediaType: "application/json" as const,
    schemaVersion: "f07a-3y-r2" as const,
    signed: false as const,
    containsSecret: false as const,
    containsPii: false as const,
    submitted: false as const,
    persisted: false as const,
    body: Object.freeze({
      executionLifecycleBindingIssuanceCandidateId,
      providerResponseReceiptCandidateId:
        binding.upstreamProviderResponseReceiptCandidateId,
      upstreamProviderResponseReceiptFingerprint,
      providerKey: binding.providerKey,
      adapterState: binding.adapterState,
      reviewerAlias: REVIEWER_ALIAS,
      reviewItemKeys: Object.freeze(binding.items.map((item) => item.key)),
      lifecycleProfile: LIFECYCLE_PROFILE,
      lifecyclePhases: LIFECYCLE_PHASES,
      lifecycleBindingPrepared,
      lifecycleBound: false as const,
      bindingPersisted: false as const,
      providerResponseReceived: false as const,
      responseReceiptCreated: false as const,
      settlementInstructionCreated: false as const,
      transactionStateMutationCreated: false as const,
    }),
  });
  return Object.freeze({
    schemaVersion: "f07a-3y-r2" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamProviderResponseReceiptCandidateId:
      binding.upstreamProviderResponseReceiptCandidateId,
    upstreamProviderResponseReceiptFingerprint,
    providerKey: binding.providerKey,
    adapterState: binding.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    executionLifecycleBindingIssuanceCandidateId,
    bindingStatus,
    eligibility,
    items,
    bindingEnvelope,
    artifacts: Object.freeze({
      approvalRecordCreated: false as const,
      approvalIssuanceRecordCreated: false as const,
      approvalTokenRecordCreated: false as const,
      activationRecordCreated: false as const,
      activationTokenRecordCreated: false as const,
      providerRequestRecordCreated: false as const,
      providerRequestIssuanceRecordCreated: false as const,
      providerSubmissionGateRecordCreated: false as const,
      providerExecutionBoundaryRecordCreated: false as const,
      providerExecutionAttemptCreated: false as const,
      providerResponseReceiptCreated: false as const,
      paymentExecutionLifecycleBindingIssuanceCreated: false as const,
      paymentExecutionLifecycleBindingIssuancePersisted: false as const,
      settlementInstructionCreated: false as const,
      transactionStateMutationCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });
}

function defaultObservation(
  result: PaymentSandboxExecutionLifecycleBindingIssuanceResult,
): PaymentSandboxExecutionLifecycleBindingIssuanceObservation {
  return Object.freeze({
    upstreamProviderResponseReceiptFingerprint:
      result.upstreamProviderResponseReceiptFingerprint,
    executionLifecycleBindingIssuanceCandidateId:
      result.executionLifecycleBindingIssuanceCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    normalizationPrepared: result.eligibility.normalizationPrepared,
    providerResponseReceived: false,
    responseReceiptCreated: false,
    responseReceiptPersisted: false,
    lifecycleBindingPrepared:
      result.bindingEnvelope.body.lifecycleBindingPrepared,
    lifecycleBound: false,
    bindingPersisted: false,
    envelopeSigned: result.bindingEnvelope.signed,
    envelopeContainsSecret: result.bindingEnvelope.containsSecret,
    envelopeContainsPii: result.bindingEnvelope.containsPii,
    envelopeSubmitted: result.bindingEnvelope.submitted,
    settlementInstructionPresent: false,
    transactionStateMutationPresent: false,
    registryMutationPresent: false,
    productionEligible: result.productionEligible,
    executionEligible: result.executionEligible,
  });
}

export function auditPaymentSandboxExecutionLifecycleBindingIssuance(
  result: PaymentSandboxExecutionLifecycleBindingIssuanceResult,
  binding: PaymentSandboxExecutionLifecycleBindingResult,
  observation: PaymentSandboxExecutionLifecycleBindingIssuanceObservation = defaultObservation(
    result,
  ),
): PaymentSandboxExecutionLifecycleBindingIssuanceAudit {
  const expectedFingerprint = fingerprint([
    binding.schemaVersion,
    binding.executionLifecycleBindingCandidateId,
    binding.upstreamProviderResponseReceiptFingerprint,
    binding.providerKey,
    binding.adapterState,
    binding.reviewerAlias,
    ...binding.items.map((item) => item.key),
  ]);
  const expectedCandidateId = fingerprint([
    "f07a-3y-r2",
    expectedFingerprint,
    LIFECYCLE_PROFILE,
    ...LIFECYCLE_PHASES,
    result.bindingStatus,
  ]);
  const checks: PaymentSandboxExecutionLifecycleBindingIssuanceAuditChecks =
    Object.freeze({
      schemaMatches:
        result.schemaVersion === "f07a-3y-r2" &&
        result.bindingEnvelope.schemaVersion === "f07a-3y-r2",
      environmentSandbox: result.environment === "sandbox",
      providerResponseReceiptContractValid:
        result.eligibility.providerResponseReceiptContractValid,
      upstreamFingerprintMatches:
        observation.upstreamProviderResponseReceiptFingerprint ===
          expectedFingerprint &&
        result.upstreamProviderResponseReceiptFingerprint ===
          expectedFingerprint,
      executionLifecycleBindingIssuanceCandidateIdMatches:
        observation.executionLifecycleBindingIssuanceCandidateId ===
          expectedCandidateId &&
        result.executionLifecycleBindingIssuanceCandidateId ===
          expectedCandidateId,
      requiredItemSetMatches:
        observation.itemKeys.length === REQUIRED_ITEM_KEYS.length &&
        REQUIRED_ITEM_KEYS.every((key) => observation.itemKeys.includes(key)),
      reviewerAliasOpaque:
        observation.reviewerAlias === REVIEWER_ALIAS &&
        !String(observation.reviewerAlias).includes("@"),
      reviewerPiiAbsent: observation.reviewerPiiPresent === false,
      reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
      normalizationPrepared: observation.normalizationPrepared,
      providerResponseAbsent: observation.providerResponseReceived === false,
      responseReceiptAbsent: observation.responseReceiptCreated === false,
      responseReceiptNotPersisted:
        observation.responseReceiptPersisted === false,
      lifecycleBindingPrepared: observation.lifecycleBindingPrepared,
      lifecycleNotBound: observation.lifecycleBound === false,
      bindingNotPersisted: observation.bindingPersisted === false,
      envelopeUnsigned: observation.envelopeSigned === false,
      envelopeContainsNoSecret: observation.envelopeContainsSecret === false,
      envelopeContainsNoPii: observation.envelopeContainsPii === false,
      envelopeNotSubmitted: observation.envelopeSubmitted === false,
      settlementArtifactAbsent:
        observation.settlementInstructionPresent === false,
      transactionStateMutationAbsent:
        observation.transactionStateMutationPresent === false,
      registryMutationAbsent: observation.registryMutationPresent === false,
      productionAndExecutionBlocked:
        observation.productionEligible === false &&
        observation.executionEligible === false,
    });
  return Object.freeze({
    schemaVersion: "f07a-3y-audit-r1" as const,
    status: Object.values(checks).every(Boolean) ? "matched" : "mismatched",
    checks,
  });
}
