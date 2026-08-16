"use client";

import { createContext, useContext, type ReactNode } from "react";

import { I18nProvider } from "../I18nProvider";
import { getMessages } from "../i18n.loader";
import type { LocalizedShellBundle } from "../shell/shell.types";

const StorefrontLocaleContext = createContext<LocalizedShellBundle | null>(
  null,
);

export function StorefrontLocaleProvider({
  shell,
  children,
}: {
  readonly shell: LocalizedShellBundle;
  readonly children: ReactNode;
}) {
  return (
    <StorefrontLocaleContext.Provider value={shell}>
      <I18nProvider locale={shell.locale} messages={getMessages(shell.locale)}>
        {children}
      </I18nProvider>
    </StorefrontLocaleContext.Provider>
  );
}

export function useStorefrontLocale(): LocalizedShellBundle {
  const value = useContext(StorefrontLocaleContext);
  if (!value) throw new Error("STOREFRONT_LOCALE_PROVIDER_REQUIRED");
  return value;
}

export function useOptionalStorefrontLocale(): LocalizedShellBundle | null {
  return useContext(StorefrontLocaleContext);
}
