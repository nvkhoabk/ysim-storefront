import type {
  DestinationCategoryOptionViewModel,
  DestinationContinentKey,
} from "@/types/view-models/destination-page";

import {
  cn,
} from "@/lib/ui/cn";

export interface DestinationCategoryNavProps {
  items:
    readonly DestinationCategoryOptionViewModel[];
  value:
    DestinationContinentKey;
  onChange:
    (
      value:
        DestinationContinentKey,
    ) => void;
}

export function DestinationCategoryNav({
  items,
  value,
  onChange,
}: DestinationCategoryNavProps) {
  return (
    <nav
      aria-label="Khu vực điểm đến"
      className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map(
        (item) => {
          const active =
            item.key ===
            value;

          return (
            <button
              key={
                item.key
              }
              type="button"
              aria-pressed={
                active
              }
              onClick={() =>
                onChange(
                  item.key,
                )
              }
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[var(--ysim-radius-pill)] border px-4 py-2 text-sm font-bold transition-[background-color,border-color,color,transform]",
                active
                  ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white"
                  : "border-[var(--ysim-color-border)] bg-white text-[var(--ysim-color-text-muted)] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)] hover:text-[var(--ysim-color-brand-800)]",
              )}
            >
              {item.label}

              {item.count !==
              undefined ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    active
                      ? "bg-white/15 text-white"
                      : "bg-[var(--ysim-color-surface-subtle)] text-[var(--ysim-color-text-soft)]",
                  )}
                >
                  {
                    item.count
                  }
                </span>
              ) : null}
            </button>
          );
        },
      )}
    </nav>
  );
}
