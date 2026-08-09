// F07A-1A_MARKET_DOMAIN_V1

import type { MarketConfig } from "../lib/market/market.types";

export const MARKET_COOKIE_NAME = "ysim_market";
export const MARKET_COOKIE_MAX_AGE_SECONDS = 31_536_000;

export const MARKET_CONFIGS = [
  {
    id: "vi-vn",
    locale: "vi",
    htmlLang: "vi",
    intlLocale: "vi-VN",
    currency: "VND",
    currencyMinorUnit: 0,
    countryCodes: ["VN"],
    nativeLabel: "Tiếng Việt · VND",
    englishLabel: "Vietnamese · VND",
    direction: "ltr",
    isDefault: true,
  },
  {
    id: "en-global",
    locale: "en",
    htmlLang: "en",
    intlLocale: "en-US",
    currency: "USD",
    currencyMinorUnit: 2,
    countryCodes: [],
    nativeLabel: "English · USD",
    englishLabel: "English · USD",
    direction: "ltr",
    isGlobalFallback: true,
  },
  {
    id: "lo-la",
    locale: "lo",
    htmlLang: "lo",
    intlLocale: "lo-LA",
    currency: "LAK",
    currencyMinorUnit: 0,
    countryCodes: ["LA"],
    nativeLabel: "ພາສາລາວ · LAK",
    englishLabel: "Lao · LAK",
    direction: "ltr",
  },
] as const satisfies readonly MarketConfig[];
