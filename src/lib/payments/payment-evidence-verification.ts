// F07A-3G_PAYMENT_EVIDENCE_VERIFICATION_REVIEW_CANDIDATE_R1
// F07A_3G_REUSE_F07A_3F_OPERATIONAL_EVIDENCE
// F07A_3G_PENDING_INDEPENDENT_MANUAL_REVIEW_ONLY
// F07A_3G_REVIEWER_AND_DECISION_ALWAYS_ABSENT
// F07A_3G_VERIFICATION_TAMPER_AUDIT

import {
  auditPaymentOperationalEvidence,
  createPaymentOperationalEvidence,
  validatePaymentOperationalEvidence,
} from "./payment-operational-evidence";
import type {
  PaymentOperationalEvidenceKey,
  PaymentOperationalEvidenceRecord,
} from "./payment-operational-evidence.types";
import type {
  PaymentEvidenceVerificationAudit,
  PaymentEvidenceVerificationAuditChecks,
  PaymentEvidenceVerificationItem,
  PaymentEvidenceVerificationItemStatus,
  PaymentEvidenceVerificationObservation,
  PaymentEvidenceVerificationResult,
  PaymentEvidenceVerificationStatus,
} from "./payment-evidence-verification.types";
import type { ProviderAdapterState } from "./payment-provider-assignment.types";

const REQUIRED_EVIDENCE_KEYS = Object.freeze([
  "credential-evidence",
  "callback-contract",
  "idempotency-evidence",
  "reconciliation-evidence",
] as const satisfies readonly PaymentOperationalEvidenceKey[]);

function fingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const character of parts.join("|")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function verificationStatusFor(
  adapterState: ProviderAdapterState,
): PaymentEvidenceVerificationStatus {
  if (adapterState === "runtime-registered") {
    return "blocked-pending-independent-review";
  }
  if (adapterState === "adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  return "blocked-adapter-missing";
}

function itemStatusFor(
  adapterState: ProviderAdapterState,
): PaymentEvidenceVerificationItemStatus {
  if (adapterState === "runtime-registered") {
    return "pending-independent-review";
  }
  if (adapterState === "adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  return "blocked-adapter-missing";
}

function createItems(
  records: readonly PaymentOperationalEvidenceRecord[],
  evidenceBundleFingerprint: string,
  adapterState: ProviderAdapterState,
): readonly PaymentEvidenceVerificationItem[] {
  return Object.freeze(
    records.map((record) =>
      Object.freeze({
        key: record.key,
        environment: "sandbox" as const,
        evidenceRecordStatus: record.status,
        status: itemStatusFor(adapterState),
        referenceId: record.referenceId,
        referenceFingerprint: record.referenceFingerprint,
        evidenceBundleFingerprint,
        containsSecret: false as const,
        reviewerRole: "independent-operator-required" as const,
        reviewMethod: "manual-non-secret-reference-review" as const,
        reviewerId: null,
        reviewedAt: null,
        verificationApproved: false as const,
        rejectionRecorded: false as const,
        decisionReason: null,
      }),
    ),
  );
}

function verificationFingerprint(
  verificationPrefix: string,
  items: readonly PaymentEvidenceVerificationItem[],
): string {
  return fingerprint([
    verificationPrefix,
    ...items.flatMap((item) => [
      item.key,
      item.environment,
      item.evidenceRecordStatus,
      item.status,
      item.referenceId ?? "none",
      item.referenceFingerprint ?? "none",
      item.evidenceBundleFingerprint,
      String(item.containsSecret),
      item.reviewerRole,
      item.reviewMethod,
      item.reviewerId ?? "none",
      item.reviewedAt ?? "none",
      String(item.verificationApproved),
      String(item.rejectionRecorded),
      item.decisionReason ?? "none",
    ]),
  ]);
}

function defaultObservation(
  result: PaymentEvidenceVerificationResult,
): PaymentEvidenceVerificationObservation {
  const assignment = result.evidenceManifest.readiness.providerAssignmentPolicy;
  return Object.freeze({
    providerKey: result.providerKey,
    adapterState: result.adapterState,
    providerCurrency: result.providerCurrency,
    providerAmountMinor: result.providerAmountMinor,
    snapshotFingerprint:
      assignment.binding.lockedPresentation.snapshot.fingerprint,
    evidenceBundleFingerprint: result.evidenceManifest.bundleFingerprint,
    verificationStatus: result.verificationStatus,
    verificationFingerprint: result.verificationFingerprint,
    itemFingerprints: Object.freeze(
      result.items.map((item) => item.referenceFingerprint),
    ),
    reviewerId: null,
    reviewedAt: null,
    verificationDecisionCreated: false,
    reviewerAttestationCreated: false,
    approvalCreated: false,
    approvalTokenCreated: false,
    activationTokenCreated: false,
    providerRequestCreated: false,
    settlementInstructionCreated: false,
    registryMutationCreated: false,
    executionEligible: false,
  });
}

export function createPaymentEvidenceVerification(
  localeInput: unknown,
): PaymentEvidenceVerificationResult {
  const evidenceManifest = createPaymentOperationalEvidence(localeInput);
  validatePaymentOperationalEvidence(evidenceManifest);
  const evidenceAudit = auditPaymentOperationalEvidence(evidenceManifest);
  if (evidenceAudit.status !== "matched") {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_EVIDENCE_AUDIT_FAILED");
  }

  const verificationStatus = verificationStatusFor(
    evidenceManifest.adapterState,
  );
  const items = createItems(
    evidenceManifest.records,
    evidenceManifest.bundleFingerprint,
    evidenceManifest.adapterState,
  );
  const verificationPrefix = [
    "f07a-3g-r1",
    evidenceManifest.manifestId,
    verificationStatus,
  ].join(":");
  const reviewFingerprint = verificationFingerprint(verificationPrefix, items);
  const blockers = Object.freeze(
    evidenceManifest.adapterState === "runtime-registered"
      ? [
          "independent-reviewer-required",
          "manual-reference-review-required",
          "verification-decision-required",
          "manual-approval-required",
        ]
      : [
          evidenceManifest.adapterState === "adapter-disabled"
            ? "adapter-disabled"
            : "adapter-missing",
        ],
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3g-r1" as const,
    verificationId: `${verificationPrefix}:${reviewFingerprint}`,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    evidenceManifest,
    providerKey: evidenceManifest.providerKey,
    adapterState: evidenceManifest.adapterState,
    providerCurrency: evidenceManifest.providerCurrency,
    providerAmountMinor: evidenceManifest.providerAmountMinor,
    verificationStatus,
    items,
    verificationFingerprint: reviewFingerprint,
    blockers,
    decisionDraft: Object.freeze({
      status: "not-created-preview-only" as const,
      verificationDecisionCreated: false as const,
      reviewerAttestationCreated: false as const,
      approvalCreated: false as const,
      approvalTokenCreated: false as const,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
      productionEligible: false as const,
      executionEligible: false as const,
    }),
  });

  validatePaymentEvidenceVerification(result);
  return result;
}

export function validatePaymentEvidenceVerification(
  result: PaymentEvidenceVerificationResult,
): void {
  validatePaymentOperationalEvidence(result.evidenceManifest);
  const evidence = result.evidenceManifest;
  const assignment = evidence.readiness.providerAssignmentPolicy;
  const draft = result.decisionDraft;
  const itemKeys = result.items.map((item) => item.key);

  if (
    itemKeys.length !== REQUIRED_EVIDENCE_KEYS.length ||
    new Set(itemKeys).size !== REQUIRED_EVIDENCE_KEYS.length ||
    REQUIRED_EVIDENCE_KEYS.some((key) => !itemKeys.includes(key))
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_KEY_SET_INVALID");
  }
  if (
    result.environment !== "sandbox" ||
    result.items.some((item) => item.environment !== "sandbox")
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_ENVIRONMENT_INVALID");
  }
  if (
    result.providerKey !== evidence.providerKey ||
    result.adapterState !== evidence.adapterState ||
    result.providerCurrency !== evidence.providerCurrency ||
    result.providerAmountMinor !== evidence.providerAmountMinor ||
    result.verificationStatus !== verificationStatusFor(result.adapterState)
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_BINDING_MISMATCH");
  }

  for (const item of result.items) {
    const record = evidence.records.find(
      (candidate) => candidate.key === item.key,
    );
    if (
      !record ||
      item.evidenceRecordStatus !== record.status ||
      item.referenceId !== record.referenceId ||
      item.referenceFingerprint !== record.referenceFingerprint ||
      item.evidenceBundleFingerprint !== evidence.bundleFingerprint ||
      item.status !== itemStatusFor(result.adapterState)
    ) {
      throw new Error("PAYMENT_EVIDENCE_VERIFICATION_REFERENCE_MISMATCH");
    }
    if (
      item.containsSecret !== false ||
      item.reviewerRole !== "independent-operator-required" ||
      item.reviewMethod !== "manual-non-secret-reference-review" ||
      item.reviewerId !== null ||
      item.reviewedAt !== null ||
      item.verificationApproved !== false ||
      item.rejectionRecorded !== false ||
      item.decisionReason !== null ||
      /api[_-]?key|secret|begin certificate|private key/i.test(
        item.referenceId ?? "",
      )
    ) {
      throw new Error("PAYMENT_EVIDENCE_VERIFICATION_REVIEW_ARTIFACT_PRESENT");
    }
  }

  if (result.adapterState === "runtime-registered") {
    if (
      result.items.some(
        (item) =>
          item.status !== "pending-independent-review" ||
          item.referenceId === null ||
          item.referenceFingerprint === null,
      )
    ) {
      throw new Error("PAYMENT_EVIDENCE_VERIFICATION_GPAY_QUEUE_INVALID");
    }
  } else if (
    result.items.some(
      (item) =>
        item.referenceId !== null ||
        item.referenceFingerprint !== null ||
        item.status === "pending-independent-review",
    )
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_BLOCKED_QUEUE_INVALID");
  }

  if (
    result.verificationFingerprint !==
    verificationFingerprint(
      ["f07a-3g-r1", evidence.manifestId, result.verificationStatus].join(":"),
      result.items,
    )
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_FINGERPRINT_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    draft.productionEligible !== false ||
    draft.executionEligible !== false ||
    draft.verificationDecisionCreated !== false ||
    draft.reviewerAttestationCreated !== false ||
    draft.approvalCreated !== false ||
    draft.approvalTokenCreated !== false ||
    draft.activationTokenCreated !== false ||
    draft.providerRequestCreated !== false ||
    draft.settlementInstructionCreated !== false ||
    draft.registryMutationCreated !== false
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_EXECUTION_ARTIFACT_CREATED");
  }
  if (
    evidence.records.some((record) => record.verificationApproved !== false) ||
    evidence.approvalDraft.approvalCreated !== false ||
    evidence.readiness.executionEligible !== false ||
    evidence.readiness.productionEligible !== false ||
    assignment.binding.paymentDraft.status !== "unassigned" ||
    assignment.binding.paymentDraft.providerId !== null
  ) {
    throw new Error("PAYMENT_EVIDENCE_VERIFICATION_UPSTREAM_MUTATED");
  }
}

export function auditPaymentEvidenceVerification(
  result: PaymentEvidenceVerificationResult,
  observation: PaymentEvidenceVerificationObservation = defaultObservation(
    result,
  ),
): PaymentEvidenceVerificationAudit {
  validatePaymentEvidenceVerification(result);
  const evidenceAudit = auditPaymentOperationalEvidence(
    result.evidenceManifest,
  );
  const evidence = result.evidenceManifest;
  const assignment = evidence.readiness.providerAssignmentPolicy;
  const draft = result.decisionDraft;
  const itemFingerprints = result.items.map(
    (item) => item.referenceFingerprint,
  );
  const itemKeys = result.items.map((item) => item.key);
  const checks: PaymentEvidenceVerificationAuditChecks = Object.freeze({
    operationalEvidenceAuditMatched: evidenceAudit.status === "matched",
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
    verificationStatusMatches:
      observation.verificationStatus === result.verificationStatus,
    requiredEvidenceKeySetMatches:
      itemKeys.length === REQUIRED_EVIDENCE_KEYS.length &&
      REQUIRED_EVIDENCE_KEYS.every((key) => itemKeys.includes(key)),
    itemReferencesPreserved: result.items.every((item) => {
      const record = evidence.records.find(
        (candidate) => candidate.key === item.key,
      );
      return (
        record !== undefined &&
        item.referenceId === record.referenceId &&
        item.referenceFingerprint === record.referenceFingerprint &&
        item.evidenceBundleFingerprint === evidence.bundleFingerprint
      );
    }),
    itemFingerprintsMatch:
      observation.verificationFingerprint === result.verificationFingerprint &&
      observation.itemFingerprints.length === itemFingerprints.length &&
      observation.itemFingerprints.every(
        (value, index) => value === itemFingerprints[index],
      ),
    itemsAreSandboxScoped: result.items.every(
      (item) => item.environment === "sandbox",
    ),
    itemsContainNoSecrets: result.items.every(
      (item) => item.containsSecret === false,
    ),
    reviewerIdentityAbsent:
      observation.reviewerId === null &&
      observation.reviewedAt === null &&
      result.items.every(
        (item) => item.reviewerId === null && item.reviewedAt === null,
      ),
    verificationDecisionRemainsPending:
      observation.verificationDecisionCreated === false &&
      observation.reviewerAttestationCreated === false &&
      result.items.every(
        (item) =>
          item.verificationApproved === false &&
          item.rejectionRecorded === false &&
          item.decisionReason === null,
      ) &&
      draft.verificationDecisionCreated === false &&
      draft.reviewerAttestationCreated === false,
    originalEvidenceRemainsUnverified: evidence.records.every(
      (record) => record.verificationApproved === false,
    ),
    originalReadinessRemainsBlocked:
      evidence.readiness.executionEligible === false &&
      evidence.readiness.productionEligible === false &&
      evidence.readiness.blockers.length > 0,
    approvalAndActivationArtifactsAbsent:
      observation.approvalCreated === false &&
      observation.approvalTokenCreated === false &&
      observation.activationTokenCreated === false &&
      observation.providerRequestCreated === false &&
      observation.settlementInstructionCreated === false &&
      observation.registryMutationCreated === false &&
      draft.approvalCreated === false &&
      draft.approvalTokenCreated === false &&
      draft.activationTokenCreated === false &&
      draft.providerRequestCreated === false &&
      draft.settlementInstructionCreated === false &&
      draft.registryMutationCreated === false,
    productionAndExecutionBlocked:
      observation.executionEligible === false &&
      result.productionEligible === false &&
      result.executionEligible === false &&
      draft.productionEligible === false &&
      draft.executionEligible === false,
  });
  const status = Object.values(checks).every(Boolean) ? "matched" : "mismatch";
  return Object.freeze({
    auditId: `audit:${result.verificationId}`,
    verificationId: result.verificationId,
    status,
    checks,
  });
}
