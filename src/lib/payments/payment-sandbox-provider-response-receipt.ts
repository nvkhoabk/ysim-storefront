// F07A-3W_PAYMENT_SANDBOX_PROVIDER_RESPONSE_RECEIPT_R1
// F07A_3W_REUSE_F07A_3V_PROVIDER_EXECUTION_BOUNDARY_WITHOUT_DUPLICATION
// F07A_3W_NORMALIZATION_PREPARED_WITHOUT_PROVIDER_RESPONSE
// F07A_3W_RESPONSE_RECEIPT_NEVER_CREATED_OR_PERSISTED
// F07A_3W_NO_PROVIDER_CALL_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION

import type { PaymentSandboxProviderExecutionBoundaryResult } from "./payment-sandbox-provider-execution-boundary.types";
import type {
  PaymentSandboxProviderResponseReceiptAudit,
  PaymentSandboxProviderResponseReceiptAuditChecks,
  PaymentSandboxProviderResponseReceiptEligibility,
  PaymentSandboxProviderResponseReceiptObservation,
  PaymentSandboxProviderResponseReceiptResult,
  PaymentSandboxProviderResponseReceiptStatus,
} from "./payment-sandbox-provider-response-receipt.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const NORMALIZATION_PROFILE = "sandbox-provider-response-receipt-v1" as const;
const EXPECTED_RESPONSE_FIELDS = Object.freeze([
  "providerReference",
  "providerStatus",
  "providerCode",
  "receivedAt",
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

function receiptStatusFor(
  boundary: PaymentSandboxProviderExecutionBoundaryResult,
): PaymentSandboxProviderResponseReceiptStatus {
  if (boundary.boundaryStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (boundary.boundaryStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (boundary.boundaryStatus !== "prepared-closed") {
    return "blocked-boundary-not-prepared";
  }
  return "prepared-no-response";
}

function createEligibility(
  boundary: PaymentSandboxProviderExecutionBoundaryResult,
): PaymentSandboxProviderResponseReceiptEligibility {
  const providerExecutionBoundaryContractValid =
    boundary.schemaVersion === "f07a-3v-r1" &&
    boundary.purpose === "ui-preview-only" &&
    boundary.environment === "sandbox";
  const boundaryPrepared =
    boundary.boundaryStatus === "prepared-closed" &&
    boundary.eligibility.eligibleForPreviewBoundary &&
    boundary.items.every((item) => item.boundaryPrepared);
  const boundaryClosed =
    boundary.items.every((item) => item.boundaryOpen === false) &&
    boundary.boundaryEnvelope.body.boundaryOpen === false;
  const executionNotAuthorized =
    boundary.items.every((item) => item.executionAuthorized === false) &&
    boundary.boundaryEnvelope.body.executionAuthorized === false;
  const credentialResolutionNotAttempted =
    boundary.items.every(
      (item) => item.credentialResolutionAttempted === false,
    ) && boundary.boundaryEnvelope.body.credentialResolutionAttempted === false;
  const providerCallNotAttempted =
    boundary.items.every((item) => item.providerCallAttempted === false) &&
    boundary.boundaryEnvelope.body.providerCallAttempted === false;
  const providerResponseAbsent =
    boundary.items.every((item) => item.providerResponseReceived === false) &&
    boundary.boundaryEnvelope.body.providerResponseReceived === false;
  const reviewerAliasOpaque =
    boundary.reviewerAlias === REVIEWER_ALIAS &&
    !boundary.reviewerAlias.includes("@") &&
    !/\s/u.test(boundary.reviewerAlias);
  const itemKeys = boundary.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const normalizationProfilePrepared = true;
  const noExecutionGuardrailsIntact =
    boundary.productionEligible === false &&
    boundary.executionEligible === false &&
    boundary.artifacts.providerExecutionAttemptCreated === false &&
    boundary.artifacts.providerResponseReceiptCreated === false &&
    boundary.artifacts.settlementInstructionCreated === false &&
    boundary.artifacts.registryMutationCreated === false;
  const eligibleForPreviewReceipt = [
    providerExecutionBoundaryContractValid,
    boundaryPrepared,
    boundaryClosed,
    executionNotAuthorized,
    credentialResolutionNotAttempted,
    providerCallNotAttempted,
    providerResponseAbsent,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    normalizationProfilePrepared,
    noExecutionGuardrailsIntact,
  ].every(Boolean);
  const reasons: string[] = [];
  if (!providerExecutionBoundaryContractValid)
    reasons.push("boundary-contract-invalid");
  if (!boundaryPrepared) reasons.push("boundary-not-prepared");
  if (!boundaryClosed) reasons.push("boundary-open");
  if (!executionNotAuthorized) reasons.push("execution-authorized");
  if (!credentialResolutionNotAttempted)
    reasons.push("credential-resolution-attempted");
  if (!providerCallNotAttempted) reasons.push("provider-call-attempted");
  if (!providerResponseAbsent) reasons.push("provider-response-present");
  if (!reviewerAliasOpaque) reasons.push("reviewer-alias-invalid");
  if (!requiredItemSetComplete) reasons.push("required-item-set-incomplete");
  if (!noExecutionGuardrailsIntact)
    reasons.push("no-execution-guardrails-broken");
  return Object.freeze({
    providerExecutionBoundaryContractValid,
    environmentSandbox: boundary.environment === "sandbox",
    boundaryPrepared,
    boundaryClosed,
    executionNotAuthorized,
    credentialResolutionNotAttempted,
    providerCallNotAttempted,
    providerResponseAbsent,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    normalizationProfilePrepared,
    noExecutionGuardrailsIntact,
    eligibleForPreviewReceipt,
    reasons: Object.freeze(reasons),
  });
}

export function createPaymentSandboxProviderResponseReceipt(
  boundary: PaymentSandboxProviderExecutionBoundaryResult,
): PaymentSandboxProviderResponseReceiptResult {
  const eligibility = createEligibility(boundary);
  const receiptStatus = receiptStatusFor(boundary);
  const upstreamProviderExecutionBoundaryFingerprint = fingerprint([
    boundary.schemaVersion,
    boundary.providerExecutionBoundaryCandidateId,
    boundary.providerKey,
    boundary.adapterState,
    boundary.reviewerAlias,
    ...boundary.items.map((item) => item.key),
  ]);
  const providerResponseReceiptCandidateId = fingerprint([
    "f07a-3w-r1",
    upstreamProviderExecutionBoundaryFingerprint,
    NORMALIZATION_PROFILE,
    receiptStatus,
  ]);
  const normalizationPrepared =
    eligibility.eligibleForPreviewReceipt &&
    receiptStatus === "prepared-no-response";
  const items = Object.freeze(
    boundary.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: item.reviewerAlias,
        providerExecutionBoundaryCandidateId:
          boundary.providerExecutionBoundaryCandidateId,
        normalizationPrepared,
        providerResponseReceived: false as const,
        providerResponseNormalized: false as const,
        responseReceiptCreated: false as const,
        responseReceiptPersisted: false as const,
        providerReference: null,
        providerStatus: null,
        providerCode: null,
        receivedAt: null,
      }),
    ),
  );
  const receiptEnvelope = Object.freeze({
    mediaType: "application/json" as const,
    schemaVersion: "f07a-3w-r1" as const,
    signed: false as const,
    containsSecret: false as const,
    containsPii: false as const,
    submitted: false as const,
    persisted: false as const,
    body: Object.freeze({
      providerResponseReceiptCandidateId,
      providerExecutionBoundaryCandidateId:
        boundary.providerExecutionBoundaryCandidateId,
      upstreamProviderExecutionBoundaryFingerprint,
      providerKey: boundary.providerKey,
      adapterState: boundary.adapterState,
      reviewerAlias: REVIEWER_ALIAS,
      reviewItemKeys: Object.freeze(boundary.items.map((item) => item.key)),
      normalizationProfile: NORMALIZATION_PROFILE,
      expectedResponseFields: EXPECTED_RESPONSE_FIELDS,
      normalizationPrepared,
      providerResponseReceived: false as const,
      providerResponseNormalized: false as const,
      responseReceiptCreated: false as const,
      responseReceiptPersisted: false as const,
      providerReference: null,
      providerStatus: null,
      providerCode: null,
      receivedAt: null,
      settlementInstructionCreated: false as const,
    }),
  });
  return Object.freeze({
    schemaVersion: "f07a-3w-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamProviderExecutionBoundaryCandidateId:
      boundary.providerExecutionBoundaryCandidateId,
    upstreamProviderExecutionBoundaryFingerprint,
    providerKey: boundary.providerKey,
    adapterState: boundary.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    providerResponseReceiptCandidateId,
    receiptStatus,
    eligibility,
    items,
    receiptEnvelope,
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
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });
}

function defaultObservation(
  result: PaymentSandboxProviderResponseReceiptResult,
): PaymentSandboxProviderResponseReceiptObservation {
  return Object.freeze({
    upstreamProviderExecutionBoundaryFingerprint:
      result.upstreamProviderExecutionBoundaryFingerprint,
    providerResponseReceiptCandidateId:
      result.providerResponseReceiptCandidateId,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerAlias: result.reviewerAlias,
    reviewerPiiPresent: false,
    reviewerCredentialPresent: false,
    boundaryOpen: false,
    executionAuthorized: false,
    credentialResolutionAttempted: false,
    providerCallAttempted: false,
    providerResponseReceived: false,
    providerResponseNormalized: false,
    responseReceiptCreated: false,
    responseReceiptPersisted: false,
    providerReferencePresent: false,
    providerStatusPresent: false,
    providerCodePresent: false,
    receivedAtPresent: false,
    envelopeSigned: result.receiptEnvelope.signed,
    envelopeContainsSecret: result.receiptEnvelope.containsSecret,
    envelopeContainsPii: result.receiptEnvelope.containsPii,
    envelopeSubmitted: result.receiptEnvelope.submitted,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: result.productionEligible,
    executionEligible: result.executionEligible,
  });
}

export function auditPaymentSandboxProviderResponseReceipt(
  result: PaymentSandboxProviderResponseReceiptResult,
  boundary: PaymentSandboxProviderExecutionBoundaryResult,
  observation: PaymentSandboxProviderResponseReceiptObservation = defaultObservation(
    result,
  ),
): PaymentSandboxProviderResponseReceiptAudit {
  const expectedFingerprint = fingerprint([
    boundary.schemaVersion,
    boundary.providerExecutionBoundaryCandidateId,
    boundary.providerKey,
    boundary.adapterState,
    boundary.reviewerAlias,
    ...boundary.items.map((item) => item.key),
  ]);
  const expectedCandidateId = fingerprint([
    "f07a-3w-r1",
    expectedFingerprint,
    NORMALIZATION_PROFILE,
    result.receiptStatus,
  ]);
  const checks: PaymentSandboxProviderResponseReceiptAuditChecks =
    Object.freeze({
      schemaMatches:
        result.schemaVersion === "f07a-3w-r1" &&
        result.receiptEnvelope.schemaVersion === "f07a-3w-r1",
      environmentSandbox: result.environment === "sandbox",
      providerExecutionBoundaryContractValid:
        result.eligibility.providerExecutionBoundaryContractValid,
      upstreamFingerprintMatches:
        observation.upstreamProviderExecutionBoundaryFingerprint ===
          expectedFingerprint &&
        result.upstreamProviderExecutionBoundaryFingerprint ===
          expectedFingerprint,
      providerResponseReceiptCandidateIdMatches:
        observation.providerResponseReceiptCandidateId ===
          expectedCandidateId &&
        result.providerResponseReceiptCandidateId === expectedCandidateId,
      requiredItemSetMatches:
        observation.itemKeys.length === REQUIRED_ITEM_KEYS.length &&
        REQUIRED_ITEM_KEYS.every((key) => observation.itemKeys.includes(key)),
      reviewerAliasOpaque:
        observation.reviewerAlias === REVIEWER_ALIAS &&
        !String(observation.reviewerAlias).includes("@"),
      reviewerPiiAbsent: observation.reviewerPiiPresent === false,
      reviewerCredentialAbsent: observation.reviewerCredentialPresent === false,
      boundaryClosed: observation.boundaryOpen === false,
      executionNotAuthorized: observation.executionAuthorized === false,
      credentialResolutionNotAttempted:
        observation.credentialResolutionAttempted === false,
      providerCallNotAttempted: observation.providerCallAttempted === false,
      providerResponseAbsent: observation.providerResponseReceived === false,
      providerResponseNotNormalized:
        observation.providerResponseNormalized === false,
      responseReceiptNotCreated: observation.responseReceiptCreated === false,
      responseReceiptNotPersisted:
        observation.responseReceiptPersisted === false,
      providerFieldsAbsent:
        observation.providerReferencePresent === false &&
        observation.providerStatusPresent === false &&
        observation.providerCodePresent === false &&
        observation.receivedAtPresent === false,
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
    schemaVersion: "f07a-3w-audit-r1" as const,
    status: Object.values(checks).every(Boolean) ? "matched" : "mismatched",
    checks,
  });
}
