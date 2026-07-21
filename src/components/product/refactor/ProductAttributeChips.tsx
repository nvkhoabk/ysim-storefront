import {
  CalendarDays,
  Database,
} from "lucide-react";

import {
  cn,
} from "@/lib/ui/cn";

export interface ProductAttributeChipsProps {
  dataLabel: string;
  durationLabel: string;
  className?: string;
}

export function ProductAttributeChips({
  dataLabel,
  durationLabel,
  className,
}: ProductAttributeChipsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
        <Database
          aria-hidden="true"
          className="h-3.5 w-3.5 text-[var(--ysim-color-brand-700)]"
        />

        {dataLabel}
      </span>

      <span className="inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
        <CalendarDays
          aria-hidden="true"
          className="h-3.5 w-3.5 text-[var(--ysim-color-brand-700)]"
        />

        {durationLabel}
      </span>
    </div>
  );
}
