// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

import type { DecimalRate } from "../market/market.types";

export type SupportedQuoteCurrency = "VND" | "USD" | "LAK";
export type CurrencyQuoteView = "quote" | "rounding" | "snapshot" | "expired";
export type QuoteLifecycleStatus = "valid" | "expired";
export type QuotePurpose = "ui-preview-only";
export type QuoteProviderId = "fixture-only";

export interface CurrencyQuoteDefinition {
  readonly quoteId: string;
  readonly providerId: QuoteProviderId;
  readonly purpose: QuotePurpose;
  readonly sourceCurrency: "VND";
  readonly targetCurrency: SupportedQuoteCurrency;
  readonly sourceMinorUnit: 0;
  readonly targetMinorUnit: 0 | 2;
  readonly rate: DecimalRate;
  readonly quotedAt: string;
  readonly expiresAt: string;
}

export interface CurrencyQuoteResult {
  readonly marketId: string;
  readonly locale: "vi" | "en" | "lo";
  readonly intlLocale: string;
  readonly quote: CurrencyQuoteDefinition;
  readonly sourceAmountMinor: bigint;
  readonly targetAmountMinor: bigint;
  readonly formattedSource: string;
  readonly formattedTarget: string;
  readonly status: QuoteLifecycleStatus;
  readonly evaluatedAt: string;
}

export interface PriceDisplaySnapshot {
  readonly schemaVersion: "f07a-3a-r1";
  readonly fingerprint: string;
  readonly quoteId: string;
  readonly providerId: QuoteProviderId;
  readonly sourceCurrency: "VND";
  readonly targetCurrency: SupportedQuoteCurrency;
  readonly sourceAmountMinor: bigint;
  readonly targetAmountMinor: bigint;
  readonly rateNumerator: bigint;
  readonly rateDenominator: bigint;
  readonly rateVersion: string;
  readonly rateEffectiveAt: string;
  readonly quotedAt: string;
  readonly expiresAt: string;
  readonly capturedAt: string;
  readonly roundingMode: "half-away-from-zero";
  readonly purpose: QuotePurpose;
}
