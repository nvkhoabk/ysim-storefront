// F07A-3F_PAYMENT_OPERATIONAL_EVIDENCE_MANIFEST_CANDIDATE_R1
// F07A_3F_REUSE_F07A_3E_READINESS
// F07A_3F_NON_SECRET_REFERENCE_ONLY
// F07A_3F_VERIFICATION_AND_APPROVAL_ALWAYS_PENDING
// F07A_3F_EVIDENCE_TAMPER_AUDIT

import {
  auditPaymentExecutionReadiness,
  createPaymentExecutionReadiness,
  validatePaymentExecutionReadiness,
} from "./payment-execution-readiness";
import type {
  PaymentOperationalEvidenceAudit,
  PaymentOperationalEvidenceAuditChecks,
  PaymentOperationalEvidenceKey,
  PaymentOperationalEvidenceObservation,
  PaymentOperationalEvidenceRecord,
  PaymentOperationalEvidenceResult,
  PaymentOperationalEvidenceStatus,
} from "./payment-operational-evidence.types";
import type { ProviderAdapterState } from "./payment-provider-assignment.types";

const REQUIRED_EVIDENCE_KEYS = Object.freeze([
  "credential-evidence",
  "callback-contract",
  "idempotency-evidence",
  "reconciliation-evidence",
] as const);

const GPAY_REFERENCE_IDS = Object.freeze({
  "credential-evidence": "candidate:gpay:sandbox:credential-configuration",
  "callback-contract": "candidate:gpay:sandbox:callback-return-contract",
  "idempotency-evidence": "candidate:gpay:sandbox:idempotency-behaviour",
  "reconciliation-evidence": "candidate:gpay:sandbox:reconciliation-recovery",
} as const satisfies Readonly<Record<PaymentOperationalEvidenceKey, string>>);

function fingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const character of parts.join("|")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function evidenceStatusFor(
  adapterState: ProviderAdapterState,
): PaymentOperationalEvidenceStatus {
  if (adapterState === "runtime-registered") {
    return "blocked-evidence-verification";
  }
  if (adapterState === "adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  return "blocked-adapter-missing";
}

function createRecords(
  providerKey: PaymentOperationalEvidenceResult["providerKey"],
  marketId: string,
  providerCurrency: PaymentOperationalEvidenceResult["providerCurrency"],
  adapterState: ProviderAdapterState,
): readonly PaymentOperationalEvidenceRecord[] {
  return Object.freeze(
    REQUIRED_EVIDENCE_KEYS.map((key) => {
      if (adapterState === "runtime-registered") {
        const referenceId = GPAY_REFERENCE_IDS[key];
        return Object.freeze({
          key,
          environment: "sandbox" as const,
          status: "captured-unverified" as const,
          sourceKind: "candidate-reference" as const,
          referenceId,
          referenceFingerprint: fingerprint([
            "f07a-3f-r1",
            providerKey,
            marketId,
            providerCurrency,
            key,
            referenceId,
            "sandbox",
            "candidate-reference",
          ]),
          containsSecret: false as const,
          verificationApproved: false as const,
        });
      }
      return Object.freeze({
        key,
        environment: "sandbox" as const,
        status:
          adapterState === "adapter-disabled"
            ? ("blocked-adapter-disabled" as const)
            : ("blocked-adapter-missing" as const),
        sourceKind: "adapter-blocker" as const,
        referenceId: null,
        referenceFingerprint: null,
        containsSecret: false as const,
        verificationApproved: false as const,
      });
    }),
  );
}

function bundleFingerprint(
  manifestIdPrefix: string,
  records: readonly PaymentOperationalEvidenceRecord[],
): string {
  return fingerprint([
    manifestIdPrefix,
    ...records.flatMap((record) => [
      record.key,
      record.environment,
      record.status,
      record.sourceKind,
      record.referenceId ?? "none",
      record.referenceFingerprint ?? "none",
      String(record.containsSecret),
      String(record.verificationApproved),
    ]),
  ]);
}

function defaultObservation(
  result: PaymentOperationalEvidenceResult,
): PaymentOperationalEvidenceObservation {
  const readiness = result.readiness;
  return Object.freeze({
    providerKey: result.providerKey,
    adapterState: result.adapterState,
    providerCurrency: result.providerCurrency,
    providerAmountMinor: result.providerAmountMinor,
    snapshotFingerprint:
      readiness.providerAssignmentPolicy.binding.lockedPresentation.snapshot
        .fingerprint,
    readinessStatus: result.readinessStatus,
    evidenceStatus: result.evidenceStatus,
    bundleFingerprint: result.bundleFingerprint,
    recordFingerprints: Object.freeze(
      result.records.map((record) => record.referenceFingerprint),
    ),
    approvalCreated: false,
    approvalTokenCreated: false,
    activationTokenCreated: false,
    providerRequestCreated: false,
    settlementInstructionCreated: false,
    registryMutationCreated: false,
    executionEligible: false,
  });
}

export function createPaymentOperationalEvidence(
  localeInput: unknown,
): PaymentOperationalEvidenceResult {
  const readiness = createPaymentExecutionReadiness(localeInput);
  validatePaymentExecutionReadiness(readiness);
  const readinessAudit = auditPaymentExecutionReadiness(readiness);
  if (readinessAudit.status !== "matched") {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_READINESS_AUDIT_FAILED");
  }

  const assignment = readiness.providerAssignmentPolicy;
  const providerKey = assignment.providerAssignment.providerKey;
  const adapterState = assignment.providerAssignment.adapterState;
  const providerCurrency = assignment.settlementDraft.providerCurrency;
  const providerAmountMinor = assignment.settlementDraft.providerAmountMinor;
  const evidenceStatus = evidenceStatusFor(adapterState);
  const records = createRecords(
    providerKey,
    assignment.marketId,
    providerCurrency,
    adapterState,
  );
  const manifestPrefix = [
    "f07a-3f-r1",
    readiness.readinessId,
    evidenceStatus,
  ].join(":");
  const bundle = bundleFingerprint(manifestPrefix, records);
  const blockers = Object.freeze(
    adapterState === "runtime-registered"
      ? [
          "independent-evidence-verification-required",
          "manual-approval-required",
        ]
      : [
          adapterState === "adapter-disabled"
            ? "adapter-disabled"
            : "adapter-missing",
        ],
  );

  const result = Object.freeze({
    schemaVersion: "f07a-3f-r1" as const,
    manifestId: `${manifestPrefix}:${bundle}`,
    purpose: "ui-preview-only" as const,
    environment: "sandbox" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    readiness,
    providerKey,
    adapterState,
    providerCurrency,
    providerAmountMinor,
    readinessStatus: readiness.readinessStatus,
    evidenceStatus,
    records,
    bundleFingerprint: bundle,
    blockers,
    approvalDraft: Object.freeze({
      status: "not-created-preview-only" as const,
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

  validatePaymentOperationalEvidence(result);
  return result;
}

export function validatePaymentOperationalEvidence(
  result: PaymentOperationalEvidenceResult,
): void {
  validatePaymentExecutionReadiness(result.readiness);
  const readiness = result.readiness;
  const assignment = readiness.providerAssignmentPolicy;
  const draft = result.approvalDraft;
  const keys = result.records.map((record) => record.key);

  if (
    keys.length !== REQUIRED_EVIDENCE_KEYS.length ||
    new Set(keys).size !== REQUIRED_EVIDENCE_KEYS.length ||
    REQUIRED_EVIDENCE_KEYS.some((key) => !keys.includes(key))
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_KEY_SET_INVALID");
  }
  if (
    result.environment !== "sandbox" ||
    result.records.some((record) => record.environment !== "sandbox")
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_ENVIRONMENT_INVALID");
  }
  if (
    result.providerKey !== assignment.providerAssignment.providerKey ||
    result.adapterState !== assignment.providerAssignment.adapterState ||
    result.providerCurrency !== assignment.settlementDraft.providerCurrency ||
    result.providerAmountMinor !==
      assignment.settlementDraft.providerAmountMinor ||
    result.readinessStatus !== readiness.readinessStatus ||
    result.evidenceStatus !== evidenceStatusFor(result.adapterState)
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_BINDING_MISMATCH");
  }
  if (
    result.records.some(
      (record) =>
        record.containsSecret !== false ||
        record.verificationApproved !== false ||
        /api[_-]?key|secret|begin certificate|private key/i.test(
          record.referenceId ?? "",
        ),
    )
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_SECRET_OR_APPROVAL_PRESENT");
  }

  if (result.adapterState === "runtime-registered") {
    if (
      result.records.some(
        (record) =>
          record.status !== "captured-unverified" ||
          record.sourceKind !== "candidate-reference" ||
          record.referenceId === null ||
          record.referenceFingerprint === null,
      )
    ) {
      throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_GPAY_REFERENCE_INVALID");
    }
  } else if (
    result.records.some(
      (record) =>
        record.sourceKind !== "adapter-blocker" ||
        record.referenceId !== null ||
        record.referenceFingerprint !== null,
    )
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_BLOCKED_REFERENCE_INVALID");
  }

  if (
    result.bundleFingerprint !==
    bundleFingerprint(
      ["f07a-3f-r1", readiness.readinessId, result.evidenceStatus].join(":"),
      result.records,
    )
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_BUNDLE_FINGERPRINT_INVALID");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    draft.productionEligible !== false ||
    draft.executionEligible !== false ||
    draft.approvalCreated !== false ||
    draft.approvalTokenCreated !== false ||
    draft.activationTokenCreated !== false ||
    draft.providerRequestCreated !== false ||
    draft.settlementInstructionCreated !== false ||
    draft.registryMutationCreated !== false
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_EXECUTION_ARTIFACT_CREATED");
  }
  if (
    readiness.executionEligible !== false ||
    readiness.productionEligible !== false ||
    readiness.activationDraft.activationTokenCreated !== false ||
    readiness.activationDraft.providerRequestCreated !== false ||
    readiness.activationDraft.settlementInstructionCreated !== false ||
    readiness.activationDraft.registryMutationCreated !== false ||
    assignment.binding.paymentDraft.status !== "unassigned" ||
    assignment.binding.paymentDraft.providerId !== null
  ) {
    throw new Error("PAYMENT_OPERATIONAL_EVIDENCE_READINESS_MUTATED");
  }
}

export function auditPaymentOperationalEvidence(
  result: PaymentOperationalEvidenceResult,
  observation: PaymentOperationalEvidenceObservation = defaultObservation(
    result,
  ),
): PaymentOperationalEvidenceAudit {
  validatePaymentOperationalEvidence(result);
  const readinessAudit = auditPaymentExecutionReadiness(result.readiness);
  const assignment = result.readiness.providerAssignmentPolicy;
  const draft = result.approvalDraft;
  const recordFingerprints = result.records.map(
    (record) => record.referenceFingerprint,
  );
  const keys = result.records.map((record) => record.key);
  const checks: PaymentOperationalEvidenceAuditChecks = Object.freeze({
    readinessAuditMatched: readinessAudit.status === "matched",
    providerKeyMatches: observation.providerKey === result.providerKey,
    adapterStateMatches: observation.adapterState === result.adapterState,
    providerCurrencyMatches:
      observation.providerCurrency === result.providerCurrency,
    providerAmountMatches:
      observation.providerAmountMinor === result.providerAmountMinor,
    snapshotFingerprintMatches:
      observation.snapshotFingerprint ===
      assignment.binding.lockedPresentation.snapshot.fingerprint,
    readinessStatusMatches:
      observation.readinessStatus === result.readinessStatus,
    evidenceStatusMatches: observation.evidenceStatus === result.evidenceStatus,
    requiredEvidenceKeySetMatches:
      keys.length === REQUIRED_EVIDENCE_KEYS.length &&
      REQUIRED_EVIDENCE_KEYS.every((key) => keys.includes(key)),
    recordsAreSandboxScoped: result.records.every(
      (record) => record.environment === "sandbox",
    ),
    recordsContainNoSecrets: result.records.every(
      (record) => record.containsSecret === false,
    ),
    evidenceFingerprintsMatch:
      observation.bundleFingerprint === result.bundleFingerprint &&
      observation.recordFingerprints.length === recordFingerprints.length &&
      observation.recordFingerprints.every(
        (value, index) => value === recordFingerprints[index],
      ),
    evidenceVerificationRemainsPending: result.records.every(
      (record) => record.verificationApproved === false,
    ),
    originalReadinessRemainsBlocked:
      result.readiness.executionEligible === false &&
      result.readiness.productionEligible === false &&
      result.readiness.blockers.length > 0,
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
    auditId: `audit:${result.manifestId}`,
    manifestId: result.manifestId,
    status,
    checks,
  });
}
