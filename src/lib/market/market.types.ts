// F07A-1A_MARKET_DOMAIN_V1

export type CurrencyMinorUnit = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MarketResolutionSource =
  "path" | "cookie" | "country" | "global-fallback" | "default";

export interface MarketConfig {
  readonly id: string;
  readonly locale: string;
  readonly htmlLang: string;
  readonly intlLocale: string;
  readonly currency: string;
  readonly currencyMinorUnit: CurrencyMinorUnit;
  readonly countryCodes: readonly string[];
  readonly nativeLabel: string;
  readonly englishLabel: string;
  readonly direction: "ltr" | "rtl";
  readonly isDefault?: boolean;
  readonly isGlobalFallback?: boolean;
}

export interface MarketRegistry {
  readonly markets: readonly MarketConfig[];
  readonly byId: ReadonlyMap<string, MarketConfig>;
  readonly byLocale: ReadonlyMap<string, MarketConfig>;
  readonly byCountry: ReadonlyMap<string, MarketConfig>;
  readonly defaultMarket: MarketConfig;
  readonly globalFallbackMarket: MarketConfig;
}

export interface MarketResolutionInput {
  readonly pathLocale?: string | null;
  readonly cookieValue?: string | null;
  readonly countryCode?: string | null;
}

export interface MarketResolution {
  readonly market: MarketConfig;
  readonly source: MarketResolutionSource;
  readonly normalizedCountryCode: string | null;
}

export interface DecimalRate {
  /** Target major currency units per one source major currency unit. */
  readonly numerator: bigint;
  readonly denominator: bigint;
  readonly source: string;
  readonly version: string;
  readonly effectiveAt: string;
}
