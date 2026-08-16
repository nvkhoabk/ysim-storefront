import { type HTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

export type SkeletonShape = "line" | "circle" | "card" | "custom";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
}

const shapes: Record<SkeletonShape, string> = {
  line: "h-4 rounded-[var(--ysim-radius-pill)]",
  circle: "aspect-square rounded-full",
  card: "min-h-40 rounded-[var(--ysim-radius-lg)]",
  custom: "",
};

export function Skeleton({ shape = "line", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-[var(--ysim-color-surface-subtle)]",
        shapes[shape],
        className,
      )}
      {...props}
    />
  );
}
