// F07A-2A_STATIC_LOCALIZATION_R1

"use client";

import { createContext, useMemo, type ReactNode } from "react";
import { createTranslator } from "./i18n.translate";
import type { LocaleMessages, TranslationFunction } from "./i18n.types";
import type { SupportedLocale } from "./i18n.registry";

export interface I18nContextValue {
  readonly locale: SupportedLocale;
  readonly messages: LocaleMessages;
  readonly t: TranslationFunction;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  readonly locale: SupportedLocale;
  readonly messages: LocaleMessages;
  readonly children: ReactNode;
}

export function I18nProvider({
  locale,
  messages,
  children,
}: I18nProviderProps) {
  const t = useMemo(
    () =>
      createTranslator({
        locale,
        messages,
        mode:
          process.env.NODE_ENV === "production" ? "production" : "development",
      }),
    [locale, messages],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, messages, t }),
    [locale, messages, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
