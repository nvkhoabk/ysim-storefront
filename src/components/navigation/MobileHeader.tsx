// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import { Menu } from "lucide-react";

import type { LanguageOption } from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import type {
  LocalizedShellLabels,
  ShellLanguageSwitchConfig,
  ShellLocale,
} from "@/i18n/shell/shell.types";

import { BrandLogo } from "./BrandLogo";
import { CartLink } from "./CartLink";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface MobileHeaderProps {
  languages: readonly LanguageOption[];
  currentLocale: ShellLocale;
  labels?: LocalizedShellLabels;
  switchConfig?: ShellLanguageSwitchConfig;
  cartCount?: number;
  cartHref?: string;
  homeHref?: string;
  onOpenMenu: () => void;
}

export function MobileHeader({
  languages,
  currentLocale,
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
  switchConfig = { mode: "display" },
  cartCount = 0,
  cartHref = "/cart",
  homeHref = "/",
  onOpenMenu,
}: MobileHeaderProps) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-2 lg:hidden">
      <button
        type="button"
        aria-label={labels.openMenu}
        onClick={onOpenMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] text-[var(--ysim-color-text)] transition-colors hover:bg-[var(--ysim-color-surface-subtle)]"
      >
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>
      <BrandLogo href={homeHref} label={labels.brandHome} priority />
      <div className="flex items-center gap-1">
        <LanguageSwitcher
          languages={languages}
          currentLocale={currentLocale}
          labels={labels}
          switchConfig={switchConfig}
          compact
          className="hidden sm:inline-flex"
        />
        <CartLink count={cartCount} href={cartHref} labels={labels} compact />
      </div>
    </div>
  );
}
