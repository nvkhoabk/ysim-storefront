// F07A-1A_MARKET_DOMAIN_V1

import {
  MARKET_COOKIE_MAX_AGE_SECONDS,
  MARKET_COOKIE_NAME,
} from "../../config/markets";
import { getMarketById, marketRegistry } from "./market.registry";
import type { MarketRegistry } from "./market.types";

export interface MarketCookieOptions {
  readonly secure?: boolean;
  readonly maxAgeSeconds?: number;
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookieHeader(
  cookieHeader: string | null | undefined,
): ReadonlyMap<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex < 1) continue;
    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (name) cookies.set(name, decodeCookieValue(value));
  }

  return cookies;
}

export function readMarketCookie(
  cookieHeader: string | null | undefined,
  registry: MarketRegistry = marketRegistry,
): string | null {
  const value = parseCookieHeader(cookieHeader).get(MARKET_COOKIE_NAME);
  return getMarketById(value, registry)?.id ?? null;
}

export function serializeMarketCookie(
  marketId: string,
  options: MarketCookieOptions = {},
  registry: MarketRegistry = marketRegistry,
): string {
  const market = getMarketById(marketId, registry);
  if (!market) {
    throw new Error(`MARKET_COOKIE_INVALID_MARKET:${marketId}`);
  }

  const maxAge = options.maxAgeSeconds ?? MARKET_COOKIE_MAX_AGE_SECONDS;
  if (!Number.isInteger(maxAge) || maxAge <= 0) {
    throw new Error(`MARKET_COOKIE_INVALID_MAX_AGE:${maxAge}`);
  }

  const parts = [
    `${MARKET_COOKIE_NAME}=${encodeURIComponent(market.id)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearMarketCookie(secure = false): string {
  const parts = [
    `${MARKET_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
