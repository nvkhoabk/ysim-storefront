import { type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type SectionVariant = "default" | "subtle" | "highlighted" | "fullBleed";
export type SectionSpacing = "none" | "sm" | "md" | "lg";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: SectionVariant;
  spacing?: SectionSpacing;
  children: ReactNode;
}

const variants: Record<SectionVariant, string> = {
  default: "bg-[var(--ysim-color-background)]",
  subtle: "bg-[var(--ysim-color-surface-subtle)]",
  highlighted: "bg-[var(--ysim-color-surface-highlighted)]",
  fullBleed: "bg-transparent",
};

const spacings: Record<SectionSpacing, string> = {
  none: "",
  sm: "py-[var(--ysim-section-space-sm)]",
  md: "py-[var(--ysim-section-space-md)]",
  lg: "py-[var(--ysim-section-space-lg)]",
};

export function Section({
  as: Component = "section",
  variant = "default",
  spacing = "md",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn("relative w-full", variants[variant], spacings[spacing], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
