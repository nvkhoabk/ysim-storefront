"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  Container,
} from "@/components/layout";

import {
  storefrontNavigation,
  type StorefrontNavigationConfig,
} from "@/config/storefront-navigation";

import {
  AnnouncementBar,
} from "./AnnouncementBar";

import {
  BrandLogo,
} from "./BrandLogo";

import {
  CartLink,
} from "./CartLink";

import {
  DesktopNavigation,
} from "./DesktopNavigation";

import {
  LanguageSwitcher,
} from "./LanguageSwitcher";

import {
  MobileHeader,
} from "./MobileHeader";

import {
  MobileMenuDrawer,
} from "./MobileMenuDrawer";

import {
  QuickAccessBar,
} from "./QuickAccessBar";

export interface HeaderProps {
  config?: StorefrontNavigationConfig;
  cartCount?: number;
}

export function Header({
  config =
    storefrontNavigation,
  cartCount = 0,
}: HeaderProps) {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(false);

  const openMobileMenu =
    useCallback(() => {
      setMobileMenuOpen(true);
    }, []);

  const closeMobileMenu =
    useCallback(() => {
      setMobileMenuOpen(false);
    }, []);

  return (
    <>
      <AnnouncementBar
        config={
          config.announcement
        }
      />

      <header className="sticky top-0 z-[var(--ysim-z-sticky)] border-b border-[var(--ysim-color-border)] bg-white/95 backdrop-blur">
        <Container>
          <div className="hidden min-h-[4.5rem] items-center justify-between gap-5 lg:flex">
            <BrandLogo priority />

            <DesktopNavigation
              items={
                config.mainItems
              }
            />

            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitcher
                languages={
                  config.languages
                }
                defaultLocale={
                  config.defaultLocale
                }
              />

              <CartLink
                count={
                  cartCount
                }
              />
            </div>
          </div>

          <MobileHeader
            languages={
              config.languages
            }
            defaultLocale={
              config.defaultLocale
            }
            cartCount={
              cartCount
            }
            onOpenMenu={
              openMobileMenu
            }
          />
        </Container>

        <QuickAccessBar
          config={
            config.quickAccess
          }
        />
      </header>

      <MobileMenuDrawer
        open={
          mobileMenuOpen
        }
        onClose={
          closeMobileMenu
        }
        items={
          config.mainItems
        }
        languages={
          config.languages
        }
        defaultLocale={
          config.defaultLocale
        }
      />
    </>
  );
}
