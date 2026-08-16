import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type BadgeVariant = "soft" | "solid" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  soft:
    "border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-800)]",
  solid:
    "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white",
  outline:
    "border-[var(--ysim-color-brand-300)] bg-transparent text-[var(--ysim-color-brand-800)]",
};

export function Badge({ variant = "soft", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-[var(--ysim-radius-pill)] border px-2.5 py-1 text-xs font-semibold leading-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="[&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
