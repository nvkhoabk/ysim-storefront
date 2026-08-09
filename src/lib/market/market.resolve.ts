// F07A-1A_MARKET_DOMAIN_V1

import {
  getMarketByCountry,
  getMarketById,
  getMarketByLocale,
  marketRegistry,
} from "./market.registry";
import type {
  MarketRegistry,
  MarketResolution,
  MarketResolutionInput,
} from "./market.types";

const NON_GEO_COUNTRY_CODES = new Set(["XX", "T1"]);

export function normalizeCountryCode(
  countryCode: string | null | undefined,
): string | null {
  const normalized = countryCode?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function resolveMarketWithRegistry(
  input: MarketResolutionInput,
  registry: MarketRegistry,
): MarketResolution {
  const pathMarket = getMarketByLocale(input.pathLocale, registry);
  if (pathMarket) {
    return {
      market: pathMarket,
      source: "path",
      normalizedCountryCode: normalizeCountryCode(input.countryCode),
    };
  }

  const cookieMarket = getMarketById(input.cookieValue, registry);
  if (cookieMarket) {
    return {
      market: cookieMarket,
      source: "cookie",
      normalizedCountryCode: normalizeCountryCode(input.countryCode),
    };
  }

  const normalizedCountryCode = normalizeCountryCode(input.countryCode);
  const countryMarket = getMarketByCountry(normalizedCountryCode, registry);
  if (countryMarket) {
    return {
      market: countryMarket,
      source: "country",
      normalizedCountryCode,
    };
  }

  if (
    normalizedCountryCode &&
    !NON_GEO_COUNTRY_CODES.has(normalizedCountryCode)
  ) {
    return {
      market: registry.globalFallbackMarket,
      source: "global-fallback",
      normalizedCountryCode,
    };
  }

  return {
    market: registry.defaultMarket,
    source: "default",
    normalizedCountryCode,
  };
}

export function resolveMarket(input: MarketResolutionInput): MarketResolution {
  return resolveMarketWithRegistry(input, marketRegistry);
}
