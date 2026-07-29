// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1
// F07A_3A_BIGINT_ONLY_CONVERSION
// F07A_3A_SOURCE_VND_AUTHORITY_PRESERVED

import { convertMinorAmount, formatMoneyMinor } from "../market/money";
import { getQuoteDefinition, getQuoteMarket } from "./currency-quote.registry";
import type { CurrencyQuoteResult } from "./currency-quote.types";

export const PREVIEW_SOURCE_AMOUNT_MINOR = BigInt(169_000);
export const PREVIEW_VALID_AT = "2026-07-30T00:05:00.000Z";
export const PREVIEW_EXPIRED_AT = "2026-07-30T00:16:00.000Z";

function parseTimestamp(value: string, label: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp))
    throw new Error(`CURRENCY_QUOTE_INVALID_TIME:${label}`);
  return timestamp;
}

export function createCurrencyQuoteResult(
  localeInput: unknown,
  evaluatedAt = PREVIEW_VALID_AT,
  sourceAmountMinor = PREVIEW_SOURCE_AMOUNT_MINOR,
): CurrencyQuoteResult {
  if (sourceAmountMinor < BigInt(0))
    throw new Error("CURRENCY_QUOTE_NEGATIVE_SOURCE_AMOUNT");
  const market = getQuoteMarket(localeInput);
  const quote = getQuoteDefinition(market.locale);
  const targetAmountMinor = convertMinorAmount(
    sourceAmountMinor,
    quote.sourceMinorUnit,
    quote.targetMinorUnit,
    quote.rate,
  );
  const status =
    parseTimestamp(evaluatedAt, "evaluatedAt") <=
    parseTimestamp(quote.expiresAt, "expiresAt")
      ? "valid"
      : "expired";
  return Object.freeze({
    marketId: market.id,
    locale: market.locale,
    intlLocale: market.intlLocale,
    quote,
    sourceAmountMinor,
    targetAmountMinor,
    formattedSource: formatMoneyMinor(sourceAmountMinor, "VND", "vi-VN", 0),
    formattedTarget: formatMoneyMinor(
      targetAmountMinor,
      quote.targetCurrency,
      market.intlLocale,
      quote.targetMinorUnit,
    ),
    status,
    evaluatedAt,
  });
}

export function assertCurrencyQuoteUsable(result: CurrencyQuoteResult): void {
  if (result.status !== "valid") {
    throw new Error(`CURRENCY_QUOTE_EXPIRED:${result.quote.quoteId}`);
  }
}
