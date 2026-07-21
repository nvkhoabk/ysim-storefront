import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";

import type {
  PaymentResultStatus,
} from "@/types/view-models/payment-result";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    PaymentResultStatus,
    LucideIcon
  > = {
    success:
      CheckCircle2,

    failed:
      CircleAlert,

    pending:
      Clock3,

    processing:
      LoaderCircle,
  };

const classMap:
  Record<
    PaymentResultStatus,
    string
  > = {
    success:
      "bg-emerald-50 text-emerald-800",

    failed:
      "bg-red-50 text-red-800",

    pending:
      "bg-amber-50 text-amber-900",

    processing:
      "bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-800)]",
  };

export interface PaymentStatusBadgeProps {
  status:
    PaymentResultStatus;
  label: string;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  label,
  className,
}: PaymentStatusBadgeProps) {
  const Icon =
    iconMap[
      status
    ];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] px-3 py-1.5 text-xs font-bold",
        classMap[
          status
        ],
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "h-4 w-4",
          status ===
          "processing"
            ? "animate-spin"
            : "",
        )}
      />

      {label}
    </span>
  );
}
