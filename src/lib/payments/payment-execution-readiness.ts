// F07A-3E_PAYMENT_EXECUTION_READINESS_GATE_CANDIDATE_R1
// F07A_3E_REUSE_F07A_3D_PROVIDER_ASSIGNMENT
// F07A_3E_OPERATIONAL_EVIDENCE_NOT_INFERRED
// F07A_3E_ACTIVATION_ALWAYS_BLOCKED
// F07A_3E_READINESS_TAMPER_AUDIT

import {
  auditPaymentProviderAssignmentPolicy,
  createPaymentProviderAssignmentPolicy,
  validatePaymentProviderAssignmentPolicy,
} from "./payment-provider-assignment";
import type {
  PaymentExecutionGateResult,
  PaymentExecutionReadinessAudit,
  PaymentExecutionReadinessAuditChecks,
  PaymentExecutionReadinessObservation,
  PaymentExecutionReadinessResult,
  PaymentExecutionReadinessStatus,
} from "./payment-execution-readiness.types";
import type { ProviderAdapterState } from "./payment-provider-assignment.types";

const REQUIRED_GATE_KEYS = Object.freeze([
  "provider-assignment",
  "runtime-adapter",
  "credential-evidence",
  "callback-contract",
  "idempotency-evidence",
  "reconciliation-evidence",
  "manual-approval",
] as const);

function readinessStatusFor(
  adapterState: ProviderAdapterState,
): PaymentExecutionReadinessStatus {
  if (adapterState === "runtime-registered") {
    return "blocked-operational-verification";
  }
  if (adapterState === "adapter-disabled") {
    return "blocked-adapter-disabled";
  }
  return "blocked-adapter-missing";
}

function createGates(
  adapterState: ProviderAdapterState,
): readonly PaymentExecutionGateResult[] {
  const adapterGate: PaymentExecutionGateResult =
    adapterState === "runtime-registered"
      ? Object.freeze({
          key: "runtime-adapter" as const,
          required: true as const,
          status: "passed" as const,
          evidence: "runtime-provider-registered" as const,
          blockReason: null,
        })
      : adapterState === "adapter-disabled"
        ? Object.freeze({
            key: "runtime-adapter" as const,
            required: true as const,
            status: "blocked" as const,
            evidence: "adapter-disabled" as const,
            blockReason: "adapter-disabled" as const,
          })
        : Object.freeze({
            key: "runtime-adapter" as const,
            required: true as const,
            status: "blocked" as const,
            evidence: "adapter-missing" as const,
            blockReason: "adapter-missing" as const,
          });

  return Object.freeze([
    Object.freeze({
      key: "provider-assignment" as const,
      required: true as const,
      status: "passed" as const,
      evidence: "f07a-3d-assignment-matched" as const,
      blockReason: null,
    }),
    adapterGate,
    Object.freeze({
      key: "credential-evidence" as const,
      required: true as const,
      status: "not-evaluated" as const,
      evidence: "not-evaluated-in-preview" as const,
      blockReason: "operational-evidence-not-verified" as const,
    }),
    Object.freeze({
      key: "callback-contract" as const,
      required: true as const,
      status: "not-evaluated" as const,
      evidence: "not-evaluated-in-preview" as const,
      blockReason: "operational-evidence-not-verified" as const,
    }),
    Object.freeze({
      key: "idempotency-evidence" as const,
      required: true as const,
      status: "not-evaluated" as const,
      evidence: "not-evaluated-in-preview" as const,
      blockReason: "operational-evidence-not-verified" as const,
    }),
    Object.freeze({
      key: "reconciliation-evidence" as const,
      required: true as const,
      status: "not-evaluated" as const,
      evidence: "not-evaluated-in-preview" as const,
      blockReason: "operational-evidence-not-verified" as const,
    }),
    Object.freeze({
      key: "manual-approval" as const,
      required: true as const,
      status: "blocked" as const,
      evidence: "manual-approval-required" as const,
      blockReason: "manual-approval-required" as const,
    }),
  ]);
}

function defaultObservation(
  result: PaymentExecutionReadinessResult,
): PaymentExecutionReadinessObservation {
  const assignment = result.providerAssignmentPolicy;
  return Object.freeze({
    providerKey: assignment.providerAssignment.providerKey,
    adapterState: assignment.providerAssignment.adapterState,
    providerCurrency: assignment.settlementDraft.providerCurrency,
    providerAmountMinor: assignment.settlementDraft.providerAmountMinor,
    snapshotFingerprint:
      assignment.binding.lockedPresentation.snapshot.fingerprint,
    readinessStatus: result.readinessStatus,
    activationTokenCreated: false,
    providerRequestCreated: false,
    settlementInstructionCreated: false,
    registryMutationCreated: false,
    executionEligible: false,
  });
}

