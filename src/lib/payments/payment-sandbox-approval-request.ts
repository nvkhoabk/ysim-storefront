// F07A-3H_PAYMENT_SANDBOX_APPROVAL_REQUEST_CANDIDATE_R1
// F07A_3H_REUSE_F07A_3G_VERIFICATION_REVIEW
// F07A_3H_UNSIGNED_APPROVAL_REQUEST_PACKET_ONLY
// F07A_3H_APPROVAL_SUBMISSION_AND_DECISION_ALWAYS_ABSENT
// F07A_3H_APPROVAL_REQUEST_TAMPER_AUDIT

import {
  auditPaymentEvidenceVerification,
  createPaymentEvidenceVerification,
  validatePaymentEvidenceVerification,
} from "./payment-evidence-verification";
import type { ProviderAdapterState } from "./payment-provider-assignment.types";
import type {
  PaymentSandboxApprovalPrerequisite,
  PaymentSandboxApprovalPrerequisiteKey,
  PaymentSandboxApprovalRequestAudit,
  PaymentSandboxApprovalRequestAuditChecks,
  PaymentSandboxApprovalRequestObservation,
  PaymentSandboxApprovalRequestResult,
  PaymentSandboxApprovalRequestStatus,
} from "./payment-sandbox-approval-request.types";

const REQUIRED_PREREQUISITE_KEYS = Object.freeze([
  "independent-review-complete",
  "verification-decision-issued",
  "reviewer-attestation-recorded",
  "manual-approval-authorized",
] as const satisfies readonly PaymentSandboxApprovalPrerequisiteKey[]);

function fingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const character of parts.join("|")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function requestStatusFor(
  adapterState: ProviderAdapterState,
): PaymentSandboxApprovalRequestStatus {
  if (adapterState === "runtime-registered") {
    return "blocked-pending-verification-decision";
  }
  if (adapterState === "adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  return "blocked-adapter-missing";
}

function createPrerequisites(
  adapterState: ProviderAdapterState,
): readonly PaymentSandboxApprovalPrerequisite[] {
  const blockedStatus =
    adapterState === "adapter-disabled"
      ? "blocked-adapter-disabled"
      : "blocked-adapter-missing";
  const reason =
    adapterState === "runtime-registered"
      ? "upstream-verification-decision-not-issued"
      : adapterState === "adapter-disabled"
        ? "provider-adapter-disabled"
        : "provider-adapter-missing";
  return Object.freeze(
    REQUIRED_PREREQUISITE_KEYS.map((key) =>
      Object.freeze({
        key,
        status:
          adapterState === "runtime-registered" ? "pending" : blockedStatus,
        satisfied: false as const,
        reason,
      }),
    ),
  );
}

function requestFingerprint(
  requestPrefix: string,
  prerequisites: readonly PaymentSandboxApprovalPrerequisite[],
): string {
  const prerequisiteParts = prerequisites.reduce<string[]>((parts, item) => {
    parts.push(item.key, item.status, String(item.satisfied), item.reason);
    return parts;
  }, []);
  return fingerprint([requestPrefix, ...prerequisiteParts]);
}

function defaultObservation(
  result: PaymentSandboxApprovalRequestResult,
): PaymentSandboxApprovalRequestObservation {
  const assignment =
    result.verificationReview.evidenceManifest.readiness
      .providerAssignmentPolicy;
  return Object.freeze({
    providerKey: result.providerKey,
    adapterState: result.adapterState,
    providerCurrency: result.providerCurrency,
    providerAmountMinor: result.providerAmountMinor,
    snapshotFingerprint:
      assignment.binding.lockedPresentation.snapshot.fingerprint,
    evidenceBundleFingerprint:
      result.verificationReview.evidenceManifest.bundleFingerprint,
    verificationFingerprint: result.verificationReview.verificationFingerprint,
    requestStatus: result.requestStatus,
    requestFingerprint: result.requestFingerprint,
    prerequisiteKeys: Object.freeze(
      result.prerequisites.map((item) => item.key),
    ),
    reviewerIdentityPresent: false,
    verificationDecisionCreated: false,
    approvalRequestSubmitted: false,
    approvalDecisionCreated: false,
    approverIdentityCreated: false,
    approvalTokenCreated: false,
    activationTokenCreated: false,
    providerRequestCreated: false,
    settlementInstructionCreated: false,
    registryMutationCreated: false,
    executionEligible: false,
  });
}

export function createPaymentSandboxApprovalRequest(
  localeInput: unknown,
): PaymentSandboxApprovalRequestResult {
  const verificationReview = createPaymentEvidenceVerification(localeInput);
  validatePaymentEvidenceVerification(verificationReview);
  const verificationAudit =
    auditPaymentEvidenceVerification(verificationReview);
  if (verificationAudit.status !== "matched") {
    throw new Error(
      "PAYMENT_SANDBOX_APPROVAL_REQUEST_VERIFICATION_AUDIT_FAILED",
    );
  }

  const requestStatus = requestStatusFor(verificationReview.adapterState);
  const prerequisites = createPrerequisites(verificationReview.adapterState);
  const requestPrefix = [
    "f07a-3h-r1",
    verificationReview.verificationId,
    requestStatus,
  ].join(":");
  const approvalRequestFingerprint = requestFingerprint(
    requestPrefix,
    prerequisites,
  );
  const blockers = Object.freeze(
    verificationReview.adapterState === "runtime-registered"
      ? [
          "independent-review-incomplete",
          "verification-decision-not-issued",
          "reviewer-attestation-not-recorded",
          "manual-approval-not-authorized",
        ]
      : [
          verificationReview.adapterState === "adapter-disabled"
            ? "adapter-disabled"
            : "adapter-missing",
        ],
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3h-r1" as const,
    requestId: `${requestPrefix}:${approvalRequestFingerprint}`,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    verificationReview,
    providerKey: verificationReview.providerKey,
    adapterState: verificationReview.adapterState,
    providerCurrency: verificationReview.providerCurrency,
    providerAmountMinor: verificationReview.providerAmountMinor,
    upstreamVerificationStatus: verificationReview.verificationStatus,
    requestStatus,
    prerequisites,
    blockers,
    requestFingerprint: approvalRequestFingerprint,
    approvalDraft: Object.freeze({
      status: "prepared-not-submitted" as const,
      requestPacketPrepared: true as const,
      approvalRequestSubmitted: false as const,
      approvalDecisionCreated: false as const,
      reviewerAttestationCreated: false as const,
      approverIdentityCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
      productionEligible: false as const,
      executionEligible: false as const,
    }),
  });

  validatePaymentSandboxApprovalRequest(result);
  return result;
}

