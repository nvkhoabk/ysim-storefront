// F07A-3I_PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_CANDIDATE_R1
// F07A_3I_REUSE_F07A_3H_OPAQUE_REQUEST_WITH_SAFE_SUMMARY_ONLY
// F07A_3I_NO_RAW_UPSTREAM_PAYLOAD_RETENTION
// F07A_3I_REVIEWER_AND_DECISION_ALWAYS_ABSENT
// F07A_3I_UNSIGNED_NON_SECRET_UNSUBMITTED_EXPORT_ENVELOPE
// F07A_3I_NO_PROVIDER_EXECUTION_OR_REGISTRY_MUTATION

import type {
  PaymentSandboxApprovalReviewHandoffAudit,
  PaymentSandboxApprovalReviewHandoffAuditChecks,
  PaymentSandboxApprovalReviewHandoffItem,
  PaymentSandboxApprovalReviewHandoffItemKey,
  PaymentSandboxApprovalReviewHandoffItemStatus,
  PaymentSandboxApprovalReviewHandoffObservation,
  PaymentSandboxApprovalReviewHandoffResult,
  PaymentSandboxApprovalReviewHandoffSafeSummary,
} from "./payment-sandbox-approval-review-handoff.types";

const REQUIRED_ITEM_KEYS = Object.freeze([
  "request-identity",
  "verification-binding",
  "approval-prerequisites",
  "no-execution-guardrails",
] as const satisfies readonly PaymentSandboxApprovalReviewHandoffItemKey[]);

const SAFE_FIELD_KEYS = Object.freeze([
  "schemaVersion",
  "environment",
  "providerKey",
  "adapterState",
  "providerCurrency",
  "providerAmountMinor",
  "requestId",
  "approvalRequestId",
  "requestStatus",
  "approvalRequestStatus",
  "requestFingerprint",
  "approvalRequestFingerprint",
  "verificationFingerprint",
  "blockers",
  "prerequisites",
] as const);

type SafeFieldKey = (typeof SAFE_FIELD_KEYS)[number];
type SafeFieldValue = string | number | boolean | null | readonly string[];
type SafeFieldMap = Partial<Record<SafeFieldKey, SafeFieldValue>>;

function fingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const character of parts.join("|")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safePrimitive(value: unknown): SafeFieldValue | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  if (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  ) {
    return Object.freeze([...value]);
  }
  return undefined;
}

function collectSafeFields(
  value: unknown,
  fields: SafeFieldMap,
  visited: Set<object>,
  depth: number,
): void {
  if (depth > 8 || value === null || typeof value !== "object") return;
  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) collectSafeFields(item, fields, visited, depth + 1);
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if ((SAFE_FIELD_KEYS as readonly string[]).includes(key)) {
      const primitive = safePrimitive(child);
      if (primitive !== undefined && fields[key as SafeFieldKey] === undefined) {
        fields[key as SafeFieldKey] = primitive;
      }
    }
    if (typeof child === "object" && child !== null) {
      collectSafeFields(child, fields, visited, depth + 1);
    }
  }
}

function asString(value: SafeFieldValue | undefined, fallback: string): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function arrayCount(value: SafeFieldValue | undefined): number {
  return Array.isArray(value) ? value.length : 0;
}

function createSafeSummary(
  upstreamApprovalRequest: unknown,
): PaymentSandboxApprovalReviewHandoffSafeSummary {
  if (!isRecord(upstreamApprovalRequest)) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_UPSTREAM_INVALID");
  }

  const fields: SafeFieldMap = {};
  collectSafeFields(upstreamApprovalRequest, fields, new Set<object>(), 0);

  const schemaVersion = asString(fields.schemaVersion, "unknown-schema");
  const environment = asString(fields.environment, "sandbox");
  const providerKey = asString(fields.providerKey, "unresolved-provider");
  const adapterState = asString(fields.adapterState, "unresolved-adapter-state");
  const providerCurrency = asString(fields.providerCurrency, "unresolved-currency");
  const providerAmountMinor = asString(
    fields.providerAmountMinor,
    "unresolved-amount",
  );
  const requestId = asString(
    fields.requestId ?? fields.approvalRequestId,
    "unresolved-request-id",
  );
  const requestStatus = asString(
    fields.requestStatus ?? fields.approvalRequestStatus,
    "blocked-preview-only",
  );
  const requestFingerprint = asString(
    fields.requestFingerprint ?? fields.approvalRequestFingerprint,
    "unresolved-request-fingerprint",
  );
  const verificationFingerprint = asString(
    fields.verificationFingerprint,
    "unresolved-verification-fingerprint",
  );
  const blockerCount = arrayCount(fields.blockers);
  const prerequisiteCount = arrayCount(fields.prerequisites);

  return Object.freeze({
    schemaVersion,
    environment,
    providerKey,
    adapterState,
    providerCurrency,
    providerAmountMinor,
    requestId,
    requestStatus,
    requestFingerprint,
    verificationFingerprint,
    blockerCount,
    prerequisiteCount,
  });
}

