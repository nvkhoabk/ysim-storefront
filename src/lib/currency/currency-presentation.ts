// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1
// F07A_3B_REUSE_F07A_3A_QUOTE_AND_SNAPSHOT
// F07A_3B_NO_DUPLICATE_RATE_OR_CONVERSION_LOGIC
// F07A_3B_NOT_SETTLEMENT_OR_PAYMENT_INSTRUCTION

import {
  assertCurrencyQuoteUsable,
  createCurrencyQuoteResult,
} from "./currency-quote";
import {
  createPriceDisplaySnapshot,
  validatePriceDisplaySnapshot,
} from "./currency-snapshot";
import type {
  CurrencyPresentationContext,
  CurrencyPresentationModel,
  CurrencyPresentationRole,
} from "./currency-presentation.types";

const CONTEXTS: readonly CurrencyPresentationContext[] = [
  "home",
  "listing",
  "detail",
  "transaction",
];

export function normalizeCurrencyPresentationContext(
  value: unknown,
): CurrencyPresentationContext {
  return typeof value === "string" &&
    CONTEXTS.includes(value as CurrencyPresentationContext)
    ? (value as CurrencyPresentationContext)
    : "home";
}

function roleForContext(
  context: CurrencyPresentationContext,
): CurrencyPresentationRole {
  return context === "transaction" ? "checkout-preview" : "indicative-display";
}

export function createCurrencyPresentationModel(
  localeInput: unknown,
  contextInput: unknown,
): CurrencyPresentationModel {
  const context = normalizeCurrencyPresentationContext(contextInput);
  const quoteResult = createCurrencyQuoteResult(localeInput);
  assertCurrencyQuoteUsable(quoteResult);
  const snapshot = createPriceDisplaySnapshot(quoteResult);
  validatePriceDisplaySnapshot(snapshot);

  if (snapshot.targetAmountMinor !== quoteResult.targetAmountMinor) {
    throw new Error("CURRENCY_PRESENTATION_SNAPSHOT_AMOUNT_MISMATCH");
  }
  if (snapshot.targetCurrency !== quoteResult.quote.targetCurrency) {
    throw new Error("CURRENCY_PRESENTATION_SNAPSHOT_CURRENCY_MISMATCH");
  }

  return Object.freeze({
    presentationId: [
      "f07a-3b-r1",
      context,
      quoteResult.locale,
      snapshot.fingerprint,
    ].join(":"),
    context,
    role: roleForContext(context),
    productionEligible: false,
    sourceCurrency: "VND",
    targetCurrency: quoteResult.quote.targetCurrency,
    sourceAmountMinor: quoteResult.sourceAmountMinor,
    targetAmountMinor: quoteResult.targetAmountMinor,
    formattedSource: quoteResult.formattedSource,
    formattedTarget: quoteResult.formattedTarget,
    quoteId: quoteResult.quote.quoteId,
    quoteStatus: quoteResult.status,
    snapshot,
  });
}
