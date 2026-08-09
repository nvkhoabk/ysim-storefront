import {
  Globe2,
  Headphones,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type {
  HeroBenefitIcon,
  HeroBenefitViewModel,
} from "@/types/view-models/hero";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<HeroBenefitIcon, LucideIcon> = {
    global:
      Globe2,

    instant:
      Zap,

    secure:
      ShieldCheck,

    support:
      Headphones,
  };

export interface HeroBenefitListProps {
  items:
    readonly HeroBenefitViewModel[];
  inverse?: boolean;
  className?: string;
}

export function HeroBenefitList({
  items,
  inverse = false,
  className,
}: HeroBenefitListProps) {
  return (
    <ul
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        className,
      )}
    >
      {items.map(
        (item) => {
          const Icon =
            iconMap[
              item.icon
            ];

          return (
            <li
              key={
                `${item.icon}-${item.label}`
              }
              className={cn(
                "flex items-center gap-2.5 text-sm font-semibold",
                inverse
                  ? "text-white/88"
                  : "text-[var(--ysim-color-text-muted)]",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  inverse
                    ? "bg-white/12 text-white"
                    : "bg-[var(--ysim-color-brand-100)] text-[var(--ysim-color-brand-700)]",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </span>

              <span>
                {item.label}
              </span>
            </li>
          );
        },
      )}
    </ul>
  );
}
