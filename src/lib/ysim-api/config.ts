import type {
  ApiConfig,
} from "@/lib/models/api-config";

import {
  api,
} from "./client";

let cachedConfig:
  | ApiConfig
  | null = null;

export async function getConfig(): Promise<ApiConfig> {

  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig =
    await api.getConfig();

  return cachedConfig;
}

export async function getDefaultLocale(): Promise<string> {

  const config =
    await getConfig();

  return config.defaultLocale;
}

export async function getSupportedLocales(): Promise<
  string[]
> {

  const config =
    await getConfig();

  return config.supportedLocales;
}

export async function getCurrencyForLocale(
  locale: string
): Promise<string> {

  const config =
    await getConfig();

  return (
    config.localeCurrencies[
      locale
    ] ??
    config.localeCurrencies[
      config.defaultLocale
    ]
  );
}

export async function getLocaleDefinition(
  locale: string
) {

  const config =
    await getConfig();

  return (
    config.locales.find(
      (x) =>
        x.code === locale
    ) ??
    null
  );
}
