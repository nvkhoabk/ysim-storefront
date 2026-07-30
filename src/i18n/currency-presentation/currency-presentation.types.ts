// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";
import type { CurrencyPresentationContext } from "../../lib/currency/currency-presentation.types";

export type CurrencyPresentationLocale = ShellLocale;
export type CurrencyPresentationMessages = Readonly<Record<string, string>>;
export type CurrencyPresentationTranslator = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;
export type { CurrencyPresentationContext };
