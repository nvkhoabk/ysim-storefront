// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

"use client";

import type { ReactNode } from "react";

import { Footer, Header } from "@/components/navigation";
import type { StorefrontFooterConfig } from "@/config/storefront-footer";
import { type StorefrontNavigationConfig } from "@/config/storefront-navigation";
import { useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type {
  LocalizedShellLabels,
  ShellLanguageSwitchConfig,
  ShellLocale,
} from "@/i18n/shell/shell.types";
import { cn } from "@/lib/ui/cn";

import { Container } from "./Container";

export interface PageShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  aside?: ReactNode;
  headerConfig?: StorefrontNavigationConfig;
  footerConfig?: StorefrontFooterConfig;
  shellLabels?: LocalizedShellLabels;
  locale?: ShellLocale;
  languageSwitch?: ShellLanguageSwitchConfig;
  cartCount?: number;
  cartHref?: string;
  homeHref?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  mainClassName?: string;
  contentClassName?: string;
  sidebarClassName?: string;
  asideClassName?: string;
}

export function PageShell({
  children,
  sidebar,
  aside,
  headerConfig,
  footerConfig,
  shellLabels: shellLabelsProp,
  locale: localeProp,
  languageSwitch: languageSwitchProp,
  cartCount = 0,
  cartHref,
  homeHref,
  showHeader = true,
  showFooter = true,
  mainClassName,
  contentClassName,
  sidebarClassName,
  asideClassName,
}: PageShellProps) {
  const runtimeShell = useStorefrontLocale();
  const locale = localeProp ?? runtimeShell.locale;
  const shellLabels = shellLabelsProp ?? runtimeShell.labels;
  const effectiveHeaderConfig = headerConfig ?? runtimeShell.navigation;
  const effectiveFooterConfig = footerConfig ?? runtimeShell.footer;
  const languageSwitch = languageSwitchProp ?? { mode: "market" };
  const effectiveCartHref = cartHref ?? localizeShellHref("/cart", locale);
  const effectiveHomeHref = homeHref ?? localizeShellHref("/", locale);
  const hasAuxiliaryColumns = Boolean(sidebar || aside);
  const gridClassName =
    sidebar && aside
      ? "xl:grid-cols-[16rem_minmax(0,1fr)_18rem]"
      : sidebar
        ? "lg:grid-cols-[16rem_minmax(0,1fr)]"
        : aside
          ? "lg:grid-cols-[minmax(0,1fr)_18rem]"
          : "";

  return (
    <>
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[var(--ysim-z-toast)] -translate-y-24 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-900)] px-4 py-2 text-sm font-bold text-white shadow-[var(--ysim-shadow-md)] transition-transform focus:translate-y-0"
      >
        {shellLabels.skipNavigation}
      </a>
      {showHeader ? (
        <Header
          config={effectiveHeaderConfig}
          labels={shellLabels}
          locale={locale}
          languageSwitch={languageSwitch}
          cartCount={cartCount}
          cartHref={effectiveCartHref}
          homeHref={effectiveHomeHref}
        />
      ) : null}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn("min-h-[55vh]", mainClassName)}
      >
        {hasAuxiliaryColumns ? (
          <Container
            size="wide"
            className={cn(
              "grid gap-6 py-8 lg:gap-8",
              gridClassName,
              contentClassName,
            )}
          >
            {sidebar ? (
              <aside
                aria-label={shellLabels.secondaryNavigation}
                className={cn("min-w-0", sidebarClassName)}
              >
                {sidebar}
              </aside>
            ) : null}
            <div className="min-w-0">{children}</div>
            {aside ? (
              <aside
                aria-label={shellLabels.supplementaryInformation}
                className={cn("min-w-0", asideClassName)}
              >
                {aside}
              </aside>
            ) : null}
          </Container>
        ) : (
          children
        )}
      </main>
      {showFooter ? (
        <Footer
          config={effectiveFooterConfig}
          labels={shellLabels}
          homeHref={effectiveHomeHref}
        />
      ) : null}
    </>
  );
}
