// F07A-3V_PAYMENT_SANDBOX_PROVIDER_EXECUTION_BOUNDARY_R1
// F07A_3V_REUSE_F07A_3U_PROVIDER_SUBMISSION_GATE_WITHOUT_DUPLICATION
// F07A_3V_BOUNDARY_PREPARED_BUT_NEVER_OPENED_OR_AUTHORIZED
// F07A_3V_NO_CREDENTIAL_RESOLUTION_PROVIDER_CALL_OR_RESPONSE_CAPTURE
// F07A_3V_NO_SETTLEMENT_REGISTRY_OR_COMMERCE_MUTATION

import type { PaymentSandboxProviderSubmissionGateResult } from "./payment-sandbox-provider-submission-gate.types";
import type {
  PaymentSandboxProviderExecutionBoundaryAudit,
  PaymentSandboxProviderExecutionBoundaryAuditChecks,
  PaymentSandboxProviderExecutionBoundaryEligibility,
  PaymentSandboxProviderExecutionBoundaryObservation,
  PaymentSandboxProviderExecutionBoundaryResult,
  PaymentSandboxProviderExecutionBoundaryStatus,
} from "./payment-sandbox-provider-execution-boundary.types";

const REVIEWER_ALIAS = "sandbox-reviewer-fixture" as const;
const BOUNDARY_KIND =
  "sandbox-provider-execution-boundary-preview-only" as const;
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

