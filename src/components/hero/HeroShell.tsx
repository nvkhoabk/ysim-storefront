import {
  type ReactNode,
} from "react";

import {
  Container,
} from "@/components/layout";

import type {
  HeroAlignment,
  HeroVariant,
} from "@/types/view-models/hero";

import {
  cn,
} from "@/lib/ui/cn";

export interface HeroShellProps {
  children: ReactNode;
  media?: ReactNode;
  variant?: HeroVariant;
  alignment?: HeroAlignment;
  className?: string;
  contentClassName?: string;
  id?: string;
}

const variantClasses:
  Record<HeroVariant, string> = {
    brand:
      "bg-[linear-gradient(135deg,var(--ysim-color-brand-50)_0%,#ffffff_52%,var(--ysim-color-brand-100)_100%)]",

    subtle:
      "bg-[var(--ysim-color-surface-subtle)]",

    dark:
      "bg-[linear-gradient(135deg,var(--ysim-color-brand-950)_0%,var(--ysim-color-brand-800)_100%)] text-white",

    plain:
      "bg-white",
  };

export function HeroShell({
  children,
  media,
  variant = "brand",
  alignment = "left",
  className,
  contentClassName,
  id,
}: HeroShellProps) {
  const centered =
    alignment === "center";

  return (
    <section
      id={id}
      className={cn(
        "relative isolate overflow-hidden",
        variantClasses[
          variant
        ],
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[var(--ysim-color-brand-200)]/45 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--ysim-color-accent-400)]/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.72),transparent_34%)]" />
      </div>

      <Container>
        <div
          className={cn(
            "grid min-h-[34rem] items-center gap-10 py-[var(--ysim-section-space-lg)]",
            media
              ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]"
              : "grid-cols-1",
            centered &&
              "text-center",
            contentClassName,
          )}
        >
          <div
            className={cn(
              "min-w-0",
              centered &&
                "mx-auto max-w-4xl",
            )}
          >
            {children}
          </div>

          {media ? (
            <div className="min-w-0">
              {media}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