export function createPaymentExecutionReadiness(
  localeInput: unknown,
): PaymentExecutionReadinessResult {
  const providerAssignmentPolicy =
    createPaymentProviderAssignmentPolicy(localeInput);
  validatePaymentProviderAssignmentPolicy(providerAssignmentPolicy);
  const assignmentAudit = auditPaymentProviderAssignmentPolicy(
    providerAssignmentPolicy,
  );
  if (assignmentAudit.status !== "matched") {
    throw new Error("PAYMENT_EXECUTION_READINESS_ASSIGNMENT_AUDIT_FAILED");
  }

  const adapterState = providerAssignmentPolicy.providerAssignment.adapterState;
  const gates = createGates(adapterState);
  const blockers = Object.freeze(
    gates.filter((gate) => gate.status !== "passed"),
  );
  const readinessStatus = readinessStatusFor(adapterState);

  const result = Object.freeze({
    schemaVersion: "f07a-3e-r1" as const,
    readinessId: [
      "f07a-3e-r1",
      providerAssignmentPolicy.assignmentId,
      readinessStatus,
    ].join(":"),
    purpose: "ui-preview-only" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    providerAssignmentPolicy,
    readinessStatus,
    gates,
    blockers,
    activationDraft: Object.freeze({
      status: "blocked-preview-only" as const,
      providerKey: providerAssignmentPolicy.providerAssignment.providerKey,
      providerCurrency:
        providerAssignmentPolicy.settlementDraft.providerCurrency,
      providerAmountMinor:
        providerAssignmentPolicy.settlementDraft.providerAmountMinor,
      activationTokenCreated: false as const,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      registryMutationCreated: false as const,
      productionEligible: false as const,
      executionEligible: false as const,
    }),
  });

  validatePaymentExecutionReadiness(result);
  return result;
}

export function validatePaymentExecutionReadiness(
  result: PaymentExecutionReadinessResult,
): void {
  validatePaymentProviderAssignmentPolicy(result.providerAssignmentPolicy);
  const assignment = result.providerAssignmentPolicy;
  const draft = result.activationDraft;
  const gateKeys = result.gates.map((gate) => gate.key);

  if (
    gateKeys.length !== REQUIRED_GATE_KEYS.length ||
    new Set(gateKeys).size !== REQUIRED_GATE_KEYS.length ||
    REQUIRED_GATE_KEYS.some((key) => !gateKeys.includes(key))
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_GATE_SET_INVALID");
  }
  if (
    result.gates.some((gate) => gate.required !== true) ||
    result.blockers.length === 0
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_REQUIRED_BLOCKER_MISSING");
  }
  if (
    result.readinessStatus !==
    readinessStatusFor(assignment.providerAssignment.adapterState)
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_STATUS_MISMATCH");
  }
  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    draft.productionEligible !== false ||
    draft.executionEligible !== false
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_EXECUTION_NOT_BLOCKED");
  }
  if (
    draft.providerKey !== assignment.providerAssignment.providerKey ||
    draft.providerCurrency !== assignment.settlementDraft.providerCurrency ||
    draft.providerAmountMinor !== assignment.settlementDraft.providerAmountMinor
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_ACTIVATION_DRAFT_MISMATCH");
  }
  if (
    draft.activationTokenCreated !== false ||
    draft.providerRequestCreated !== false ||
    draft.settlementInstructionCreated !== false ||
    draft.registryMutationCreated !== false
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_ACTIVATION_ARTIFACT_CREATED");
  }
  if (
    assignment.binding.paymentDraft.status !== "unassigned" ||
    assignment.binding.paymentDraft.providerId !== null ||
    assignment.binding.paymentDraft.requestedCurrency !== null ||
    assignment.binding.paymentDraft.requestedAmountMinor !== null ||
    assignment.binding.paymentDraft.settlementInstructionCreated !== false
  ) {
    throw new Error("PAYMENT_EXECUTION_READINESS_ORIGINAL_DRAFT_MUTATED");
  }
}

export function auditPaymentExecutionReadiness(
  result: PaymentExecutionReadinessResult,
  observation: PaymentExecutionReadinessObservation = defaultObservation(
    result,
  ),
): PaymentExecutionReadinessAudit {
  validatePaymentExecutionReadiness(result);
  const assignment = result.providerAssignmentPolicy;
  const assignmentAudit = auditPaymentProviderAssignmentPolicy(assignment);
  const draft = result.activationDraft;
  const gateKeys = result.gates.map((gate) => gate.key);
  const checks: PaymentExecutionReadinessAuditChecks = Object.freeze({
    providerAssignmentAuditMatched: assignmentAudit.status === "matched",
    providerKeyMatches:
      observation.providerKey === assignment.providerAssignment.providerKey,
    adapterStateMatches:
      observation.adapterState === assignment.providerAssignment.adapterState,
    providerCurrencyMatches:
      observation.providerCurrency === draft.providerCurrency,
    providerAmountMatches:
      observation.providerAmountMinor === draft.providerAmountMinor,
    snapshotFingerprintMatches:
      observation.snapshotFingerprint ===
      assignment.binding.lockedPresentation.snapshot.fingerprint,
    readinessStatusMatches:
      observation.readinessStatus === result.readinessStatus,
    requiredGateSetMatches:
      gateKeys.length === REQUIRED_GATE_KEYS.length &&
      REQUIRED_GATE_KEYS.every((key) => gateKeys.includes(key)),
    operationalEvidenceRemainsUnverified: result.gates
      .filter((gate) =>
        [
          "credential-evidence",
          "callback-contract",
          "idempotency-evidence",
          "reconciliation-evidence",
        ].includes(gate.key),
      )
      .every(
        (gate) =>
          gate.status === "not-evaluated" &&
          gate.evidence === "not-evaluated-in-preview",
      ),
    originalPaymentDraftRemainsUnassigned:
      assignment.binding.paymentDraft.status === "unassigned" &&
      assignment.binding.paymentDraft.providerId === null &&
      assignment.binding.paymentDraft.requestedCurrency === null &&
      assignment.binding.paymentDraft.requestedAmountMinor === null &&
      assignment.binding.paymentDraft.settlementInstructionCreated === false,
    activationArtifactsNotCreated:
      observation.activationTokenCreated === false &&
      observation.providerRequestCreated === false &&
      observation.settlementInstructionCreated === false &&
      observation.registryMutationCreated === false &&
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
    auditId: `audit:${result.readinessId}`,
    readinessId: result.readinessId,
    status,
    checks,
  });
}