function summaryFingerprint(
  summary: PaymentSandboxApprovalReviewHandoffSafeSummary,
): string {
  return fingerprint([
    summary.schemaVersion,
    summary.environment,
    summary.providerKey,
    summary.adapterState,
    summary.providerCurrency,
    summary.providerAmountMinor,
    summary.requestId,
    summary.requestStatus,
    summary.requestFingerprint,
    summary.verificationFingerprint,
    String(summary.blockerCount),
    String(summary.prerequisiteCount),
  ]);
}

function statusForAdapter(
  adapterState: string,
): PaymentSandboxApprovalReviewHandoffItemStatus {
  const normalized = adapterState.toLowerCase();
  if (normalized.includes("disabled")) return "blocked-adapter-disabled";
  if (normalized.includes("missing") || normalized.includes("absent")) {
    return "blocked-adapter-missing";
  }
  return "pending-manual-review";
}

function handoffStatusFor(
  adapterState: string,
): PaymentSandboxApprovalReviewHandoffResult["handoffStatus"] {
  const itemStatus = statusForAdapter(adapterState);
  if (itemStatus === "blocked-adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  if (itemStatus === "blocked-adapter-missing") {
    return "blocked-adapter-missing";
  }
  return "blocked-pending-manual-review";
}

function createItems(
  adapterState: string,
): readonly PaymentSandboxApprovalReviewHandoffItem[] {
  const status = statusForAdapter(adapterState);
  return Object.freeze(
    REQUIRED_ITEM_KEYS.map((key) =>
      Object.freeze({
        key,
        status,
        reviewerRole: "independent-operator-required" as const,
        reviewMethod: "manual-non-secret-handoff-review" as const,
        reviewerId: null,
        reviewedAt: null,
        decision: null,
        decisionReason: null,
      }),
    ),
  );
}

export function createPaymentSandboxApprovalReviewHandoff(
  upstreamApprovalRequest: unknown,
): PaymentSandboxApprovalReviewHandoffResult {
  const upstreamSummary = createSafeSummary(upstreamApprovalRequest);
  const upstreamRequestFingerprint = summaryFingerprint(upstreamSummary);
  const items = createItems(upstreamSummary.adapterState);
  const handoffId = fingerprint([
    "f07a-3i-r1",
    upstreamRequestFingerprint,
    ...items.map((item) => `${item.key}:${item.status}`),
  ]);

  const result = Object.freeze({
    schemaVersion: "f07a-3i-r1" as const,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    handoffId,
    handoffStatus: handoffStatusFor(upstreamSummary.adapterState),
    upstreamRequestFingerprint,
    upstreamSummary,
    items,
    exportEnvelope: Object.freeze({
      mediaType: "application/json" as const,
      schemaVersion: "f07a-3i-r1" as const,
      signed: false as const,
      containsSecret: false as const,
      submitted: false as const,
      body: Object.freeze({
        handoffId,
        environment: "sandbox" as const,
        upstreamRequestFingerprint,
        providerKey: upstreamSummary.providerKey,
        adapterState: upstreamSummary.adapterState,
        requestStatus: upstreamSummary.requestStatus,
        reviewItemKeys: Object.freeze(items.map((item) => item.key)),
        reviewerAssigned: false as const,
        decisionCreated: false as const,
        approvalCreated: false as const,
        activationCreated: false as const,
        providerRequestCreated: false as const,
      }),
    }),
    artifacts: Object.freeze({
      reviewerAssignmentCreated: false as const,
      reviewerAttestationCreated: false as const,
      verificationDecisionCreated: false as const,
      approvalCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
    }),
  });

  validatePaymentSandboxApprovalReviewHandoff(result);
  return result;
}

