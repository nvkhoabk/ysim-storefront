import {
  Check,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";

import type {
  PreviewViewportViewModel,
} from "@/types/view-models/ui-preview-registry";

const iconMap:
  Readonly<
    Record<
      string,
      LucideIcon
    >
  > = {
    mobile:
      Smartphone,

    tablet:
      Tablet,

    desktop:
      Monitor,
  };

export function PreviewViewportMatrix({
  items,
}: {
  items:
    readonly PreviewViewportViewModel[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map(
        (item) => {
          const Icon =
            iconMap[
              item.id
            ] ||
            Monitor;

          return (
            <article
              key={
                item.id
              }
              className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                  <Icon className="h-5 w-5" />
                </span>

                <span className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1 text-xs font-bold text-[var(--ysim-color-text-muted)]">
                  {
                    item.width
                  }
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[var(--ysim-color-text)]">
                {
                  item.label
                }
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                {
                  item.description
                }
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[var(--ysim-color-text-muted)]">
                {item.checks.map(
                  (check) => (
                    <li
                      key={
                        check
                      }
                      className="flex items-start gap-2"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

                      {check}
                    </li>
                  ),
                )}
              </ul>
            </article>
          );
        },
      )}
    </div>
  );
}
