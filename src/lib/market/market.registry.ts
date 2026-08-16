// F07A-1A_MARKET_DOMAIN_V1

import { MARKET_CONFIGS } from "../../config/markets";
import type { MarketConfig, MarketRegistry } from "./market.types";

const MARKET_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`MARKET_CONFIG_REQUIRED:${label}`);
  }
  return normalized;
}

function normalizedMarket(config: MarketConfig): MarketConfig {
  const id = requiredText(config.id, "id").toLowerCase();
  const locale = requiredText(config.locale, `${id}.locale`);
  const htmlLang = requiredText(config.htmlLang, `${id}.htmlLang`);
  const intlLocale = requiredText(config.intlLocale, `${id}.intlLocale`);
  const currency = requiredText(
    config.currency,
    `${id}.currency`,
  ).toUpperCase();
  const countryCodes = config.countryCodes.map((countryCode) =>
    requiredText(countryCode, `${id}.countryCode`).toUpperCase(),
  );

  if (!MARKET_ID_PATTERN.test(id)) {
    throw new Error(`MARKET_CONFIG_INVALID_ID:${id}`);
  }
  if (!LOCALE_PATTERN.test(locale)) {
    throw new Error(`MARKET_CONFIG_INVALID_LOCALE:${id}:${locale}`);
  }
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error(`MARKET_CONFIG_INVALID_CURRENCY:${id}:${currency}`);
  }
  if (!Number.isInteger(config.currencyMinorUnit)) {
    throw new Error(`MARKET_CONFIG_INVALID_MINOR_UNIT:${id}`);
  }
  for (const countryCode of countryCodes) {
    if (!COUNTRY_PATTERN.test(countryCode)) {
      throw new Error(`MARKET_CONFIG_INVALID_COUNTRY:${id}:${countryCode}`);
    }
  }
  if (config.isGlobalFallback && countryCodes.length > 0) {
    throw new Error(`MARKET_CONFIG_GLOBAL_FALLBACK_HAS_COUNTRIES:${id}`);
  }
  if (
    !config.isGlobalFallback &&
    !config.isDefault &&
    countryCodes.length === 0
  ) {
    throw new Error(`MARKET_CONFIG_COUNTRY_MAPPING_REQUIRED:${id}`);
  }

  return Object.freeze({
    ...config,
    id,
    locale,
    htmlLang,
    intlLocale,
    currency,
    countryCodes: Object.freeze(countryCodes),
    nativeLabel: requiredText(config.nativeLabel, `${id}.nativeLabel`),
    englishLabel: requiredText(config.englishLabel, `${id}.englishLabel`),
  });
}

export function buildMarketRegistry(
  configs: readonly MarketConfig[],
): MarketRegistry {
  if (configs.length === 0) {
    throw new Error("MARKET_CONFIG_EMPTY");
  }

  const markets = configs.map(normalizedMarket);
  const byId = new Map<string, MarketConfig>();
  const byLocale = new Map<string, MarketConfig>();
  const byCountry = new Map<string, MarketConfig>();
  const defaults: MarketConfig[] = [];
  const globalFallbacks: MarketConfig[] = [];

  for (const market of markets) {
    if (byId.has(market.id)) {
      throw new Error(`MARKET_CONFIG_DUPLICATE_ID:${market.id}`);
    }
    if (byLocale.has(market.locale)) {
      throw new Error(`MARKET_CONFIG_DUPLICATE_LOCALE:${market.locale}`);
    }
    byId.set(market.id, market);
    byLocale.set(market.locale, market);

    for (const countryCode of market.countryCodes) {
      const existing = byCountry.get(countryCode);
      if (existing) {
        throw new Error(
          `MARKET_CONFIG_DUPLICATE_COUNTRY:${countryCode}:${existing.id}:${market.id}`,
        );
      }
      byCountry.set(countryCode, market);
    }

    if (market.isDefault) defaults.push(market);
    if (market.isGlobalFallback) globalFallbacks.push(market);
  }

  if (defaults.length !== 1) {
    throw new Error(`MARKET_CONFIG_DEFAULT_COUNT:${defaults.length}`);
  }
  if (globalFallbacks.length !== 1) {
    throw new Error(
      `MARKET_CONFIG_GLOBAL_FALLBACK_COUNT:${globalFallbacks.length}`,
    );
  }

  return Object.freeze({
    markets: Object.freeze(markets),
    byId,
    byLocale,
    byCountry,
    defaultMarket: defaults[0],
    globalFallbackMarket: globalFallbacks[0],
  });
}

export const marketRegistry = buildMarketRegistry(MARKET_CONFIGS);

export function getMarketById(
  id: string | null | undefined,
  registry: MarketRegistry = marketRegistry,
): MarketConfig | undefined {
  return id ? registry.byId.get(id.trim().toLowerCase()) : undefined;
}

export function getMarketByLocale(
  locale: string | null | undefined,
  registry: MarketRegistry = marketRegistry,
): MarketConfig | undefined {
  return locale ? registry.byLocale.get(locale.trim()) : undefined;
}

export function getMarketByCountry(
  countryCode: string | null | undefined,
  registry: MarketRegistry = marketRegistry,
): MarketConfig | undefined {
  return countryCode
    ? registry.byCountry.get(countryCode.trim().toUpperCase())
    : undefined;
}

export function isMarketId(
  value: string | null | undefined,
  registry: MarketRegistry = marketRegistry,
): boolean {
  return Boolean(getMarketById(value, registry));
}
