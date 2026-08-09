// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { dynamicContentMessagesEn } from "./messages/en";
import { dynamicContentMessagesLo } from "./messages/lo";
import { dynamicContentMessagesVi } from "./messages/vi";
import type {
  DynamicContentMessages,
  DynamicContentTranslator,
  DynamicContentView,
} from "./dynamic-content.types";

export const DYNAMIC_CONTENT_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, DynamicContentMessages>
> = {
  vi: dynamicContentMessagesVi,
  en: dynamicContentMessagesEn,
  lo: dynamicContentMessagesLo,
};

const VIEWS = [
  "product",
  "destination",
  "guide",
  "fallback",
] as const satisfies readonly DynamicContentView[];

export function normalizeDynamicContentLocale(input: unknown): ShellLocale {
  return normalizeShellLocale(input);
}

export function normalizeDynamicContentView(
  input: unknown,
): DynamicContentView {
  return typeof input === "string" &&
    (VIEWS as readonly string[]).includes(input)
    ? (input as DynamicContentView)
    : "product";
}

export function createDynamicContentTranslator(
  localeInput: unknown,
): DynamicContentTranslator {
  const locale = normalizeDynamicContentLocale(localeInput);
  const messages = DYNAMIC_CONTENT_MESSAGE_CATALOG[locale];
  const fallback = DYNAMIC_CONTENT_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template)
      throw new Error(`DYNAMIC_CONTENT_TRANSLATION_MISSING:${locale}:${key}`);
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined)
          throw new Error(`DYNAMIC_CONTENT_PLACEHOLDER_MISSING:${key}:${name}`);
        return String(value);
      },
    );
  };
}
