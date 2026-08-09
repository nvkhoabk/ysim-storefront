import Link from "next/link";

import type {
  ContentCategoryViewModel,
} from "@/types/view-models/content";

import {
  cn,
} from "@/lib/ui/cn";

export interface GuideCategoryNavProps {
  items:
    readonly ContentCategoryViewModel[];
  activeId?: string;
}

export function GuideCategoryNav({
  items,
  activeId =
    "all",
}: GuideCategoryNavProps) {
  return (
    <nav
      aria-label="Danh mục cẩm nang"
      className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map(
        (item) => {
          const active =
            item.id ===
            activeId;

          return (
            <Link
              key={
                item.id
              }
              href={
                item.href
              }
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center rounded-[var(--ysim-radius-pill)] border px-4 py-2 text-sm font-bold transition-[transform,background-color,border-color,color]",
                active
                  ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white"
                  : "border-[var(--ysim-color-border)] bg-white text-[var(--ysim-color-text-muted)] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)] hover:text-[var(--ysim-color-brand-800)]",
              )}
            >
              {item.label}
            </Link>
          );
        },
      )}
    </nav>
  );
}
