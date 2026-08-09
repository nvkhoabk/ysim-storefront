// F07A-2B_GLOBAL_SHELL_LOCALIZATION_R2

import { shellMessagesEn } from "./messages/en";
import { shellMessagesLo } from "./messages/lo";
import { shellMessagesVi } from "./messages/vi";
import type {
  ShellLocale,
  ShellMessages,
  ShellMessageTree,
} from "./shell.types";

export const SHELL_LOCALES = [
  "vi",
  "en",
  "lo",
] as const satisfies readonly ShellLocale[];
export const DEFAULT_SHELL_LOCALE: ShellLocale = "vi";

export const SHELL_MESSAGE_CATALOG = {
  vi: shellMessagesVi,
  en: shellMessagesEn,
  lo: shellMessagesLo,
} as const satisfies Readonly<Record<ShellLocale, ShellMessages>>;

function flattenMessages(
  tree: ShellMessageTree,
  prefix = "",
  output = new Map<string, string>(),
): Map<string, string> {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") output.set(path, value);
    else flattenMessages(value, path, output);
  }
  return output;
}

function placeholders(value: string): readonly string[] {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === "string")
    .sort();
}

function nestedMessage(
  messages: ShellMessages,
  key: string,
): string | undefined {
  let current: string | ShellMessageTree = messages;
  for (const segment of key.split(".").filter(Boolean)) {
    if (typeof current === "string") return undefined;
    const next: string | ShellMessageTree | undefined = current[segment];
    if (next === undefined) return undefined;
    current = next;
  }
  return typeof current === "string" ? current : undefined;
}

export function normalizeShellLocale(locale: unknown): ShellLocale {
  if (typeof locale !== "string") return DEFAULT_SHELL_LOCALE;
  const normalized = locale.trim().toLowerCase().split(/[-_]/)[0];
  return SHELL_LOCALES.includes(normalized as ShellLocale)
    ? (normalized as ShellLocale)
    : DEFAULT_SHELL_LOCALE;
}

export function validateShellCatalog(
  catalog: Readonly<Record<string, ShellMessages>> = SHELL_MESSAGE_CATALOG,
  locales: readonly string[] = SHELL_LOCALES,
): { readonly locales: readonly string[]; readonly keyCount: number } {
  const referenceMessages = catalog[DEFAULT_SHELL_LOCALE];
  if (!referenceMessages) {
    throw new Error(`SHELL_CATALOG_LOCALE_MISSING:${DEFAULT_SHELL_LOCALE}`);
  }
  const reference = flattenMessages(referenceMessages);
  const referenceKeys = [...reference.keys()].sort();

  for (const locale of locales) {
    const messages = catalog[locale];
    if (!messages) throw new Error(`SHELL_CATALOG_LOCALE_MISSING:${locale}`);
    const flat = flattenMessages(messages);
    const keys = [...flat.keys()].sort();
    if (JSON.stringify(keys) !== JSON.stringify(referenceKeys)) {
      throw new Error(`SHELL_TRANSLATION_KEY_MISMATCH:${locale}`);
    }
    for (const key of referenceKeys) {
      const value = flat.get(key) ?? "";
      if (!value.trim())
        throw new Error(`SHELL_EMPTY_TRANSLATION:${locale}:${key}`);
      if (/<\/?[A-Za-z][^>]*>/.test(value)) {
        throw new Error(`SHELL_UNSAFE_HTML:${locale}:${key}`);
      }
      if (
        JSON.stringify(placeholders(value)) !==
        JSON.stringify(placeholders(reference.get(key) ?? ""))
      ) {
        throw new Error(`SHELL_PLACEHOLDER_SET_MISMATCH:${locale}:${key}`);
      }
    }
  }

  return { locales: [...locales], keyCount: referenceKeys.length };
}

export const SHELL_CATALOG_VALIDATION = validateShellCatalog();

export function createShellTranslator(locale: unknown) {
  const normalized = normalizeShellLocale(locale);
  const messages = SHELL_MESSAGE_CATALOG[normalized];
  const fallback = SHELL_MESSAGE_CATALOG[DEFAULT_SHELL_LOCALE];
  return (
    key: string,
    values: Readonly<Record<string, string | number>> = {},
  ): string => {
    const template =
      nestedMessage(messages, key) ?? nestedMessage(fallback, key) ?? key;
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (placeholder, name: string) =>
        values[name] === undefined ? placeholder : String(values[name]),
    );
  };
}
