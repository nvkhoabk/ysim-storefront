import type {
  CurrencyCode,
  CurrencyDefinition,
  LocaleCode,
} from "./common";

export interface LocaleDefinition {
  code: LocaleCode;
  name: string;
  nativeName: string;
  currency: CurrencyCode;
  fallbacks: LocaleCode[];
}

export interface ApiConfig {
  apiVersion: string;

  pluginVersion: string;

  supportedLocales: LocaleCode[];

  defaultLocale: LocaleCode;

  skuDefaultLocale: LocaleCode;

  skuLocaleSeparator: string;

  fallbacks: Record<
    LocaleCode,
    LocaleCode[]
  >;

  locales: LocaleDefinition[];

  supportedCurrencies: CurrencyCode[];

  localeCurrencies: Record<
    LocaleCode,
    CurrencyCode
  >;

  currencies: Record<
    CurrencyCode,
    CurrencyDefinition
  >;

  routes: {
    config: string;
    categories: string;
    destinations: string;
  };
}
