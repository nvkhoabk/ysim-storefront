// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

import type {
  LanguageOption,
  NavigationItem,
} from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import type {
  LocalizedShellLabels,
  ShellLanguageSwitchConfig,
  ShellLocale,
} from "@/i18n/shell/shell.types";

import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  items: readonly NavigationItem[];
  languages: readonly LanguageOption[];
  currentLocale: ShellLocale;
  labels?: LocalizedShellLabels;
  switchConfig?: ShellLanguageSwitchConfig;
  homeHref?: string;
}

export function MobileMenuDrawer({
  open,
  onClose,
  items,
  languages,
  currentLocale,
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
  switchConfig = { mode: "display" },
  homeHref = "/",
}: MobileMenuDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--ysim-z-drawer)] lg:hidden">
      <button
        type="button"
        aria-label={labels.closeMenu}
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.mobileMenuDialog}
        className="absolute inset-y-0 left-0 flex w-[min(90vw,24rem)] flex-col bg-white shadow-[var(--ysim-shadow-md)]"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-[var(--ysim-color-border)] px-4">
          <BrandLogo href={homeHref} label={labels.brandHome} />
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] hover:bg-[var(--ysim-color-surface-subtle)]"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <nav
          aria-label={labels.mobileNavigation}
          className="flex-1 overflow-y-auto px-4 py-5"
        >
          <div className="space-y-2">
            {items.map((item) =>
              item.groups ? (
                <details
                  key={item.label}
                  className="group rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)]"
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <div className="border-t border-[var(--ysim-color-border)] px-3 py-3">
                    {item.groups.map((group) => (
                      <div key={group.label} className="mb-4 last:mb-0">
                        <p className="mb-1 px-2 text-xs font-bold tracking-[0.1em] text-[var(--ysim-color-brand-700)] uppercase">
                          {group.label}
                        </p>
                        {group.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className="block rounded-[var(--ysim-radius-sm)] px-2 py-2.5 text-sm font-medium hover:bg-[var(--ysim-color-brand-50)]"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              ) : item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-12 items-center justify-between rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] px-4 py-3 font-semibold"
                >
                  {item.label}
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              ) : null,
            )}
          </div>
        </nav>
        <div className="border-t border-[var(--ysim-color-border)] p-4">
          <LanguageSwitcher
            languages={languages}
            currentLocale={currentLocale}
            labels={labels}
            switchConfig={switchConfig}
            className="w-full justify-between border-[var(--ysim-color-border)]"
          />
        </div>
      </div>
    </div>
  );
}
