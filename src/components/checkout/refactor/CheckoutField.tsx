import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/ui/cn";

export interface CheckoutFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size"
  > {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export function CheckoutField({
  label,
  error,
  icon,
  className,
  id,
  ...inputProps
}: CheckoutFieldProps) {
  const fieldId =
    id ||
    inputProps.name;

  const errorId =
    fieldId
      ? `${fieldId}-error`
      : undefined;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
        {label}
      </span>

      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[var(--ysim-color-text-soft)] [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        ) : null}

        <input
          {...inputProps}
          id={
            fieldId
          }
          aria-invalid={
            error
              ? true
              : undefined
          }
          aria-describedby={
            error
              ? errorId
              : undefined
          }
          className={cn(
            "min-h-12 w-full rounded-[var(--ysim-radius-md)] border bg-white px-3.5 text-sm font-semibold text-[var(--ysim-color-text)] outline-none transition-[border-color,box-shadow]",
            icon
              ? "pl-10"
              : "",
            error
              ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100"
              : "border-[var(--ysim-color-border-strong)] focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]",
            className,
          )}
        />
      </span>

      {error ? (
        <span
          id={
            errorId
          }
          className="mt-2 block text-sm font-semibold text-red-700"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
