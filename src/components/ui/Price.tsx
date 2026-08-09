import { type HTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

export type PriceSize = "compact" | "default" | "large";

export interface PriceProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  amount: number | string;
  originalAmount?: number | string;
  prefix?: string;
  suffix?: string;
  discountLabel?: string;
  size?: PriceSize;
}

const sizes: Record<PriceSize, string> = {
  compact: "text-base",
  default: "text-xl",
  large: "text-2xl sm:text-3xl",
};

function toNumber(value: number | string): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = value.trim().replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatVnd(value: number | string): string {
  const amount = toNumber(value);
  if (amount === null) return String(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount);
}

export function Price({
  amount,
  originalAmount,
  prefix,
  suffix = "đ",
  discountLabel,
  size = "default",
  className,
  ...props
}: PriceProps) {
  const current = formatVnd(amount);
  const original = originalAmount === undefined ? null : formatVnd(originalAmount);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)} {...props}>
      {prefix ? (
        <span className="text-sm font-medium text-[var(--ysim-color-text-muted)]">{prefix}</span>
      ) : null}

      <span
        className={cn(
          "font-bold tracking-[-0.02em] text-[var(--ysim-color-brand-800)]",
          sizes[size],
        )}
      >
        {current}
        <span className="ml-1 text-[0.72em] font-semibold">{suffix}</span>
      </span>

      {original ? (
        <span className="text-sm text-[var(--ysim-color-text-soft)] line-through">
          {original} {suffix}
        </span>
      ) : null}

      {discountLabel ? (
        <span className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-100)] px-2 py-1 text-xs font-bold text-[var(--ysim-color-brand-800)]">
          {discountLabel}
        </span>
      ) : null}
    </div>
  );
}