export function validatePaymentSandboxApprovalRequest(
  result: PaymentSandboxApprovalRequestResult,
): void {
  validatePaymentEvidenceVerification(result.verificationReview);
  const verification = result.verificationReview;
  const evidence = verification.evidenceManifest;
  const assignment = evidence.readiness.providerAssignmentPolicy;
  const draft = result.approvalDraft;
  const prerequisiteKeys = result.prerequisites.map((item) => item.key);

  if (
    prerequisiteKeys.length !== REQUIRED_PREREQUISITE_KEYS.length ||
    new Set(prerequisiteKeys).size !== REQUIRED_PREREQUISITE_KEYS.length ||
    REQUIRED_PREREQUISITE_KEYS.some((key) => !prerequisiteKeys.includes(key))
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_APPROVAL_REQUEST_PREREQUISITE_SET_INVALID",
    );
  }
  if (
    result.environment !== "sandbox" ||
    result.providerKey !== verification.providerKey ||
    result.adapterState !== verification.adapterState ||
    result.providerCurrency !== verification.providerCurrency ||
    result.providerAmountMinor !== verification.providerAmountMinor ||
    result.upstreamVerificationStatus !== verification.verificationStatus ||
    result.requestStatus !== requestStatusFor(result.adapterState)
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REQUEST_BINDING_MISMATCH");
  }
  if (
    result.prerequisites.some(
      (item) =>
        item.satisfied !== false ||
        item.status !==
          (result.adapterState === "runtime-registered"
            ? "pending"
            : result.adapterState === "adapter-disabled"
              ? "blocked-adapter-disabled"
              : "blocked-adapter-missing"),
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REQUEST_PREREQUISITE_INVALID");
  }
  if (
    result.requestFingerprint !==
    requestFingerprint(
      ["f07a-3h-r1", verification.verificationId, result.requestStatus].join(
        ":",
      ),
      result.prerequisites,
    )
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REQUEST_FINGERPRINT_INVALID");
  }
  if (
    draft.status !== "prepared-not-submitted" ||
    draft.requestPacketPrepared !== true ||
    draft.approvalRequestSubmitted !== false ||
    draft.approvalDecisionCreated !== false ||
    draft.reviewerAttestationCreated !== false ||
    draft.approverIdentityCreated !== false ||
    draft.approvalTokenCreated !== false ||
    draft.activationTokenCreated !== false ||
    draft.providerRequestCreated !== false ||
    draft.settlementInstructionCreated !== false ||
    draft.registryMutationCreated !== false ||
    draft.productionEligible !== false ||
    draft.executionEligible !== false ||
    result.productionEligible !== false ||
    result.executionEligible !== false
  ) {
    throw new Error(
      "PAYMENT_SANDBOX_APPROVAL_REQUEST_EXECUTION_ARTIFACT_CREATED",
    );
  }
  if (
    verification.items.some(
      (item) =>
        item.reviewerId !== null ||
        item.reviewedAt !== null ||
        item.verificationApproved !== false,
    ) ||
    verification.decisionDraft.verificationDecisionCreated !== false ||
    verification.decisionDraft.reviewerAttestationCreated !== false ||
    evidence.approvalDraft.approvalCreated !== false ||
    evidence.readiness.executionEligible !== false ||
    assignment.binding.paymentDraft.status !== "unassigned" ||
    assignment.binding.paymentDraft.providerId !== null
  ) {
    throw new Error("PAYMENT_SANDBOX_APPROVAL_REQUEST_UPSTREAM_MUTATED");
  }
}

