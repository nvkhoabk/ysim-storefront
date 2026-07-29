// F07A-2C-2_LOCALIZED_LISTING_CANDIDATE_R1

import { normalizeShellLocale } from "@/i18n/shell/shell.registry";
import { listingMessagesEn } from "./messages/en";
import { listingMessagesLo } from "./messages/lo";
import { listingMessagesVi } from "./messages/vi";
import {
  LISTING_MESSAGE_KEYS,
  type ListingLocale,
  type ListingMessageKey,
  type ListingMessages,
} from "./listing.types";

export const LISTING_LOCALES = [
  "vi",
  "en",
  "lo",
] as const satisfies readonly ListingLocale[];
export const DEFAULT_LISTING_LOCALE: ListingLocale = "vi";

export const LISTING_MESSAGE_CATALOG = {
  vi: listingMessagesVi,
  en: listingMessagesEn,
  lo: listingMessagesLo,
} as const satisfies Readonly<Record<ListingLocale, ListingMessages>>;

function placeholders(value: string): readonly string[] {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === "string")
    .sort();
}

export function normalizeListingLocale(locale: unknown): ListingLocale {
  return normalizeShellLocale(locale);
}

export function normalizeListingView(value: unknown): "esim" | "destinations" {
  return value === "destinations" ? "destinations" : "esim";
}

export function validateListingCatalog(
  catalog: Readonly<
    Record<ListingLocale, ListingMessages>
  > = LISTING_MESSAGE_CATALOG,
): { readonly locales: readonly ListingLocale[]; readonly keyCount: number } {
  const reference = catalog[DEFAULT_LISTING_LOCALE];
  const expectedKeys = [...LISTING_MESSAGE_KEYS].sort();

  for (const locale of LISTING_LOCALES) {
    const messages = catalog[locale];
    const actualKeys = Object.keys(messages).sort();

    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
      throw new Error(`LISTING_TRANSLATION_KEY_MISMATCH:${locale}`);
    }

    for (const key of LISTING_MESSAGE_KEYS) {
      const value = messages[key];
      if (!value.trim())
        throw new Error(`LISTING_EMPTY_TRANSLATION:${locale}:${key}`);
      if (/<\/?[A-Za-z][^>]*>/.test(value)) {
        throw new Error(`LISTING_UNSAFE_HTML:${locale}:${key}`);
      }
      if (
        JSON.stringify(placeholders(value)) !==
        JSON.stringify(placeholders(reference[key]))
      ) {
        throw new Error(`LISTING_PLACEHOLDER_SET_MISMATCH:${locale}:${key}`);
      }
    }
  }

  return { locales: LISTING_LOCALES, keyCount: LISTING_MESSAGE_KEYS.length };
}

export const LISTING_CATALOG_VALIDATION = validateListingCatalog();

export function createListingTranslator(localeInput: unknown) {
  const locale = normalizeListingLocale(localeInput);
  const messages = LISTING_MESSAGE_CATALOG[locale];
  const fallback = LISTING_MESSAGE_CATALOG[DEFAULT_LISTING_LOCALE];

  return (
    key: ListingMessageKey,
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