function boundaryStatusFor(
  gate: PaymentSandboxProviderSubmissionGateResult,
): PaymentSandboxProviderExecutionBoundaryStatus {
  if (gate.gateStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (gate.gateStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  if (gate.gateStatus !== "prepared-closed") {
    return "blocked-gate-not-prepared";
  }
  return "prepared-closed";
}

function createEligibility(
  gate: PaymentSandboxProviderSubmissionGateResult,
): PaymentSandboxProviderExecutionBoundaryEligibility {
  const providerSubmissionGateContractValid =
    gate.schemaVersion === "f07a-3u-r1" &&
    gate.purpose === "ui-preview-only" &&
    gate.environment === "sandbox";
  const gatePrepared =
    gate.gateStatus === "prepared-closed" &&
    gate.eligibility.eligibleForPreviewGate &&
    gate.items.every((item) => item.gatePrepared);
  const gateClosed =
    gate.items.every((item) => item.gateOpen === false) &&
    gate.gateEnvelope.body.gateOpen === false;
  const submissionNotAuthorized =
    gate.items.every((item) => item.submissionAuthorized === false) &&
    gate.gateEnvelope.body.submissionAuthorized === false;
  const providerCallNotAllowed =
    gate.items.every((item) => item.providerCallAllowed === false) &&
    gate.gateEnvelope.body.providerCallAllowed === false;
  const providerRequestNotCreated = gate.eligibility.providerRequestNotCreated;
  const providerRequestNotSubmitted =
    gate.eligibility.providerRequestNotSubmitted;
  const providerRequestNotPersisted =
    gate.eligibility.providerRequestNotPersisted;
  const reviewerAliasOpaque = gate.reviewerAlias === REVIEWER_ALIAS;
  const itemKeys = gate.items.map((item) => item.key);
  const requiredItemSetComplete =
    itemKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(itemKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => itemKeys.includes(key));
  const noExecutionGuardrailsIntact =
    gate.productionEligible === false &&
    gate.executionEligible === false &&
    Object.values(gate.artifacts).every((value) => value === false);
  const eligibleForPreviewBoundary =
    providerSubmissionGateContractValid &&
    gatePrepared &&
    gateClosed &&
    submissionNotAuthorized &&
    providerCallNotAllowed &&
    providerRequestNotCreated &&
    providerRequestNotSubmitted &&
    providerRequestNotPersisted &&
    reviewerAliasOpaque &&
    requiredItemSetComplete &&
    noExecutionGuardrailsIntact;

  return Object.freeze({
    providerSubmissionGateContractValid,
    environmentSandbox: gate.environment === "sandbox",
    gatePrepared,
    gateClosed,
    submissionNotAuthorized,
    providerCallNotAllowed,
    providerRequestNotCreated,
    providerRequestNotSubmitted,
    providerRequestNotPersisted,
    reviewerAliasOpaque,
    requiredItemSetComplete,
    noExecutionGuardrailsIntact,
    eligibleForPreviewBoundary,
    reasons: Object.freeze(
      eligibleForPreviewBoundary
        ? ["eligible-for-preview-provider-execution-boundary"]
        : [
            ...(providerSubmissionGateContractValid
              ? []
              : ["gate-contract-invalid"]),
            ...(gatePrepared ? [] : ["gate-not-prepared"]),
            ...(gateClosed ? [] : ["gate-open"]),
            ...(submissionNotAuthorized ? [] : ["submission-authorized"]),
            ...(providerCallNotAllowed ? [] : ["provider-call-allowed"]),
            ...(providerRequestNotCreated ? [] : ["provider-request-created"]),
            ...(providerRequestNotSubmitted
              ? []
              : ["provider-request-submitted"]),
            ...(providerRequestNotPersisted
              ? []
              : ["provider-request-persisted"]),
            ...(reviewerAliasOpaque ? [] : ["reviewer-alias-not-opaque"]),
            ...(requiredItemSetComplete
              ? []
              : ["required-item-set-incomplete"]),
            ...(noExecutionGuardrailsIntact ? [] : ["guardrails-not-intact"]),
          ],
    ),
  });
}

function candidateIdFor(
  gate: PaymentSandboxProviderSubmissionGateResult,
  status: PaymentSandboxProviderExecutionBoundaryStatus,
): string {
  return fingerprint([
    "f07a-3v-r1",
    gate.providerSubmissionGateCandidateId,
    gate.upstreamProviderRequestIssuanceFingerprint,
    gate.providerKey,
    gate.adapterState,
    REVIEWER_ALIAS,
    BOUNDARY_KIND,
    status,
  ]);
}

export function createPaymentSandboxProviderExecutionBoundary(
  upstreamGate: PaymentSandboxProviderSubmissionGateResult,
): PaymentSandboxProviderExecutionBoundaryResult {
  const eligibility = createEligibility(upstreamGate);
  const boundaryStatus = boundaryStatusFor(upstreamGate);
  const providerExecutionBoundaryCandidateId = candidateIdFor(
    upstreamGate,
    boundaryStatus,
  );
  const boundaryPrepared =
    eligibility.eligibleForPreviewBoundary &&
    boundaryStatus === "prepared-closed";
  const items = Object.freeze(
    upstreamGate.items.map((item) =>
      Object.freeze({
        key: item.key,
        reviewerAlias: boundaryPrepared ? REVIEWER_ALIAS : null,
        providerSubmissionGateCandidateId:
          upstreamGate.providerSubmissionGateCandidateId,
        boundaryPrepared,
        boundaryOpen: false as const,
        executionAuthorized: false as const,
        credentialResolutionAttempted: false as const,
        providerCallAttempted: false as const,
        providerResponseReceived: false as const,
        evaluatedAt: null,
      }),
    ),
  );
  const result = Object.freeze({
    schemaVersion: "f07a-3v-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    upstreamProviderSubmissionGateCandidateId:
      upstreamGate.providerSubmissionGateCandidateId,
    upstreamProviderSubmissionGateFingerprint:
      upstreamGate.providerSubmissionGateCandidateId,
    providerKey: upstreamGate.providerKey,
    adapterState: upstreamGate.adapterState,
    reviewerAlias: REVIEWER_ALIAS,
    providerExecutionBoundaryCandidateId,
    boundaryStatus,
    eligibility,
    items,
    boundaryEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3v-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      containsPii: false as const,
      submitted: false as const,
      persisted: false as const,
      body: Object.freeze({
        providerExecutionBoundaryCandidateId,
        providerSubmissionGateCandidateId:
          upstreamGate.providerSubmissionGateCandidateId,
        upstreamProviderSubmissionGateFingerprint:
          upstreamGate.providerSubmissionGateCandidateId,
        providerKey: upstreamGate.providerKey,
        adapterState: upstreamGate.adapterState,
        reviewerAlias: REVIEWER_ALIAS,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        boundaryKind: BOUNDARY_KIND,
        boundaryPrepared,
        boundaryOpen: false as const,
        executionAuthorized: false as const,
        providerCallAllowed: false as const,
        credentialResolutionAttempted: false as const,
        providerCallAttempted: false as const,
        providerResponseReceived: false as const,
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
      providerSubmissionGateRecordCreated: false as const,
      providerExecutionBoundaryRecordCreated: false as const,
      providerExecutionAttemptCreated: false as const,
      providerResponseReceiptCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });
  validatePaymentSandboxProviderExecutionBoundary(result, upstreamGate);
  return result;
}

export function validatePaymentSandboxProviderExecutionBoundary(
  result: PaymentSandboxProviderExecutionBoundaryResult,
  upstreamGate: PaymentSandboxProviderSubmissionGateResult,
): void {
  const audit = auditPaymentSandboxProviderExecutionBoundary(
    result,
    upstreamGate,
  );
  if (audit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_PROVIDER_EXECUTION_BOUNDARY_VALIDATION_FAILED",
    );
  }
}

export function auditPaymentSandboxProviderExecutionBoundary(
  result: PaymentSandboxProviderExecutionBoundaryResult,
  upstreamGate: PaymentSandboxProviderSubmissionGateResult,
  observation?: PaymentSandboxProviderExecutionBoundaryObservation,
): PaymentSandboxProviderExecutionBoundaryAudit {
  const expectedCandidateId = candidateIdFor(
    upstreamGate,
    result.boundaryStatus,
  );
  const observed =
    observation ??
    Object.freeze({
      upstreamProviderSubmissionGateFingerprint:
        result.upstreamProviderSubmissionGateFingerprint,
      providerExecutionBoundaryCandidateId:
        result.providerExecutionBoundaryCandidateId,
      itemKeys: Object.freeze(result.items.map((item) => item.key)),
      reviewerAlias: result.reviewerAlias,
      reviewerPiiPresent: false,
      reviewerCredentialPresent: false,
      gateOpen: upstreamGate.items.some((item) => item.gateOpen),
      submissionAuthorized: upstreamGate.items.some(
        (item) => item.submissionAuthorized,
      ),
      providerCallAllowed: upstreamGate.items.some(
        (item) => item.providerCallAllowed,
      ),
      boundaryOpen: result.items.some((item) => item.boundaryOpen),
      executionAuthorized: result.items.some(
        (item) => item.executionAuthorized,
      ),
      credentialResolutionAttempted: result.items.some(
        (item) => item.credentialResolutionAttempted,
      ),
      providerCallAttempted: result.items.some(
        (item) => item.providerCallAttempted,
      ),
      providerResponseReceived: result.items.some(
        (item) => item.providerResponseReceived,
      ),
      envelopeSigned: result.boundaryEnvelope.signed,
      envelopeContainsSecret: result.boundaryEnvelope.containsSecret,
      envelopeContainsPii: result.boundaryEnvelope.containsPii,
      envelopeSubmitted: result.boundaryEnvelope.submitted,
      settlementInstructionPresent:
        result.artifacts.settlementInstructionCreated,
      registryMutationPresent: result.artifacts.registryMutationCreated,
      productionEligible: result.productionEligible,
      executionEligible: result.executionEligible,
    });
  const observedKeys = [...observed.itemKeys];
  const requiredItemSetMatches =
    observedKeys.length === REQUIRED_ITEM_KEYS.length &&
    new Set(observedKeys).size === REQUIRED_ITEM_KEYS.length &&
    REQUIRED_ITEM_KEYS.every((key) => observedKeys.includes(key));
  const checks: PaymentSandboxProviderExecutionBoundaryAuditChecks =
    Object.freeze({
      schemaMatches:
        result.schemaVersion === "f07a-3v-r1" &&
        result.boundaryEnvelope.schemaVersion === "f07a-3v-r1",
      environmentSandbox: result.environment === "sandbox",
      providerSubmissionGateContractValid:
        result.eligibility.providerSubmissionGateContractValid,
      upstreamFingerprintMatches:
        observed.upstreamProviderSubmissionGateFingerprint ===
        upstreamGate.providerSubmissionGateCandidateId,
      providerExecutionBoundaryCandidateIdMatches:
        observed.providerExecutionBoundaryCandidateId === expectedCandidateId,
      requiredItemSetMatches,
      reviewerAliasOpaque: observed.reviewerAlias === REVIEWER_ALIAS,
      reviewerPiiAbsent: observed.reviewerPiiPresent === false,
      reviewerCredentialAbsent: observed.reviewerCredentialPresent === false,
      gateClosed: observed.gateOpen === false,
      submissionNotAuthorized: observed.submissionAuthorized === false,
      providerCallNotAllowed: observed.providerCallAllowed === false,
      boundaryClosed: observed.boundaryOpen === false,
      executionNotAuthorized: observed.executionAuthorized === false,
      credentialResolutionNotAttempted:
        observed.credentialResolutionAttempted === false,
      providerCallNotAttempted: observed.providerCallAttempted === false,
      providerResponseAbsent: observed.providerResponseReceived === false,
      envelopeUnsigned: observed.envelopeSigned === false,
      envelopeContainsNoSecret: observed.envelopeContainsSecret === false,
      envelopeContainsNoPii: observed.envelopeContainsPii === false,
      envelopeNotSubmitted: observed.envelopeSubmitted === false,
      settlementArtifactAbsent: observed.settlementInstructionPresent === false,
      registryMutationAbsent: observed.registryMutationPresent === false,
      productionAndExecutionBlocked:
        observed.productionEligible === false &&
        observed.executionEligible === false,
    });
  return Object.freeze({
    schemaVersion: "f07a-3v-audit-r1" as const,
    status: Object.values(checks).every(Boolean) ? "matched" : "mismatched",
    checks,
  });
}
