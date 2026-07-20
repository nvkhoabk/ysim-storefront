import Link from "next/link";

import type {
  StorefrontNavigationConfig,
} from "@/config/storefront-navigation";

import {
  Container,
} from "@/components/layout";

export interface QuickAccessBarProps {
  config:
    StorefrontNavigationConfig[
      "quickAccess"
    ];
}

export function QuickAccessBar({
  config,
}: QuickAccessBarProps) {
  if (!config.enabled) {
    return null;
  }

  return (
    <div className="border-t border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)]">
      <Container>
        <nav
          aria-label="Điểm đến truy cập nhanh"
          className="flex min-h-10 items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-text-muted)]">
            Phổ biến
          </span>

          {config.items.map(
            (item) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className="shrink-0 rounded-[var(--ysim-radius-pill)] border border-[var(--ysim-color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ysim-color-text)] transition-colors hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </Container>
    </div>
  );
}
