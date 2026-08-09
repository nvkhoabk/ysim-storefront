import {
  CircleDashed,
  Code2,
  CreditCard,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type {
  ProductionRouteReadiness,
} from "@/types/view-models/production-route-plan";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    ProductionRouteReadiness,
    LucideIcon
  > = {
    planned:
      CircleDashed,

    "ui-ready":
      ShieldCheck,

    "adapter-required":
      Code2,

    "payment-blocked":
      CreditCard,
  };

const classMap:
  Record<
    ProductionRouteReadiness,
    string
  > = {
    planned:
      "border-slate-200 bg-white text-slate-700",

    "ui-ready":
      "border-emerald-200 bg-emerald-50 text-emerald-800",

    "adapter-required":
      "border-blue-200 bg-blue-50 text-blue-800",

    "payment-blocked":
      "border-red-200 bg-red-50 text-red-800",
  };

export function RouteReadinessBadge({
  readiness,
  label,
}: {
  readiness:
    ProductionRouteReadiness;
  label: string;
}) {
  const Icon =
    iconMap[
      readiness
    ];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] border px-2.5 py-1 text-[11px] font-bold",
        classMap[
          readiness
        ],
      )}
    >
      <Icon className="h-3.5 w-3.5" />

      {label}
    </span>
  );
}
