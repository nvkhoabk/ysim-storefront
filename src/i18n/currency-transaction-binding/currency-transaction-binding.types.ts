// F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1

import type { currencyTransactionBindingMessagesVi } from "./messages/vi";

export type CurrencyTransactionBindingMessageKey =
  keyof typeof currencyTransactionBindingMessagesVi;
export type CurrencyTransactionBindingTranslator = (
  key: CurrencyTransactionBindingMessageKey,
  params?: Readonly<Record<string, string | number>>,
) => string;
