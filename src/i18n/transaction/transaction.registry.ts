// F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { transactionMessagesEn } from "./messages/en";
import { transactionMessagesLo } from "./messages/lo";
import { transactionMessagesVi } from "./messages/vi";
import type {
  TransactionMessages,
  TransactionTranslator,
  TransactionView,
} from "./transaction.types";

export const TRANSACTION_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, TransactionMessages>
> = {
  vi: transactionMessagesVi,
  en: transactionMessagesEn,
  lo: transactionMessagesLo,
};

const TRANSACTION_VIEWS = [
  "cart",
  "checkout",
  "payment",
  "order-result",
] as const satisfies readonly TransactionView[];

export function normalizeTransactionLocale(input: unknown): ShellLocale {
  return normalizeShellLocale(input);
}

export function normalizeTransactionView(input: unknown): TransactionView {
  return typeof input === "string" &&
    (TRANSACTION_VIEWS as readonly string[]).includes(input)
    ? (input as TransactionView)
    : "cart";
}

export function createTransactionTranslator(
  localeInput: unknown,
): TransactionTranslator {
  const locale = normalizeTransactionLocale(localeInput);
  const messages = TRANSACTION_MESSAGE_CATALOG[locale];
  const fallback = TRANSACTION_MESSAGE_CATALOG.vi;
  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template)
      throw new Error(`TRANSACTION_TRANSLATION_MISSING:${locale}:${key}`);
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined)
          throw new Error(`TRANSACTION_PLACEHOLDER_MISSING:${key}:${name}`);
        return String(value);
      },
    );
  };
}
