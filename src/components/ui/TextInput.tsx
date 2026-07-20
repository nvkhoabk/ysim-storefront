"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/ui/cn";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  containerClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      id,
      label,
      helperText,
      error,
      startAdornment,
      endAdornment,
      containerClassName,
      className,
      disabled,
      required,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]"
          >
            {label}
            {required ? (
              <span aria-hidden="true" className="ml-1 text-[var(--ysim-color-danger)]">
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-[var(--ysim-radius-md)] border bg-white px-3.5",
            "transition-[border-color,box-shadow,background-color] duration-[var(--ysim-duration-fast)]",
            "focus-within:border-[var(--ysim-color-brand-600)] focus-within:ring-4 focus-within:ring-green-100",
            error
              ? "border-[var(--ysim-color-danger)] bg-[var(--ysim-color-danger-soft)]"
              : "border-[var(--ysim-color-border-strong)]",
            disabled &&
              "cursor-not-allowed bg-[var(--ysim-color-surface-subtle)] opacity-65",
          )}
        >
          {startAdornment ? (
            <span
              aria-hidden="true"
              className="shrink-0 text-[var(--ysim-color-text-muted)] [&>svg]:h-5 [&>svg]:w-5"
            >
              {startAdornment}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId || helperId}
            className={cn(
              "min-w-0 flex-1 bg-transparent py-2.5 text-base text-[var(--ysim-color-text)] outline-none",
              "placeholder:text-[var(--ysim-color-text-soft)] disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {endAdornment ? (
            <span
              aria-hidden="true"
              className="shrink-0 text-[var(--ysim-color-text-muted)] [&>svg]:h-5 [&>svg]:w-5"
            >
              {endAdornment}
            </span>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-[var(--ysim-color-danger)]">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-2 text-sm text-[var(--ysim-color-text-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
