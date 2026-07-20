import Link from "next/link";

import type {
  NavigationItem,
} from "@/config/storefront-navigation";

import {
  MegaMenu,
} from "./MegaMenu";

export interface DesktopNavigationProps {
  items:
    readonly NavigationItem[];
}

export function DesktopNavigation({
  items,
}: DesktopNavigationProps) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden items-center gap-1 lg:flex"
    >
      {items.map(
        (item) =>
          item.groups ? (
            <MegaMenu
              key={
                item.label
              }
              item={item}
            />
          ) : item.href ? (
            <Link
              key={
                item.label
              }
              href={
                item.href
              }
              className="inline-flex h-11 items-center rounded-[var(--ysim-radius-md)] px-3 text-sm font-semibold text-[var(--ysim-color-text)] transition-colors hover:bg-[var(--ysim-color-surface-subtle)] hover:text-[var(--ysim-color-brand-800)]"
            >
              {
                item.label
              }
            </Link>
          ) : null,
      )}
    </nav>
  );
}
