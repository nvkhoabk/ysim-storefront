// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { currencyPresentationMessagesEn } from "./messages/en";
import { currencyPresentationMessagesLo } from "./messages/lo";
import { currencyPresentationMessagesVi } from "./messages/vi";
import type {
  CurrencyPresentationMessages,
  CurrencyPresentationTranslator,
} from "./currency-presentation.types";

export const CURRENCY_PRESENTATION_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, CurrencyPresentationMessages>
> = {
  vi: currencyPresentationMessagesVi,
  en: currencyPresentationMessagesEn,
  lo: currencyPresentationMessagesLo,
};

export function createCurrencyPresentationTranslator(
  localeInput: unknown,
): CurrencyPresentationTranslator {
  const locale = normalizeShellLocale(localeInput);
  const catalog = CURRENCY_PRESENTATION_MESSAGE_CATALOG[locale];
  return (key, params = {}) => {
    const template =
      catalog[key] ?? CURRENCY_PRESENTATION_MESSAGE_CATALOG.vi[key];
    if (!template)
      throw new Error(`CURRENCY_PRESENTATION_MESSAGE_MISSING:${key}`);
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_match, name: string) => String(params[name] ?? `{${name}}`),
    );
  };
}
