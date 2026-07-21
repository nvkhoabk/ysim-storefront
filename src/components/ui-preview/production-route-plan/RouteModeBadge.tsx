import {
  FlaskConical,
  History,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    ProductionRouteMode,
    LucideIcon
  > = {
    legacy:
      History,

    candidate:
      FlaskConical,

    refactor:
      Rocket,
  };

const classMap:
  Record<
    ProductionRouteMode,
    string
  > = {
    legacy:
      "bg-slate-100 text-slate-700",

    candidate:
      "bg-amber-50 text-amber-900",

    refactor:
      "bg-emerald-50 text-emerald-800",
  };

export function RouteModeBadge({
  mode,
  label,
}: {
  mode:
    ProductionRouteMode;
  label: string;
}) {
  const Icon =
    iconMap[
      mode
    ];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] px-2.5 py-1 text-[11px] font-bold",
        classMap[
          mode
        ],
      )}
    >
      <Icon className="h-3.5 w-3.5" />

      {label}
    </span>
  );
}
