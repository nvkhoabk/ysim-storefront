import {
  CheckCircle2,
  ExternalLink,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type {
  PreviewPackageStatus,
} from "@/types/view-models/ui-preview-registry";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    PreviewPackageStatus,
    LucideIcon
  > = {
    ready:
      CheckCircle2,

    hotfix:
      Wrench,

    external:
      ExternalLink,
  };

const classMap:
  Record<
    PreviewPackageStatus,
    string
  > = {
    ready:
      "bg-emerald-50 text-emerald-800",

    hotfix:
      "bg-amber-50 text-amber-900",

    external:
      "bg-slate-100 text-slate-700",
  };

export function PreviewStatusBadge({
  status,
  label,
  className,
}: {
  status:
    PreviewPackageStatus;
  label: string;
  className?: string;
}) {
  const Icon =
    iconMap[
      status
    ];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] px-2.5 py-1 text-[11px] font-bold",
        classMap[
          status
        ],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />

      {label}
    </span>
  );
}
