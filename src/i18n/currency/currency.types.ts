// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";
import type { CurrencyQuoteView } from "../../lib/currency/currency-quote.types";

export type CurrencyLocale = ShellLocale;
export type CurrencyMessages = Readonly<Record<string, string>>;
export type CurrencyTranslator = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;
export type { CurrencyQuoteView };
