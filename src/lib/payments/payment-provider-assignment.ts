// F07A-3D_PAYMENT_PROVIDER_ASSIGNMENT_POLICY_CANDIDATE_R1
// F07A_3D_REUSE_F07A_3C_IMMUTABLE_BINDING
// F07A_3D_MARKET_CURRENCY_PROVIDER_POLICY
// F07A_3D_EXECUTION_ALWAYS_DISABLED
// F07A_3D_RUNTIME_ADAPTER_GAP_AUDIT

import { createCurrencyTransactionBinding } from "../currency/currency-transaction-binding";
import { validateCurrencyTransactionBinding } from "../currency/currency-transaction-binding";
import type { SupportedQuoteCurrency } from "../currency/currency-quote.types";
import { getMarketByLocale, marketRegistry } from "../market/market.registry";
import type {
  PaymentProviderAssignmentAudit,
  PaymentProviderAssignmentAuditChecks,
  PaymentProviderAssignmentObservation,
  PaymentProviderAssignmentPolicyResult,
  PaymentProviderPolicyRule,
} from "./payment-provider-assignment.types";

export const PAYMENT_PROVIDER_POLICY_RULES = Object.freeze([
  Object.freeze({
    marketId: "vi-vn",
    locale: "vi",
    currency: "VND",
    providerKey: "gpay_qr",
    providerLabel: "GPay",
    rail: "qr",
    runtimeProviderId: "gpay_gateway_qr",
    adapterState: "runtime-registered",
    compatibility: "compatible-preview",
    executionBlockReason: "preview-only",
  }),
  Object.freeze({
    marketId: "en-global",
    locale: "en",
    currency: "USD",
    providerKey: "onepay_international_card",
    providerLabel: "OnePay",
    rail: "international-card",
    runtimeProviderId: null,
    adapterState: "adapter-disabled",
    compatibility: "blocked-adapter-disabled",
    executionBlockReason: "adapter-disabled",
  }),
  Object.freeze({
    marketId: "lo-la",
    locale: "lo",
    currency: "LAK",
    providerKey: "umoney_wallet",
    providerLabel: "uMoney",
    rail: "wallet",
    runtimeProviderId: null,
    adapterState: "adapter-missing",
    compatibility: "blocked-adapter-missing",
    executionBlockReason: "adapter-missing",
  }),
] as const satisfies readonly PaymentProviderPolicyRule[]);

function supportedCurrency(value: string): SupportedQuoteCurrency {
  if (value === "VND" || value === "USD" || value === "LAK") {
    return value;
  }
  throw new Error(`PAYMENT_PROVIDER_POLICY_UNSUPPORTED_CURRENCY:${value}`);
}

function resolvePolicyRule(marketId: string): PaymentProviderPolicyRule {
  const rule = PAYMENT_PROVIDER_POLICY_RULES.find(
    (candidate) => candidate.marketId === marketId,
  );
  if (!rule) {
    throw new Error(`PAYMENT_PROVIDER_POLICY_RULE_MISSING:${marketId}`);
  }
  return rule;
}

function defaultObservation(
  result: PaymentProviderAssignmentPolicyResult,
): PaymentProviderAssignmentObservation {
  return Object.freeze({
    marketId: result.marketId,
    providerKey: result.providerAssignment.providerKey,
    runtimeProviderId: result.providerAssignment.runtimeProviderId,
    providerCurrency: result.settlementDraft.providerCurrency,
    providerAmountMinor: result.settlementDraft.providerAmountMinor,
    snapshotFingerprint: result.binding.lockedPresentation.snapshot.fingerprint,
    adapterState: result.providerAssignment.adapterState,
    executionEligible: false,
  });
}

export function createPaymentProviderAssignmentPolicy(
  localeInput: unknown,
): PaymentProviderAssignmentPolicyResult {
  const binding = createCurrencyTransactionBinding(localeInput);
  validateCurrencyTransactionBinding(binding);

  const requestedLocale =
    typeof localeInput === "string" ? localeInput.trim() : "";
  const market =
    getMarketByLocale(requestedLocale) ?? marketRegistry.defaultMarket;
  const marketCurrency = supportedCurrency(market.currency);
  const rule = resolvePolicyRule(market.id);

  if (binding.presentedCurrency !== marketCurrency) {
    throw new Error("PAYMENT_PROVIDER_POLICY_BINDING_CURRENCY_MISMATCH");
  }
  if (rule.locale !== market.locale || rule.currency !== marketCurrency) {
    throw new Error("PAYMENT_PROVIDER_POLICY_MARKET_RULE_MISMATCH");
  }

  const result = Object.freeze({
    schemaVersion: "f07a-3d-r1" as const,
    assignmentId: [
      "f07a-3d-r1",
      market.id,
      rule.providerKey,
      binding.bindingId,
    ].join(":"),
    purpose: "ui-preview-only" as const,
    productionEligible: false as const,
    executionEligible: false as const,
    marketId: rule.marketId,
    locale: rule.locale,
    marketCurrency,
    binding,
    policyRule: rule,
    providerAssignment: Object.freeze({
      status: "assigned-preview" as const,
      providerKey: rule.providerKey,
      providerLabel: rule.providerLabel,
      rail: rule.rail,
      runtimeProviderId: rule.runtimeProviderId,
      adapterState: rule.adapterState,
      compatibility: rule.compatibility,
      requestedCurrency: binding.presentedCurrency,
      requestedAmountMinor: binding.lockedPresentation.targetAmountMinor,
      executionEligible: false as const,
    }),
    settlementDraft: Object.freeze({
      status: "blocked-preview-only" as const,
      providerCurrency: binding.presentedCurrency,
      providerAmountMinor: binding.lockedPresentation.targetAmountMinor,
      providerRequestCreated: false as const,
      settlementInstructionCreated: false as const,
      blockReason: rule.executionBlockReason,
    }),
  });

  validatePaymentProviderAssignmentPolicy(result);
  return result;
}

