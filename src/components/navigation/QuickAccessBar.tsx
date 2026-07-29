// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import Link from "next/link";

import { Container } from "@/components/layout";
import type { StorefrontNavigationConfig } from "@/config/storefront-navigation";
import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import type { LocalizedShellLabels } from "@/i18n/shell/shell.types";

export interface QuickAccessBarProps {
  config: StorefrontNavigationConfig["quickAccess"];
  labels?: Pick<
    LocalizedShellLabels,
    "quickAccessNavigation" | "quickAccessPopular"
  >;
}

export function QuickAccessBar({
  config,
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
}: QuickAccessBarProps) {
  if (!config.enabled) return null;

  return (
    <div className="border-t border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)]">
      <Container>
        <nav
          aria-label={labels.quickAccessNavigation}
          className="flex min-h-10 [scrollbar-width:none] items-center gap-2 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden"
        >
          <span className="mr-1 shrink-0 text-xs font-bold tracking-[0.1em] text-[var(--ysim-color-text-muted)] uppercase">
            {labels.quickAccessPopular}
          </span>
          {config.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-[var(--ysim-radius-pill)] border border-[var(--ysim-color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ysim-color-text)] transition-colors hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  );
}
