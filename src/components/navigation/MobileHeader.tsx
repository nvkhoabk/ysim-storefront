import {
  Menu,
} from "lucide-react";

import type {
  LanguageOption,
} from "@/config/storefront-navigation";

import {
  BrandLogo,
} from "./BrandLogo";

import {
  CartLink,
} from "./CartLink";

import {
  LanguageSwitcher,
} from "./LanguageSwitcher";

export interface MobileHeaderProps {
  languages:
    readonly LanguageOption[];
  defaultLocale: string;
  cartCount?: number;
  onOpenMenu: () => void;
}

export function MobileHeader({
  languages,
  defaultLocale,
  cartCount = 0,
  onOpenMenu,
}: MobileHeaderProps) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-2 lg:hidden">
      <button
        type="button"
        aria-label="Mở menu"
        onClick={
          onOpenMenu
        }
        className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] text-[var(--ysim-color-text)] transition-colors hover:bg-[var(--ysim-color-surface-subtle)]"
      >
        <Menu className="h-6 w-6" />
      </button>

      <BrandLogo priority />

      <div className="flex items-center gap-1">
        <LanguageSwitcher
          languages={
            languages
          }
          defaultLocale={
            defaultLocale
          }
          compact
          className="hidden sm:inline-flex"
        />

        <CartLink
          count={
            cartCount
          }
          compact
        />
      </div>
    </div>
  );
}
