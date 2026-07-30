// F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import type { CurrencyTransactionBindingView } from "../../lib/currency/currency-transaction-binding.types";
import { currencyTransactionBindingMessagesEn } from "./messages/en";
import { currencyTransactionBindingMessagesLo } from "./messages/lo";
import { currencyTransactionBindingMessagesVi } from "./messages/vi";
import type {
  CurrencyTransactionBindingMessageKey,
  CurrencyTransactionBindingTranslator,
} from "./currency-transaction-binding.types";

export const CURRENCY_TRANSACTION_BINDING_MESSAGE_CATALOG = {
  vi: currencyTransactionBindingMessagesVi,
  en: currencyTransactionBindingMessagesEn,
  lo: currencyTransactionBindingMessagesLo,
} as const satisfies Readonly<
  Record<ShellLocale, Record<CurrencyTransactionBindingMessageKey, string>>
>;

const VIEWS = [
  "checkout-lock",
  "payment-draft",
  "order-record",
  "audit",
] as const satisfies readonly CurrencyTransactionBindingView[];

export function normalizeCurrencyTransactionBindingView(
  input: unknown,
): CurrencyTransactionBindingView {
  return typeof input === "string" &&
    (VIEWS as readonly string[]).includes(input)
    ? (input as CurrencyTransactionBindingView)
    : "checkout-lock";
}

export function createCurrencyTransactionBindingTranslator(
  localeInput: unknown,
): CurrencyTransactionBindingTranslator {
  const locale = normalizeShellLocale(localeInput);
  const messages = CURRENCY_TRANSACTION_BINDING_MESSAGE_CATALOG[locale];
  const fallback = CURRENCY_TRANSACTION_BINDING_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template) {
      throw new Error(
        `CURRENCY_TRANSACTION_BINDING_TRANSLATION_MISSING:${locale}:${key}`,
      );
    }
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined) {
          throw new Error(
            `CURRENCY_TRANSACTION_BINDING_PLACEHOLDER_MISSING:${key}:${name}`,
          );
        }
        return String(value);
      },
    );
  };
}
