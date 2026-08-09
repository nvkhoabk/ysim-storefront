import { type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  headingAs?: Extract<ElementType, "h1" | "h2" | "h3">;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  headingAs: Heading = "h2",
  className,
  ...props
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
      {...props}
    >
      <div className={cn("max-w-3xl", centered && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
            {eyebrow}
          </p>
        ) : null}

        <Heading className="text-[var(--ysim-font-size-3xl)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.035em] text-[var(--ysim-color-text)]">
          {title}
        </Heading>

        {description ? (
          <p className="mt-3 text-base leading-[var(--ysim-line-height-relaxed)] text-[var(--ysim-color-text-muted)] sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
