import { notFound } from "next/navigation";

import { StorefrontLocaleProvider } from "@/i18n/runtime";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import {
  SHELL_LOCALES,
  normalizeShellLocale,
} from "@/i18n/shell/shell.registry";
import type { ShellLocale } from "@/i18n/shell/shell.types";

function isShellLocale(value: string): value is ShellLocale {
  return (SHELL_LOCALES as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return SHELL_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeInput } = await params;
  if (!isShellLocale(localeInput)) notFound();

  const locale = normalizeShellLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);

  return (
    <StorefrontLocaleProvider shell={shell}>
      <div
        data-ysim-ui="refactor"
        data-ysim-locale={locale}
        className="flex min-h-full flex-1 flex-col"
      >
        {children}
      </div>
    </StorefrontLocaleProvider>
  );
}
