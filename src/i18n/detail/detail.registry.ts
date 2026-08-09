// F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4

import { normalizeShellLocale } from "@/i18n/shell/shell.registry";

import { detailMessagesEn } from "./messages/en";
import { detailMessagesLo } from "./messages/lo";
import { detailMessagesVi } from "./messages/vi";
import {
  DETAIL_MESSAGE_KEYS,
  type DetailLocale,
  type DetailMessageKey,
  type DetailMessages,
  type DetailView,
} from "./detail.types";

export const DETAIL_LOCALES = [
  "vi",
  "en",
  "lo",
] as const satisfies readonly DetailLocale[];
export const DEFAULT_DETAIL_LOCALE: DetailLocale = "vi";

export const DETAIL_MESSAGE_CATALOG = {
  vi: detailMessagesVi,
  en: detailMessagesEn,
  lo: detailMessagesLo,
} as const satisfies Readonly<Record<DetailLocale, DetailMessages>>;

function placeholders(value: string): readonly string[] {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === "string")
    .sort();
}

export function normalizeDetailLocale(locale: unknown): DetailLocale {
  return normalizeShellLocale(locale);
}

export function normalizeDetailView(value: unknown): DetailView {
  return value === "destination" ? "destination" : "product";
}

export function validateDetailCatalog(
  catalog: Readonly<
    Record<DetailLocale, DetailMessages>
  > = DETAIL_MESSAGE_CATALOG,
): { readonly locales: readonly DetailLocale[]; readonly keyCount: number } {
  const reference = catalog[DEFAULT_DETAIL_LOCALE];
  const expectedKeys = [...DETAIL_MESSAGE_KEYS].sort();

  for (const locale of DETAIL_LOCALES) {
    const messages = catalog[locale];
    const actualKeys = Object.keys(messages).sort();

    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
      throw new Error(`DETAIL_TRANSLATION_KEY_MISMATCH:${locale}`);
    }

    for (const key of DETAIL_MESSAGE_KEYS) {
      const value = messages[key];
      if (!value.trim())
        throw new Error(`DETAIL_EMPTY_TRANSLATION:${locale}:${key}`);
      if (/<\/?[A-Za-z][^>]*>/.test(value)) {
        throw new Error(`DETAIL_UNSAFE_HTML:${locale}:${key}`);
      }
      if (
        JSON.stringify(placeholders(value)) !==
        JSON.stringify(placeholders(reference[key]))
      ) {
        throw new Error(`DETAIL_PLACEHOLDER_SET_MISMATCH:${locale}:${key}`);
      }
    }
  }

  return { locales: DETAIL_LOCALES, keyCount: DETAIL_MESSAGE_KEYS.length };
}

export const DETAIL_CATALOG_VALIDATION = validateDetailCatalog();

export function createDetailTranslator(localeInput: unknown) {
  const locale = normalizeDetailLocale(localeInput);
  const messages = DETAIL_MESSAGE_CATALOG[locale];
  const fallback = DETAIL_MESSAGE_CATALOG[DEFAULT_DETAIL_LOCALE];

  return (
    key: DetailMessageKey,
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
