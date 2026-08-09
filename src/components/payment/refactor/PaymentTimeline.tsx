import {
  Check,
  Circle,
  CircleAlert,
  Clock3,
  type LucideIcon,
} from "lucide-react";

import type {
  PaymentTimelineItemViewModel,
  PaymentTimelineState,
} from "@/types/view-models/payment-result";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    PaymentTimelineState,
    LucideIcon
  > = {
    complete:
      Check,

    current:
      Clock3,

    upcoming:
      Circle,

    error:
      CircleAlert,
  };

const iconClassMap:
  Record<
    PaymentTimelineState,
    string
  > = {
    complete:
      "bg-emerald-600 text-white",

    current:
      "bg-[var(--ysim-color-brand-700)] text-white",

    upcoming:
      "border border-[var(--ysim-color-border-strong)] bg-white text-[var(--ysim-color-text-soft)]",

    error:
      "bg-red-600 text-white",
  };

export interface PaymentTimelineProps {
  items:
    readonly PaymentTimelineItemViewModel[];
}

export function PaymentTimeline({
  items,
}: PaymentTimelineProps) {
  return (
    <ol className="space-y-0">
      {items.map(
        (
          item,
          index,
        ) => {
          const Icon =
            iconMap[
              item.state
            ];

          const last =
            index ===
            items.length -
              1;

          return (
            <li
              key={
                item.id
              }
              className="relative flex gap-4"
            >
              {!last ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.1rem] top-10 h-[calc(100%-1rem)] w-px bg-[var(--ysim-color-border-strong)]"
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  iconClassMap[
                    item.state
                  ],
                )}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1 pb-7">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-bold text-[var(--ysim-color-text)]">
                    {
                      item.title
                    }
                  </h3>

                  {item.timeLabel ? (
                    <span className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                      {
                        item.timeLabel
                      }
                    </span>
                  ) : null}
                </div>

                {item.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    {
                      item.description
                    }
                  </p>
                ) : null}
              </div>
            </li>
          );
        },
      )}
    </ol>
  );
}
