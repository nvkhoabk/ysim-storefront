// F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1
// F07A_3C_REUSE_F07A_3B_TRANSACTION_PRESENTATION
// F07A_3C_NO_PROVIDER_OR_SETTLEMENT_ASSIGNMENT
// F07A_3C_IMMUTABLE_CHECKOUT_ORDER_BINDING

import { createCurrencyPresentationModel } from "./currency-presentation";
import type {
  CurrencyBindingAudit,
  CurrencyBindingAuditChecks,
  CurrencyBindingObservation,
  CurrencyTransactionBinding,
} from "./currency-transaction-binding.types";

export const PREVIEW_BINDING_LOCKED_AT = "2026-07-30T00:06:00.000Z";

function defaultObservation(
  binding: CurrencyTransactionBinding,
): CurrencyBindingObservation {
  const presentation = binding.lockedPresentation;
  return Object.freeze({
    quoteId: presentation.quoteId,
    presentedCurrency: presentation.targetCurrency,
    presentedAmountMinor: presentation.targetAmountMinor,
    snapshotFingerprint: presentation.snapshot.fingerprint,
    productionEligible: false,
  });
}

export function createCurrencyTransactionBinding(
  localeInput: unknown,
): CurrencyTransactionBinding {
  const presentation = createCurrencyPresentationModel(
    localeInput,
    "transaction",
  );
  if (presentation.context !== "transaction") {
    throw new Error("CURRENCY_BINDING_CONTEXT_INVALID");
  }
  if (presentation.role !== "checkout-preview") {
    throw new Error("CURRENCY_BINDING_ROLE_INVALID");
  }
  if (presentation.productionEligible !== false) {
    throw new Error("CURRENCY_BINDING_PRODUCTION_ELIGIBILITY_INVALID");
  }
  if (presentation.quoteStatus !== "valid") {
    throw new Error("CURRENCY_BINDING_QUOTE_NOT_VALID");
  }

  const bindingId = [
    "f07a-3c-r1",
    presentation.targetCurrency,
    presentation.quoteId,
    presentation.snapshot.fingerprint,
  ].join(":");

  const binding = Object.freeze({
    schemaVersion: "f07a-3c-r1" as const,
    bindingId,
    purpose: "ui-preview-only" as const,
    productionEligible: false as const,
    sourceCurrency: "VND" as const,
    presentedCurrency: presentation.targetCurrency,
    lockedPresentation: presentation,
    checkoutLock: Object.freeze({
      status: "preview-locked" as const,
      lockedAt: PREVIEW_BINDING_LOCKED_AT,
      immutable: true as const,
    }),
    paymentDraft: Object.freeze({
      status: "unassigned" as const,
      providerId: null,
      requestedCurrency: null,
      requestedAmountMinor: null,
      settlementInstructionCreated: false as const,
    }),
    orderRecord: Object.freeze({
      recordId: `order-preview:${bindingId}`,
      orderCode: "YSIM-F07A-3C-PREVIEW" as const,
      amountSource: "locked-presentation-snapshot" as const,
      immutable: true as const,
      productionEligible: false as const,
    }),
  });

  validateCurrencyTransactionBinding(binding);
  return binding;
}

export function validateCurrencyTransactionBinding(
  binding: CurrencyTransactionBinding,
): void {
  const presentation = binding.lockedPresentation;
  if (binding.sourceCurrency !== "VND") {
    throw new Error("CURRENCY_BINDING_SOURCE_NOT_VND");
  }
  if (presentation.sourceCurrency !== binding.sourceCurrency) {
    throw new Error("CURRENCY_BINDING_SOURCE_CURRENCY_MISMATCH");
  }
  if (presentation.targetCurrency !== binding.presentedCurrency) {
    throw new Error("CURRENCY_BINDING_PRESENTED_CURRENCY_MISMATCH");
  }
  if (presentation.snapshot.quoteId !== presentation.quoteId) {
    throw new Error("CURRENCY_BINDING_QUOTE_ID_MISMATCH");
  }
  if (
    presentation.snapshot.targetAmountMinor !== presentation.targetAmountMinor
  ) {
    throw new Error("CURRENCY_BINDING_PRESENTED_AMOUNT_MISMATCH");
  }
  if (presentation.snapshot.targetCurrency !== presentation.targetCurrency) {
    throw new Error("CURRENCY_BINDING_SNAPSHOT_CURRENCY_MISMATCH");
  }
  if (
    binding.paymentDraft.providerId !== null ||
    binding.paymentDraft.requestedCurrency !== null ||
    binding.paymentDraft.requestedAmountMinor !== null ||
    binding.paymentDraft.settlementInstructionCreated !== false
  ) {
    throw new Error("CURRENCY_BINDING_PAYMENT_DRAFT_ASSIGNED");
  }
  if (
    binding.checkoutLock.immutable !== true ||
    binding.orderRecord.immutable !== true ||
    binding.orderRecord.productionEligible !== false
  ) {
    throw new Error("CURRENCY_BINDING_IMMUTABILITY_INVALID");
  }
}

export function auditCurrencyTransactionBinding(
  binding: CurrencyTransactionBinding,
  observation: CurrencyBindingObservation = defaultObservation(binding),
): CurrencyBindingAudit {
  validateCurrencyTransactionBinding(binding);
  const presentation = binding.lockedPresentation;
  const checks: CurrencyBindingAuditChecks = Object.freeze({
    sourceCurrencyMatches:
      binding.sourceCurrency === "VND" &&
      presentation.sourceCurrency === binding.sourceCurrency,
    quoteIdMatches: observation.quoteId === presentation.quoteId,
    presentedCurrencyMatches:
      observation.presentedCurrency === presentation.targetCurrency,
    presentedAmountMatches:
      observation.presentedAmountMinor === presentation.targetAmountMinor,
    snapshotFingerprintMatches:
      observation.snapshotFingerprint === presentation.snapshot.fingerprint,
    productionEligibilityMatches:
      observation.productionEligible === false &&
      binding.productionEligible === false,
    paymentDraftRemainsUnassigned:
      binding.paymentDraft.status === "unassigned" &&
      binding.paymentDraft.providerId === null &&
      binding.paymentDraft.requestedCurrency === null &&
      binding.paymentDraft.requestedAmountMinor === null &&
      binding.paymentDraft.settlementInstructionCreated === false,
  });
  const status = Object.values(checks).every(Boolean) ? "matched" : "mismatch";
  return Object.freeze({
    auditId: `audit:${binding.bindingId}`,
    bindingId: binding.bindingId,
    status,
    checks,
  });
}
