import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--ysim-color-brand-700)] text-white shadow-[var(--ysim-shadow-sm)] hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-800)] hover:shadow-[var(--ysim-shadow-md)] active:translate-y-0",
  secondary:
    "border-transparent bg-[var(--ysim-color-brand-100)] text-[var(--ysim-color-brand-900)] hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-200)] active:translate-y-0",
  outline:
    "border-[var(--ysim-color-brand-700)] bg-transparent text-[var(--ysim-color-brand-700)] hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-50)] active:translate-y-0",
  ghost:
    "border-transparent bg-transparent text-[var(--ysim-color-brand-800)] hover:bg-[var(--ysim-color-brand-50)]",
  link:
    "h-auto border-transparent bg-transparent px-0 text-[var(--ysim-color-brand-700)] underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-[var(--ysim-radius-sm)] px-3.5 py-2 text-sm",
  md: "min-h-11 rounded-[var(--ysim-radius-md)] px-5 py-2.5 text-sm",
  lg: "min-h-12 rounded-[var(--ysim-radius-md)] px-6 py-3 text-base",
  icon: "h-11 w-11 rounded-[var(--ysim-radius-md)] p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      type = "button",
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 border font-semibold",
          "transition-[transform,background-color,border-color,color,box-shadow] duration-[var(--ysim-duration-normal)] ease-[var(--ysim-ease-standard)]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200",
          "disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          leadingIcon
        )}

        {children}
        {!loading && size !== "icon" ? trailingIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
