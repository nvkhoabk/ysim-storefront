import { type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type ContainerSize = "content" | "wide" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: ContainerSize;
  children: ReactNode;
}

const sizes: Record<ContainerSize, string> = {
  content: "max-w-[var(--ysim-container-content)]",
  wide: "max-w-[var(--ysim-container-wide)]",
  full: "max-w-none",
};

export function Container({
  as: Component = "div",
  size = "wide",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-[var(--ysim-page-gutter)]",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
