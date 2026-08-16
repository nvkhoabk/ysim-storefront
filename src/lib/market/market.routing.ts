// F07A-1B_MARKET_ROUTING_V1

import { getMarketById, getMarketByLocale } from "./market.registry";
import { resolveMarket } from "./market.resolve";
import type { MarketConfig, MarketResolutionSource } from "./market.types";

const BYPASS_PREFIXES = ["/api", "/_next", "/ui-preview", "/.well-known"];
const BYPASS_EXACT_PATHS = new Set([
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/robots.txt",
  "/sitemap.xml",
]);
const STATIC_EXTENSION_PATTERN =
  /\.(?:avif|css|eot|gif|ico|jpe?g|js|json|map|mjs|otf|pdf|png|svg|ttf|txt|webmanifest|webp|woff2?|xml|zip)$/i;

export type MarketRouteDecision =
  | {
      readonly action: "next";
      readonly reason: "disabled" | "bypass" | "localized-bypass";
    }
  | {
      readonly action: "redirect";
      readonly location: string;
      readonly market: MarketConfig;
      readonly source: MarketResolutionSource;
    }
  | {
      readonly action: "rewrite";
      readonly destination: string;
      readonly market: MarketConfig;
      readonly source: "path";
    };

export interface MarketRouteInput {
  readonly enabled: boolean;
  readonly pathname: string;
  readonly search?: string | null;
  readonly cookieValue?: string | null;
  readonly countryCode?: string | null;
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") return "/";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function normalizeSearch(search: string | null | undefined): string {
  if (!search) return "";
  return search.startsWith("?") ? search : `?${search}`;
}

export function isMarketRoutingBypassPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (BYPASS_EXACT_PATHS.has(normalized)) return true;
  if (STATIC_EXTENSION_PATTERN.test(normalized)) return true;
  return BYPASS_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function extractMarketLocale(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  const firstSegment = normalized.split("/")[1] ?? "";
  return getMarketByLocale(firstSegment)?.locale ?? null;
}

export function stripMarketLocale(pathname: string): {
  readonly locale: string | null;
  readonly pathname: string;
} {
  const normalized = normalizePathname(pathname);
  const locale = extractMarketLocale(normalized);
  if (!locale) return { locale: null, pathname: normalized };

  const prefix = `/${locale}`;
  const stripped = normalized.slice(prefix.length);
  return { locale, pathname: stripped || "/" };
}

export function localizePathname(locale: string, pathname: string): string {
  const market = getMarketByLocale(locale);
  if (!market) throw new Error(`MARKET_ROUTING_INVALID_LOCALE:${locale}`);

  const stripped = stripMarketLocale(pathname).pathname;
  return stripped === "/"
    ? `/${market.locale}`
    : `/${market.locale}${stripped}`;
}

export function sanitizeMarketReturnPath(
  value: string | null | undefined,
): string {
  const candidate = value?.trim() || "/";
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return "/";
  }

  const base = new URL("https://ysim.invalid");
  const parsed = new URL(candidate, base);
  if (parsed.origin !== base.origin) return "/";
  return `${parsed.pathname}${parsed.search}`;
}

export function marketSelectionRedirectPath(
  marketId: string,
  returnPath?: string | null,
): string {
  const market = getMarketById(marketId);
  if (!market) throw new Error(`MARKET_ROUTING_INVALID_MARKET:${marketId}`);

  const safePath = sanitizeMarketReturnPath(returnPath);
  const parsed = new URL(safePath, "https://ysim.invalid");
  return `${localizePathname(market.locale, parsed.pathname)}${parsed.search}`;
}

export function decideMarketRouting({
  enabled,
  pathname,
  search,
  cookieValue,
  countryCode,
}: MarketRouteInput): MarketRouteDecision {
  if (!enabled) return { action: "next", reason: "disabled" };

  const normalizedPathname = normalizePathname(pathname);
  if (isMarketRoutingBypassPath(normalizedPathname)) {
    return { action: "next", reason: "bypass" };
  }

  const localized = stripMarketLocale(normalizedPathname);
  const normalizedSearch = normalizeSearch(search);

  if (localized.locale) {
    if (isMarketRoutingBypassPath(localized.pathname)) {
      return { action: "next", reason: "localized-bypass" };
    }

    const resolution = resolveMarket({
      pathLocale: localized.locale,
      cookieValue,
      countryCode,
    });

    return {
      action: "rewrite",
      destination: `${localized.pathname}${normalizedSearch}`,
      market: resolution.market,
      source: "path",
    };
  }

  const resolution = resolveMarket({ cookieValue, countryCode });
  return {
    action: "redirect",
    location: `${localizePathname(resolution.market.locale, normalizedPathname)}${normalizedSearch}`,
    market: resolution.market,
    source: resolution.source,
  };
}