export function auditPaymentSandboxApprovalRequest(
  result: PaymentSandboxApprovalRequestResult,
  observation: PaymentSandboxApprovalRequestObservation = defaultObservation(
    result,
  ),
): PaymentSandboxApprovalRequestAudit {
  validatePaymentSandboxApprovalRequest(result);
  const verificationAudit = auditPaymentEvidenceVerification(
    result.verificationReview,
  );
  const verification = result.verificationReview;
  const evidence = verification.evidenceManifest;
  const assignment = evidence.readiness.providerAssignmentPolicy;
  const draft = result.approvalDraft;

  const checks: PaymentSandboxApprovalRequestAuditChecks = Object.freeze({
    verificationAuditMatched: verificationAudit.status === "matched",
    providerKeyMatches: observation.providerKey === result.providerKey,
    adapterStateMatches: observation.adapterState === result.adapterState,
    providerCurrencyMatches:
      observation.providerCurrency === result.providerCurrency,
    providerAmountMatches:
      observation.providerAmountMinor === result.providerAmountMinor,
    snapshotFingerprintMatches:
      observation.snapshotFingerprint ===
      assignment.binding.lockedPresentation.snapshot.fingerprint,
    evidenceBundleFingerprintMatches:
      observation.evidenceBundleFingerprint === evidence.bundleFingerprint,
    verificationFingerprintMatches:
      observation.verificationFingerprint ===
      verification.verificationFingerprint,
    requestStatusMatches: observation.requestStatus === result.requestStatus,
    requestFingerprintMatches:
      observation.requestFingerprint === result.requestFingerprint,
    prerequisiteKeySetMatches:
      observation.prerequisiteKeys.length ===
        REQUIRED_PREREQUISITE_KEYS.length &&
      REQUIRED_PREREQUISITE_KEYS.every((key) =>
        observation.prerequisiteKeys.includes(key),
      ),
    prerequisitesRemainUnsatisfied: result.prerequisites.every(
      (item) => item.satisfied === false,
    ),
    reviewerIdentityAbsent:
      observation.reviewerIdentityPresent === false &&
      verification.items.every((item) => item.reviewerId === null),
    verificationDecisionAbsent:
      observation.verificationDecisionCreated === false &&
      verification.decisionDraft.verificationDecisionCreated === false,
    approvalRequestNotSubmitted:
      observation.approvalRequestSubmitted === false &&
      draft.approvalRequestSubmitted === false,
    approvalDecisionAbsent:
      observation.approvalDecisionCreated === false &&
      draft.approvalDecisionCreated === false,
    approverIdentityAbsent:
      observation.approverIdentityCreated === false &&
      draft.approverIdentityCreated === false,
    approvalAndActivationArtifactsAbsent:
      observation.approvalTokenCreated === false &&
      observation.activationTokenCreated === false &&
      observation.providerRequestCreated === false &&
      observation.settlementInstructionCreated === false &&
      observation.registryMutationCreated === false &&
      draft.approvalTokenCreated === false &&
      draft.activationTokenCreated === false &&
      draft.providerRequestCreated === false &&
      draft.settlementInstructionCreated === false &&
      draft.registryMutationCreated === false,
    upstreamVerificationRemainsBlocked:
      verification.productionEligible === false &&
      verification.executionEligible === false &&
      verification.verificationStatus.startsWith("blocked-"),
    originalPaymentBindingRemainsUnassigned:
      assignment.binding.paymentDraft.status === "unassigned" &&
      assignment.binding.paymentDraft.providerId === null,
    productionAndExecutionBlocked:
      observation.executionEligible === false &&
      result.productionEligible === false &&
      result.executionEligible === false,
  });
  const status = Object.values(checks).every(Boolean) ? "matched" : "mismatch";
  return Object.freeze({
    auditId: `${result.requestId}:audit:${status}`,
    requestId: result.requestId,
    status,
    checks,
  });
}
