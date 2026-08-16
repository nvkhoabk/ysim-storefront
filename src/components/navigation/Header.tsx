// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

"use client";

import { useCallback, useState } from "react";

import { Container } from "@/components/layout";
import {
  storefrontNavigation,
  type StorefrontNavigationConfig,
} from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import { useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type {
  LocalizedShellLabels,
  ShellLanguageSwitchConfig,
  ShellLocale,
} from "@/i18n/shell/shell.types";

import { AnnouncementBar } from "./AnnouncementBar";
import { BrandLogo } from "./BrandLogo";
import { CartLink } from "./CartLink";
import { DesktopNavigation } from "./DesktopNavigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileHeader } from "./MobileHeader";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { QuickAccessBar } from "./QuickAccessBar";

export interface HeaderProps {
  config?: StorefrontNavigationConfig;
  labels?: LocalizedShellLabels;
  locale?: ShellLocale;
  languageSwitch?: ShellLanguageSwitchConfig;
  cartCount?: number;
  cartHref?: string;
  homeHref?: string;
}

export function Header({
  config,
  labels,
  locale,
  languageSwitch,
  cartCount = 0,
  cartHref,
  homeHref,
}: HeaderProps) {
  const runtimeShell = useStorefrontLocale();
  const effectiveLocale = locale ?? runtimeShell.locale;
  const effectiveConfig =
    config ?? runtimeShell.navigation ?? storefrontNavigation;
  const effectiveLabels =
    labels ?? runtimeShell.labels ?? DEFAULT_LOCALIZED_SHELL_LABELS;
  const effectiveSwitch = languageSwitch ?? { mode: "market" };
  const effectiveCartHref =
    cartHref ?? localizeShellHref("/cart", effectiveLocale);
  const effectiveHomeHref = homeHref ?? localizeShellHref("/", effectiveLocale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <AnnouncementBar
        config={effectiveConfig.announcement}
        labels={effectiveLabels}
      />
      <header className="sticky top-0 z-[var(--ysim-z-sticky)] border-b border-[var(--ysim-color-border)] bg-white/95 backdrop-blur">
        <Container>
          <div className="hidden min-h-[4.5rem] items-center justify-between gap-5 lg:flex">
            <BrandLogo
              href={effectiveHomeHref}
              label={effectiveLabels.brandHome}
              priority
            />
            <DesktopNavigation
              items={effectiveConfig.mainItems}
              ariaLabel={effectiveLabels.mainNavigation}
            />
            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitcher
                languages={effectiveConfig.languages}
                currentLocale={effectiveLocale}
                labels={effectiveLabels}
                switchConfig={effectiveSwitch}
              />
              <CartLink
                count={cartCount}
                href={effectiveCartHref}
                labels={effectiveLabels}
              />
            </div>
          </div>
          <MobileHeader
            languages={effectiveConfig.languages}
            currentLocale={effectiveLocale}
            labels={effectiveLabels}
            switchConfig={effectiveSwitch}
            cartCount={cartCount}
            cartHref={effectiveCartHref}
            homeHref={effectiveHomeHref}
            onOpenMenu={openMobileMenu}
          />
        </Container>
        <QuickAccessBar
          config={effectiveConfig.quickAccess}
          labels={effectiveLabels}
        />
      </header>
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        items={effectiveConfig.mainItems}
        languages={effectiveConfig.languages}
        currentLocale={effectiveLocale}
        labels={effectiveLabels}
        switchConfig={effectiveSwitch}
        homeHref={effectiveHomeHref}
      />
    </>
  );
}
