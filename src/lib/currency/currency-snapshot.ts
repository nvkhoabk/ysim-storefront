// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1
// F07A_3A_IMMUTABLE_DISPLAY_SNAPSHOT
// F07A_3A_NOT_SETTLEMENT_INSTRUCTION

import type {
  CurrencyQuoteResult,
  PriceDisplaySnapshot,
} from "./currency-quote.types";

export function createPriceDisplaySnapshot(
  result: CurrencyQuoteResult,
): PriceDisplaySnapshot {
  const fingerprint = [
    "f07a-3a-r1",
    result.quote.quoteId,
    result.quote.sourceCurrency,
    result.quote.targetCurrency,
    result.sourceAmountMinor.toString(),
    result.targetAmountMinor.toString(),
    result.quote.rate.numerator.toString(),
    result.quote.rate.denominator.toString(),
    result.quote.rate.version,
    result.quote.expiresAt,
  ].join(":");
  return Object.freeze({
    schemaVersion: "f07a-3a-r1",
    fingerprint,
    quoteId: result.quote.quoteId,
    providerId: result.quote.providerId,
    sourceCurrency: result.quote.sourceCurrency,
    targetCurrency: result.quote.targetCurrency,
    sourceAmountMinor: result.sourceAmountMinor,
    targetAmountMinor: result.targetAmountMinor,
    rateNumerator: result.quote.rate.numerator,
    rateDenominator: result.quote.rate.denominator,
    rateVersion: result.quote.rate.version,
    rateEffectiveAt: result.quote.rate.effectiveAt,
    quotedAt: result.quote.quotedAt,
    expiresAt: result.quote.expiresAt,
    capturedAt: result.evaluatedAt,
    roundingMode: "half-away-from-zero",
    purpose: "ui-preview-only",
  });
}

export function validatePriceDisplaySnapshot(
  snapshot: PriceDisplaySnapshot,
): void {
  if (snapshot.sourceCurrency !== "VND")
    throw new Error("PRICE_SNAPSHOT_SOURCE_NOT_VND");
  if (snapshot.providerId !== "fixture-only")
    throw new Error("PRICE_SNAPSHOT_PROVIDER_INVALID");
  if (snapshot.purpose !== "ui-preview-only")
    throw new Error("PRICE_SNAPSHOT_PURPOSE_INVALID");
  if (
    snapshot.rateNumerator <= BigInt(0) ||
    snapshot.rateDenominator <= BigInt(0)
  ) {
    throw new Error("PRICE_SNAPSHOT_RATE_INVALID");
  }
  if (!snapshot.fingerprint.includes(snapshot.quoteId)) {
    throw new Error("PRICE_SNAPSHOT_FINGERPRINT_INVALID");
  }
}
