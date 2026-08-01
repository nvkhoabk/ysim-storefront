import { createLocalizedShellBundle } from "../shell/shell.config";
import { normalizeShellLocale } from "../shell/shell.registry";
import {
  hasTrustedMarketHeaders,
  type MarketRuntimeEnvironment,
} from "../../lib/market/market.request";
import {
  MARKET_REQUEST_HEADERS,
  type StorefrontLocaleRequest,
} from "./runtime.types";

function safePathname(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value.split(/[?#]/, 1)[0] || "/";
}

export function resolveStorefrontLocaleRequest(
  requestHeaders: Pick<Headers, "get">,
  env: MarketRuntimeEnvironment = process.env,
): StorefrontLocaleRequest {
  const trusted = hasTrustedMarketHeaders(requestHeaders, env);
  const headerLocale = trusted
    ? requestHeaders.get(MARKET_REQUEST_HEADERS.locale)
    : null;
  const localized = headerLocale !== null;
  const locale = normalizeShellLocale(headerLocale);

  return {
    localized,
    publicPathname: localized
      ? safePathname(requestHeaders.get(MARKET_REQUEST_HEADERS.publicPathname))
      : "/",
    shell: createLocalizedShellBundle(locale),
  };
}
