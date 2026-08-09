// F07A-2C-1_LOCALIZED_HOME_CANDIDATE_R1

import { normalizeShellLocale } from "@/i18n/shell/shell.registry";
import { homeMessagesEn } from "./messages/en";
import { homeMessagesLo } from "./messages/lo";
import { homeMessagesVi } from "./messages/vi";
import {
  HOME_MESSAGE_KEYS,
  type HomeLocale,
  type HomeMessageKey,
  type HomeMessages,
} from "./home.types";

export const HOME_LOCALES = [
  "vi",
  "en",
  "lo",
] as const satisfies readonly HomeLocale[];

export const DEFAULT_HOME_LOCALE: HomeLocale = "vi";

export const HOME_MESSAGE_CATALOG = {
  vi: homeMessagesVi,
  en: homeMessagesEn,
  lo: homeMessagesLo,
} as const satisfies Readonly<Record<HomeLocale, HomeMessages>>;

function placeholders(value: string): readonly string[] {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === "string")
    .sort();
}

export function normalizeHomeLocale(locale: unknown): HomeLocale {
  return normalizeShellLocale(locale);
}

export function validateHomeCatalog(
  catalog: Readonly<Record<HomeLocale, HomeMessages>> = HOME_MESSAGE_CATALOG,
): { readonly locales: readonly HomeLocale[]; readonly keyCount: number } {
  const reference = catalog[DEFAULT_HOME_LOCALE];

  for (const locale of HOME_LOCALES) {
    const messages = catalog[locale];

    for (const key of HOME_MESSAGE_KEYS) {
      const value = messages[key];

      if (!value.trim()) {
        throw new Error(`HOME_EMPTY_TRANSLATION:${locale}:${key}`);
      }

      if (/<\/?[A-Za-z][^>]*>/.test(value)) {
        throw new Error(`HOME_UNSAFE_HTML:${locale}:${key}`);
      }

      if (
        JSON.stringify(placeholders(value)) !==
        JSON.stringify(placeholders(reference[key]))
      ) {
        throw new Error(`HOME_PLACEHOLDER_SET_MISMATCH:${locale}:${key}`);
      }
    }

    const keys = Object.keys(messages).sort();
    const expectedKeys = [...HOME_MESSAGE_KEYS].sort();

    if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
      throw new Error(`HOME_TRANSLATION_KEY_MISMATCH:${locale}`);
    }
  }

  return {
    locales: HOME_LOCALES,
    keyCount: HOME_MESSAGE_KEYS.length,
  };
}

export const HOME_CATALOG_VALIDATION = validateHomeCatalog();

export function createHomeTranslator(locale: unknown) {
  const normalized = normalizeHomeLocale(locale);
  const messages = HOME_MESSAGE_CATALOG[normalized];
  const fallback = HOME_MESSAGE_CATALOG[DEFAULT_HOME_LOCALE];

  return (
    key: HomeMessageKey,
    values: Readonly<Record<string, string | number>> = {},
  ): string => {
    const template = messages[key] ?? fallback[key] ?? key;

    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (placeholder, name: string) =>
        values[name] === undefined ? placeholder : String(values[name]),
    );
  };
}
