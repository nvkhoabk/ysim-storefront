// F07A-1B_MARKET_ROUTING_R3

import { readMarketCookie } from "./market.cookie";
import { resolveMarket } from "./market.resolve";
import type { MarketResolution } from "./market.types";

export const MARKET_COUNTRY_HEADER = "cf-ipcountry";
export const MARKET_TEST_COUNTRY_HEADER = "x-ysim-test-country";
export const MARKET_INTERNAL_REWRITE_HEADER = "x-ysim-market-internal-rewrite";
export const MARKET_INTERNAL_TOKEN_HEADER = "x-ysim-market-internal-token";

export interface MarketRuntimeEnvironment {
  readonly NODE_ENV?: string;
  readonly YSIM_MARKET_ROUTING_ENABLED?: string;
  readonly YSIM_MARKET_TEST_MODE?: string;
  readonly YSIM_MARKET_INTERNAL_TOKEN?: string;
}

export interface MarketRequestInput {
  readonly pathLocale?: string | null;
  readonly cookieHeader?: string | null;
  readonly headers: Headers;
  readonly env?: MarketRuntimeEnvironment;
}

function enabledFlag(value: string | null | undefined): boolean {
  return new Set(["1", "true", "yes", "on"]).has(
    value?.trim().toLowerCase() ?? "",
  );
}

export function isMarketRoutingEnabled(
  env: MarketRuntimeEnvironment = process.env,
): boolean {
  return enabledFlag(env.YSIM_MARKET_ROUTING_ENABLED);
}

export function isMarketCountryTestModeEnabled(
  env: MarketRuntimeEnvironment = process.env,
): boolean {
  return (
    env.NODE_ENV !== "production" && enabledFlag(env.YSIM_MARKET_TEST_MODE)
  );
}

export function marketInternalToken(
  env: MarketRuntimeEnvironment = process.env,
): string | null {
  const token = env.YSIM_MARKET_INTERNAL_TOKEN?.trim();
  return token && token.length >= 32 ? token : null;
}

export function hasTrustedMarketHeaders(
  headers: Pick<Headers, "get">,
  env: MarketRuntimeEnvironment = process.env,
): boolean {
  const expected = marketInternalToken(env);
  const received = headers.get(MARKET_INTERNAL_TOKEN_HEADER)?.trim();
  return expected !== null && received === expected;
}

export function isInternalMarketRewrite(
  headers: Pick<Headers, "get">,
  env: MarketRuntimeEnvironment = process.env,
): boolean {
  return (
    headers.get(MARKET_INTERNAL_REWRITE_HEADER)?.trim() === "1" &&
    hasTrustedMarketHeaders(headers, env)
  );
}

export function stripUntrustedYsimHeaders(headers: Headers): Headers {
  const sanitized = new Headers(headers);

  for (const name of [...sanitized.keys()]) {
    if (name.toLowerCase().startsWith("x-ysim-")) {
      sanitized.delete(name);
    }
  }

  return sanitized;
}

export function readCountryCodeFromHeaders(
  headers: Headers,
  env: MarketRuntimeEnvironment = process.env,
): string | null {
  if (isMarketCountryTestModeEnabled(env)) {
    const testCountry = headers.get(MARKET_TEST_COUNTRY_HEADER)?.trim();
    if (testCountry) return testCountry;
  }

  return headers.get(MARKET_COUNTRY_HEADER)?.trim() || null;
}

export function resolveMarketRequest({
  pathLocale,
  cookieHeader,
  headers,
  env = process.env,
}: MarketRequestInput): MarketResolution {
  return resolveMarket({
    pathLocale,
    cookieValue: readMarketCookie(cookieHeader),
    countryCode: readCountryCodeFromHeaders(headers, env),
  });
}

export function isSecureMarketRequest(url: string, headers: Headers): boolean {
  const forwardedProtocol = headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProtocol) return forwardedProtocol === "https";
  return new URL(url).protocol === "https:";
}
