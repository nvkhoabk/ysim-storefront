// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import Link from "next/link";

import type { NavigationItem } from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";

import { MegaMenu } from "./MegaMenu";

export interface DesktopNavigationProps {
  items: readonly NavigationItem[];
  ariaLabel?: string;
}

export function DesktopNavigation({
  items,
  ariaLabel = DEFAULT_LOCALIZED_SHELL_LABELS.mainNavigation,
}: DesktopNavigationProps) {
  return (
    <nav aria-label={ariaLabel} className="hidden items-center gap-1 lg:flex">
      {items.map((item) =>
        item.groups ? (
          <MegaMenu key={item.label} item={item} />
        ) : item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className="inline-flex h-11 items-center rounded-[var(--ysim-radius-md)] px-3 text-sm font-semibold text-[var(--ysim-color-text)] transition-colors hover:bg-[var(--ysim-color-surface-subtle)] hover:text-[var(--ysim-color-brand-800)]"
          >
            {item.label}
          </Link>
        ) : null,
      )}
    </nav>
  );
}
