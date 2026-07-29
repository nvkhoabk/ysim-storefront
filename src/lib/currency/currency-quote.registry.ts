// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1
// F07A_3A_FIXTURE_RATES_ONLY
// F07A_3A_NO_LIVE_FX_PROVIDER

import { MARKET_CONFIGS } from "../../config/markets";
import { normalizeShellLocale } from "../../i18n/shell/shell.registry";
import type { ShellLocale } from "../../i18n/shell/shell.types";
import type { MarketConfig } from "../market/market.types";
import type {
  CurrencyQuoteDefinition,
  SupportedQuoteCurrency,
} from "./currency-quote.types";

const QUOTED_AT = "2026-07-30T00:00:00.000Z";
const EXPIRES_AT = "2026-07-30T00:15:00.000Z";

export const CURRENCY_QUOTE_DEFINITIONS: Readonly<
  Record<SupportedQuoteCurrency, CurrencyQuoteDefinition>
> = {
  VND: {
    quoteId: "fixture-vnd-vnd-f07a-3a-r1",
    providerId: "fixture-only",
    purpose: "ui-preview-only",
    sourceCurrency: "VND",
    targetCurrency: "VND",
    sourceMinorUnit: 0,
    targetMinorUnit: 0,
    rate: {
      numerator: BigInt(1),
      denominator: BigInt(1),
      source: "ysim-fixture-rate",
      version: "f07a-3a-r1-vnd",
      effectiveAt: QUOTED_AT,
    },
    quotedAt: QUOTED_AT,
    expiresAt: EXPIRES_AT,
  },
  USD: {
    quoteId: "fixture-vnd-usd-f07a-3a-r1",
    providerId: "fixture-only",
    purpose: "ui-preview-only",
    sourceCurrency: "VND",
    targetCurrency: "USD",
    sourceMinorUnit: 0,
    targetMinorUnit: 2,
    rate: {
      numerator: BigInt(1),
      denominator: BigInt(25_000),
      source: "ysim-fixture-rate",
      version: "f07a-3a-r1-usd",
      effectiveAt: QUOTED_AT,
    },
    quotedAt: QUOTED_AT,
    expiresAt: EXPIRES_AT,
  },
  LAK: {
    quoteId: "fixture-vnd-lak-f07a-3a-r1",
    providerId: "fixture-only",
    purpose: "ui-preview-only",
    sourceCurrency: "VND",
    targetCurrency: "LAK",
    sourceMinorUnit: 0,
    targetMinorUnit: 0,
    rate: {
      numerator: BigInt(43),
      denominator: BigInt(50),
      source: "ysim-fixture-rate",
      version: "f07a-3a-r1-lak",
      effectiveAt: QUOTED_AT,
    },
    quotedAt: QUOTED_AT,
    expiresAt: EXPIRES_AT,
  },
};

function isSupportedCurrency(value: string): value is SupportedQuoteCurrency {
  return value === "VND" || value === "USD" || value === "LAK";
}

export function getQuoteMarket(localeInput: unknown): MarketConfig & {
  readonly locale: ShellLocale;
  readonly currency: SupportedQuoteCurrency;
  readonly currencyMinorUnit: 0 | 2;
} {
  const locale = normalizeShellLocale(localeInput);
  const market = MARKET_CONFIGS.find(
    (candidate) => candidate.locale === locale,
  );
  if (!market) throw new Error(`CURRENCY_QUOTE_MARKET_NOT_FOUND:${locale}`);
  if (!isSupportedCurrency(market.currency)) {
    throw new Error(`CURRENCY_QUOTE_UNSUPPORTED_CURRENCY:${market.currency}`);
  }
  const minorUnitLabel = String(market.currencyMinorUnit);
  if (market.currencyMinorUnit !== 0 && market.currencyMinorUnit !== 2) {
    throw new Error(`CURRENCY_QUOTE_UNSUPPORTED_MINOR_UNIT:${minorUnitLabel}`);
  }
  return market;
}

export function getQuoteDefinition(
  localeInput: unknown,
): CurrencyQuoteDefinition {
  const market = getQuoteMarket(localeInput);
  return CURRENCY_QUOTE_DEFINITIONS[market.currency];
}
