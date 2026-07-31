// F07A-3X_PAYMENT_SANDBOX_EXECUTION_LIFECYCLE_BINDING_R1
// F07A_3X_REUSE_F07A_3W_PROVIDER_RESPONSE_RECEIPT_WITHOUT_DUPLICATION
// F07A_3X_LIFECYCLE_BINDING_PREPARED_BUT_NEVER_BOUND_OR_PERSISTED
// F07A_3X_UPSTREAM_RESPONSE_AND_RECEIPT_REMAIN_ABSENT
// F07A_3X_NO_PROVIDER_CALL_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION

import type { PaymentSandboxProviderResponseReceiptResult } from "./payment-sandbox-provider-response-receipt.types";
import type {
  PaymentSandboxExecutionLifecycleBindingAudit,
  PaymentSandboxExecutionLifecycleBindingAuditChecks,
  PaymentSandboxExecutionLifecycleBindingEligibility,
  PaymentSandboxExecutionLifecycleBindingObservation,
  PaymentSandboxExecutionLifecycleBindingResult,
  PaymentSandboxExecutionLifecycleBindingStatus,
} from "./payment-sandbox-execution-lifecycle-binding.types";

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
  receipt: PaymentSandboxProviderResponseReceiptResult,
): PaymentSandboxExecutionLifecycleBindingStatus {
  if (receipt.receiptStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (receipt.receiptStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (receipt.receiptStatus !== "prepared-no-response") {
    return "blocked-receipt-not-prepared";
  }
  return "prepared-unbound";
}

function createEligibility(
  receipt: PaymentSandboxProviderResponseReceiptResult,
): PaymentSandboxExecutionLifecycleBindingEligibility {
  const providerResponseReceiptContractValid =
    receipt.schemaVersion === "f07a-3w-r1" &&
    receipt.purpose === "ui-preview-only" &&
    receipt.environment === "sandbox";
  const normalizationPrepared =
    receipt.receiptStatus === "prepared-no-response" &&
    receipt.eligibility.eligibleForPreviewReceipt &&
    receipt.items.every((item) => item.normalizationPrepared) &&
    receipt.receiptEnvelope.body.normalizationPrepared;
  const providerResponseAbsent =
    receipt.items.every((item) => item.providerResponseReceived === false) &&
    receipt.receiptEnvelope.body.providerResponseReceived === false;
  const responseReceiptAbsent =
    receipt.items.every((item) => item.responseReceiptCreated === false) &&
    receipt.receiptEnvelope.body.responseReceiptCreated === false &&
    receipt.artifacts.providerResponseReceiptCreated === false;
  const responseReceiptNotPersisted =
    receipt.items.every((item) => item.responseReceiptPersisted === false) &&
    receipt.receiptEnvelope.body.responseReceiptPersisted === false;
  const boundaryClosed = receipt.eligibility.boundaryClosed;
  const executionNotAuthorized = receipt.eligibility.executionNotAuthorized;
  const reviewerAliasOpaque =
    receipt.reviewerAlias === REVIEWER_ALIAS &&
    !receipt.reviewerAlias.includes("@") &&
    !/\s/u.test(receipt.reviewerAlias);
  const itemKeys = receipt.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const lifecycleProfilePrepared = true;
  const noMutationGuardrailsIntact =
    receipt.productionEligible === false &&
    receipt.executionEligible === false &&
    receipt.artifacts.providerExecutionAttemptCreated === false &&
    receipt.artifacts.providerResponseReceiptCreated === false &&
    receipt.artifacts.settlementInstructionCreated === false &&
    receipt.artifacts.registryMutationCreated === false;
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
    environmentSandbox: receipt.environment === "sandbox",
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

export function createPaymentSandboxExecutionLifecycleBinding(
  receipt: PaymentSandboxProviderResponseReceiptResult,
): PaymentSandboxExecutionLifecycleBindingResult {
  const eligibility = createEligibility(receipt);
  const bindingStatus = bindingStatusFor(receipt);
  const upstreamProviderResponseReceiptFingerprint = fingerprint([
    receipt.schemaVersion,
    receipt.providerResponseReceiptCandidateId,
    receipt.providerKey,
    receipt.adapterState,
    receipt.reviewerAlias,
    ...receipt.items.map((item) => item.key),
  ]);
  const executionLifecycleBindingCandidateId = fingerprint([
    "f07a-3x-r1",
    upstreamProviderResponseReceiptFingerprint,
    LIFECYCLE_PROFILE,
    ...LIFECYCLE_PHASES,
    bindingStatus,
  ]);
  const lifecycleBindingPrepared =
    eligibility.eligibleForPreviewBinding &&
    bindingStatus === "prepared-unbound";
  const items = Object.freeze(
    receipt.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: item.reviewerAlias,
        providerResponseReceiptCandidateId:
          receipt.providerResponseReceiptCandidateId,
        lifecycleBindingPrepared,
        lifecycleBound: false as const,
        bindingPersisted: false as const,
        transactionStateMutationCreated: false as const,
      }),
    ),
  );
  const bindingEnvelope = Object.freeze({
    mediaType: "application/json" as const,
    schemaVersion: "f07a-3x-r1" as const,
    signed: false as const,
    containsSecret: false as const,
    containsPii: false as const,
    submitted: false as const,
    persisted: false as const,
    body: Object.freeze({
      executionLifecycleBindingCandidateId,
      providerResponseReceiptCandidateId:
        receipt.providerResponseReceiptCandidateId,
      upstreamProviderResponseReceiptFingerprint,
      providerKey: receipt.providerKey,
      adapterState: receipt.adapterState,
      reviewerAlias: REVIEWER_ALIAS,
      reviewItemKeys: Object.freeze(receipt.items.map((item) => item.key)),
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
    schemaVersion: "f07a-3x-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamProviderResponseReceiptCandidateId:
      receipt.providerResponseReceiptCandidateId,
    upstreamProviderResponseReceiptFingerprint,
    providerKey: receipt.providerKey,
    adapterState: receipt.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    executionLifecycleBindingCandidateId,
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
      paymentExecutionLifecycleBindingCreated: false as const,
      paymentExecutionLifecycleBindingPersisted: false as const,
      settlementInstructionCreated: false as const,
      transactionStateMutationCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });
}

function defaultObservation(
  result: PaymentSandboxExecutionLifecycleBindingResult,
): PaymentSandboxExecutionLifecycleBindingObservation {
  return Object.freeze({
    upstreamProviderResponseReceiptFingerprint:
      result.upstreamProviderResponseReceiptFingerprint,
    executionLifecycleBindingCandidateId:
      result.executionLifecycleBindingCandidateId,
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

export function auditPaymentSandboxExecutionLifecycleBinding(
  result: PaymentSandboxExecutionLifecycleBindingResult,
  receipt: PaymentSandboxProviderResponseReceiptResult,
  observation: PaymentSandboxExecutionLifecycleBindingObservation = defaultObservation(
    result,
  ),
): PaymentSandboxExecutionLifecycleBindingAudit {
  const expectedFingerprint = fingerprint([
    receipt.schemaVersion,
    receipt.providerResponseReceiptCandidateId,
    receipt.providerKey,
    receipt.adapterState,
    receipt.reviewerAlias,
    ...receipt.items.map((item) => item.key),
  ]);
  const expectedCandidateId = fingerprint([
    "f07a-3x-r1",
    expectedFingerprint,
    LIFECYCLE_PROFILE,
    ...LIFECYCLE_PHASES,
    result.bindingStatus,
  ]);
  const checks: PaymentSandboxExecutionLifecycleBindingAuditChecks =
    Object.freeze({
      schemaMatches:
        result.schemaVersion === "f07a-3x-r1" &&
        result.bindingEnvelope.schemaVersion === "f07a-3x-r1",
      environmentSandbox: result.environment === "sandbox",
      providerResponseReceiptContractValid:
        result.eligibility.providerResponseReceiptContractValid,
      upstreamFingerprintMatches:
        observation.upstreamProviderResponseReceiptFingerprint ===
          expectedFingerprint &&
        result.upstreamProviderResponseReceiptFingerprint ===
          expectedFingerprint,
      executionLifecycleBindingCandidateIdMatches:
        observation.executionLifecycleBindingCandidateId ===
          expectedCandidateId &&
        result.executionLifecycleBindingCandidateId === expectedCandidateId,
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
    schemaVersion: "f07a-3x-audit-r1" as const,
    status: Object.values(checks).every(Boolean) ? "matched" : "mismatched",
    checks,
  });
}