export function validatePaymentProviderAssignmentPolicy(
  result: PaymentProviderAssignmentPolicyResult,
): void {
  validateCurrencyTransactionBinding(result.binding);
  const assignment = result.providerAssignment;
  const draft = result.settlementDraft;
  const binding = result.binding;

  if (
    result.productionEligible !== false ||
    result.executionEligible !== false ||
    assignment.executionEligible !== false
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_EXECUTION_NOT_BLOCKED");
  }
  if (
    binding.presentedCurrency !== result.marketCurrency ||
    assignment.requestedCurrency !== binding.presentedCurrency ||
    draft.providerCurrency !== binding.presentedCurrency
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_CURRENCY_MISMATCH");
  }
  if (
    assignment.requestedAmountMinor !==
      binding.lockedPresentation.targetAmountMinor ||
    draft.providerAmountMinor !== binding.lockedPresentation.targetAmountMinor
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_AMOUNT_MISMATCH");
  }
  if (
    binding.paymentDraft.status !== "unassigned" ||
    binding.paymentDraft.providerId !== null ||
    binding.paymentDraft.requestedCurrency !== null ||
    binding.paymentDraft.requestedAmountMinor !== null ||
    binding.paymentDraft.settlementInstructionCreated !== false
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_ORIGINAL_DRAFT_MUTATED");
  }
  if (
    draft.providerRequestCreated !== false ||
    draft.settlementInstructionCreated !== false
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_SETTLEMENT_CREATED");
  }
  if (
    assignment.adapterState === "runtime-registered" &&
    assignment.runtimeProviderId === null
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_RUNTIME_ID_REQUIRED");
  }
  if (
    assignment.adapterState !== "runtime-registered" &&
    assignment.runtimeProviderId !== null
  ) {
    throw new Error("PAYMENT_PROVIDER_POLICY_RUNTIME_ID_FORBIDDEN");
  }
}

export function auditPaymentProviderAssignmentPolicy(
  result: PaymentProviderAssignmentPolicyResult,
  observation: PaymentProviderAssignmentObservation = defaultObservation(
    result,
  ),
): PaymentProviderAssignmentAudit {
  validatePaymentProviderAssignmentPolicy(result);
  const assignment = result.providerAssignment;
  const draft = result.settlementDraft;
  const binding = result.binding;
  const checks: PaymentProviderAssignmentAuditChecks = Object.freeze({
    marketRuleMatches:
      observation.marketId === result.marketId &&
      result.policyRule.marketId === result.marketId,
    bindingCurrencyMatches: binding.presentedCurrency === result.marketCurrency,
    providerKeyMatches: observation.providerKey === assignment.providerKey,
    runtimeProviderMatches:
      observation.runtimeProviderId === assignment.runtimeProviderId,
    providerCurrencyMatches:
      observation.providerCurrency === draft.providerCurrency,
    providerAmountMatches:
      observation.providerAmountMinor === draft.providerAmountMinor,
    snapshotFingerprintMatches:
      observation.snapshotFingerprint ===
      binding.lockedPresentation.snapshot.fingerprint,
    adapterStateMatches: observation.adapterState === assignment.adapterState,
    originalPaymentDraftRemainsUnassigned:
      binding.paymentDraft.status === "unassigned" &&
      binding.paymentDraft.providerId === null &&
      binding.paymentDraft.requestedCurrency === null &&
      binding.paymentDraft.requestedAmountMinor === null &&
      binding.paymentDraft.settlementInstructionCreated === false,
    settlementInstructionNotCreated:
      draft.settlementInstructionCreated === false,
    providerRequestNotCreated: draft.providerRequestCreated === false,
    productionAndExecutionBlocked:
      observation.executionEligible === false &&
      result.productionEligible === false &&
      result.executionEligible === false &&
      assignment.executionEligible === false,
  });
  const status = Object.values(checks).every(Boolean) ? "matched" : "mismatch";
  return Object.freeze({
    auditId: `audit:${result.assignmentId}`,
    assignmentId: result.assignmentId,
    status,
    checks,
  });
}
