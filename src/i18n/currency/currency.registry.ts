// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { currencyMessagesEn } from "./messages/en";
import { currencyMessagesLo } from "./messages/lo";
import { currencyMessagesVi } from "./messages/vi";
import type {
  CurrencyMessages,
  CurrencyQuoteView,
  CurrencyTranslator,
} from "./currency.types";

export const CURRENCY_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, CurrencyMessages>
> = {
  vi: currencyMessagesVi,
  en: currencyMessagesEn,
  lo: currencyMessagesLo,
};

const VIEWS = [
  "quote",
  "rounding",
  "snapshot",
  "expired",
] as const satisfies readonly CurrencyQuoteView[];

export function normalizeCurrencyLocale(input: unknown): ShellLocale {
  return normalizeShellLocale(input);
}

export function normalizeCurrencyQuoteView(input: unknown): CurrencyQuoteView {
  return typeof input === "string" &&
    (VIEWS as readonly string[]).includes(input)
    ? (input as CurrencyQuoteView)
    : "quote";
}

export function createCurrencyTranslator(
  localeInput: unknown,
): CurrencyTranslator {
  const locale = normalizeCurrencyLocale(localeInput);
  const messages = CURRENCY_MESSAGE_CATALOG[locale];
  const fallback = CURRENCY_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template)
      throw new Error(`CURRENCY_TRANSLATION_MISSING:${locale}:${key}`);
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined)
          throw new Error(`CURRENCY_PLACEHOLDER_MISSING:${key}:${name}`);
        return String(value);
      },
    );
  };
}