export function validatePaymentSandboxApprovalReviewHandoff(
  result: PaymentSandboxApprovalReviewHandoffResult,
): void {
  const expectedItemStatus = statusForAdapter(result.upstreamSummary.adapterState);
  const keys = result.items.map((item) => item.key);
  const artifacts = result.artifacts;

  if (
    result.schemaVersion !== "f07a-3i-r1" ||
    result.purpose !== "ui-preview-only" ||
    result.environment !== "sandbox"
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_SCHEMA_INVALID");
  }
  if (
    keys.length !== REQUIRED_ITEM_KEYS.length ||
    new Set(keys).size !== REQUIRED_ITEM_KEYS.length ||
    REQUIRED_ITEM_KEYS.some((key) => !keys.includes(key))
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_ITEM_SET_INVALID");
  }
  if (
    result.items.some(
      (item) =>
        item.status !== expectedItemStatus ||
        item.reviewerRole !== "independent-operator-required" ||
        item.reviewMethod !== "manual-non-secret-handoff-review" ||
        item.reviewerId !== null ||
        item.reviewedAt !== null ||
        item.decision !== null ||
        item.decisionReason !== null,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_REVIEW_ARTIFACT_PRESENT");
  }
  if (
    result.upstreamRequestFingerprint !== summaryFingerprint(result.upstreamSummary)
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_FINGERPRINT_INVALID");
  }
  if (
    result.exportEnvelope.signed !== false ||
    result.exportEnvelope.containsSecret !== false ||
    result.exportEnvelope.submitted !== false ||
    result.exportEnvelope.body.upstreamRequestFingerprint !==
      result.upstreamRequestFingerprint ||
    result.exportEnvelope.body.reviewerAssigned !== false ||
    result.exportEnvelope.body.decisionCreated !== false ||
    result.exportEnvelope.body.approvalCreated !== false ||
    result.exportEnvelope.body.activationCreated !== false ||
    result.exportEnvelope.body.providerRequestCreated !== false
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_EXPORT_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    Object.values(artifacts).some((value) => value !== false)
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_EXECUTION_ARTIFACT_CREATED");
  }
}

function defaultObservation(
  result: PaymentSandboxApprovalReviewHandoffResult,
): PaymentSandboxApprovalReviewHandoffObservation {
  return Object.freeze({
    upstreamRequestFingerprint: result.upstreamRequestFingerprint,
    itemKeys: Object.freeze(result.items.map((item) => item.key)),
    reviewerIdentityPresent: false,
    reviewDecisionPresent: false,
    exportEnvelopeSigned: false,
    exportEnvelopeContainsSecret: false,
    exportEnvelopeSubmitted: false,
    approvalArtifactPresent: false,
    activationArtifactPresent: false,
    providerRequestPresent: false,
    settlementInstructionPresent: false,
    registryMutationPresent: false,
    productionEligible: false,
    executionEligible: false,
  });
}

export function auditPaymentSandboxApprovalReviewHandoff(
  result: PaymentSandboxApprovalReviewHandoffResult,
  observation: PaymentSandboxApprovalReviewHandoffObservation =
    defaultObservation(result),
): PaymentSandboxApprovalReviewHandoffAudit {
  validatePaymentSandboxApprovalReviewHandoff(result);
  const expectedKeys = REQUIRED_ITEM_KEYS;
  const observedKeys = observation.itemKeys;
  const checks: PaymentSandboxApprovalReviewHandoffAuditChecks = Object.freeze({
    schemaMatches: result.schemaVersion === "f07a-3i-r1",
    environmentSandbox: result.environment === "sandbox",
    upstreamFingerprintMatches:
      observation.upstreamRequestFingerprint === result.upstreamRequestFingerprint,
    requiredItemSetMatches:
      observedKeys.length === expectedKeys.length &&
      expectedKeys.every((key) => observedKeys.includes(key)),
    itemStatusesMatchAdapterState: result.items.every(
      (item) => item.status === statusForAdapter(result.upstreamSummary.adapterState),
    ),
    reviewerIdentityAbsent: observation.reviewerIdentityPresent === false,
    reviewDecisionAbsent: observation.reviewDecisionPresent === false,
    exportEnvelopeUnsigned: observation.exportEnvelopeSigned === false,
    exportEnvelopeContainsNoSecret:
      observation.exportEnvelopeContainsSecret === false,
    exportEnvelopeNotSubmitted: observation.exportEnvelopeSubmitted === false,
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
    schemaVersion: "f07a-3i-audit-r1" as const,
    status: Object.values(checks).every(Boolean)
      ? ("matched" as const)
      : ("mismatched" as const),
    checks,
  });
}
