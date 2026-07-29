// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

"use client";

import { useCallback, useState } from "react";

import { Container } from "@/components/layout";
import {
  storefrontNavigation,
  type StorefrontNavigationConfig,
} from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
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
  config = storefrontNavigation,
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
  locale = "vi",
  languageSwitch = { mode: "display" },
  cartCount = 0,
  cartHref = "/cart",
  homeHref = "/",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <AnnouncementBar config={config.announcement} labels={labels} />
      <header className="sticky top-0 z-[var(--ysim-z-sticky)] border-b border-[var(--ysim-color-border)] bg-white/95 backdrop-blur">
        <Container>
          <div className="hidden min-h-[4.5rem] items-center justify-between gap-5 lg:flex">
            <BrandLogo href={homeHref} label={labels.brandHome} priority />
            <DesktopNavigation
              items={config.mainItems}
              ariaLabel={labels.mainNavigation}
            />
            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitcher
                languages={config.languages}
                currentLocale={locale}
                labels={labels}
                switchConfig={languageSwitch}
              />
              <CartLink count={cartCount} href={cartHref} labels={labels} />
            </div>
          </div>
          <MobileHeader
            languages={config.languages}
            currentLocale={locale}
            labels={labels}
            switchConfig={languageSwitch}
            cartCount={cartCount}
            cartHref={cartHref}
            homeHref={homeHref}
            onOpenMenu={openMobileMenu}
          />
        </Container>
        <QuickAccessBar config={config.quickAccess} labels={labels} />
      </header>
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        items={config.mainItems}
        languages={config.languages}
        currentLocale={locale}
        labels={labels}
        switchConfig={languageSwitch}
        homeHref={homeHref}
      />
    </>
  );
}
