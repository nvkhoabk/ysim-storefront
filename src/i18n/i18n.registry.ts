// F07A-2A_STATIC_LOCALIZATION_R1

import { MARKET_CONFIGS } from "../config/markets";
import type {
  LocaleMessages,
  MessageCatalogValidation,
  MessageNamespace,
  MessageTree,
} from "./i18n.types";
import { MESSAGE_NAMESPACES } from "./i18n.types";
import { messages as enMessages } from "./messages/en/index";
import { messages as loMessages } from "./messages/lo/index";
import { messages as viMessages } from "./messages/vi/index";

export type SupportedLocale = (typeof MARKET_CONFIGS)[number]["locale"];

const defaultMarket = MARKET_CONFIGS.find(
  (market) => "isDefault" in market && market.isDefault === true,
);
if (!defaultMarket) {
  throw new Error("I18N_DEFAULT_MARKET_NOT_FOUND");
}

export const DEFAULT_LOCALE: SupportedLocale = defaultMarket.locale;

export const SUPPORTED_LOCALES = Object.freeze(
  MARKET_CONFIGS.map((market) => market.locale),
) as readonly SupportedLocale[];

export const MESSAGE_CATALOG = Object.freeze({
  vi: viMessages,
  en: enMessages,
  lo: loMessages,
}) satisfies Readonly<Record<SupportedLocale, LocaleMessages>>;

const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g;
const UNSAFE_HTML_PATTERN = /<\/?[A-Za-z][^>]*>/;

function flattenTree(
  tree: MessageTree,
  prefix: string,
  output: Map<string, string>,
): void {
  for (const [key, value] of Object.entries(tree)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      output.set(fullKey, value);
      continue;
    }
    flattenTree(value, fullKey, output);
  }
}

export function flattenMessages(messages: LocaleMessages): Map<string, string> {
  const output = new Map<string, string>();
  for (const namespace of MESSAGE_NAMESPACES) {
    flattenTree(messages[namespace], namespace, output);
  }
  return output;
}

export function getPlaceholderNames(value: string): readonly string[] {
  const placeholders = new Set<string>();
  for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
    placeholders.add(match[1]);
  }
  return [...placeholders].sort();
}

function compareStringArrays(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

export function validateMessageCatalog(
  catalog: Readonly<Record<string, LocaleMessages>>,
  expectedLocales: readonly string[] = SUPPORTED_LOCALES,
  referenceLocale: string = DEFAULT_LOCALE,
): MessageCatalogValidation {
  const catalogLocales = Object.keys(catalog).sort();
  const normalizedExpectedLocales = [...expectedLocales].sort();

  if (!compareStringArrays(catalogLocales, normalizedExpectedLocales)) {
    throw new Error(
      `I18N_LOCALE_SET_MISMATCH:expected=${normalizedExpectedLocales.join(",")}:actual=${catalogLocales.join(",")}`,
    );
  }

  const referenceMessages = catalog[referenceLocale];
  if (!referenceMessages) {
    throw new Error(`I18N_REFERENCE_LOCALE_NOT_FOUND:${referenceLocale}`);
  }

  const referenceNamespaces = Object.keys(referenceMessages).sort();
  const expectedNamespaces = [...MESSAGE_NAMESPACES].sort();
  if (!compareStringArrays(referenceNamespaces, expectedNamespaces)) {
    throw new Error(`I18N_NAMESPACE_SET_MISMATCH:${referenceLocale}`);
  }

  const referenceFlat = flattenMessages(referenceMessages);
  const referenceKeys = [...referenceFlat.keys()].sort();

  for (const locale of expectedLocales) {
    const localeMessages = catalog[locale];
    if (!localeMessages) {
      throw new Error(`I18N_LOCALE_MESSAGES_NOT_FOUND:${locale}`);
    }

    const namespaces = Object.keys(localeMessages).sort();
    if (!compareStringArrays(namespaces, expectedNamespaces)) {
      throw new Error(`I18N_NAMESPACE_SET_MISMATCH:${locale}`);
    }

    const flat = flattenMessages(localeMessages);
    const keys = [...flat.keys()].sort();
    if (!compareStringArrays(keys, referenceKeys)) {
      throw new Error(`I18N_TRANSLATION_KEY_SET_MISMATCH:${locale}`);
    }

    for (const key of referenceKeys) {
      const value = flat.get(key);
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`I18N_EMPTY_TRANSLATION:${locale}:${key}`);
      }
      if (UNSAFE_HTML_PATTERN.test(value)) {
        throw new Error(`I18N_UNSAFE_HTML:${locale}:${key}`);
      }

      const referenceValue = referenceFlat.get(key);
      if (typeof referenceValue !== "string") {
        throw new Error(`I18N_REFERENCE_KEY_NOT_FOUND:${key}`);
      }
      const expectedPlaceholders = getPlaceholderNames(referenceValue);
      const actualPlaceholders = getPlaceholderNames(value);
      if (!compareStringArrays(actualPlaceholders, expectedPlaceholders)) {
        throw new Error(`I18N_PLACEHOLDER_SET_MISMATCH:${locale}:${key}`);
      }
    }
  }

  return Object.freeze({
    locales: Object.freeze([...expectedLocales]),
    namespaces: MESSAGE_NAMESPACES as readonly MessageNamespace[],
    keyCount: referenceKeys.length,
    referenceLocale,
  });
}

export const I18N_CATALOG_VALIDATION = validateMessageCatalog(MESSAGE_CATALOG);

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(value as SupportedLocale)
  );
}
