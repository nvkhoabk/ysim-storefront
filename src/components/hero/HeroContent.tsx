import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  HeroActionViewModel,
  HeroViewModel,
} from "@/types/view-models/hero";

import {
  cn,
} from "@/lib/ui/cn";

import {
  HeroBenefitList,
} from "./HeroBenefitList";

export interface HeroContentProps {
  hero: HeroViewModel;
  search?: React.ReactNode;
  className?: string;
}

function HeroAction({
  action,
}: {
  action: HeroActionViewModel;
}) {
  const variant =
    action.variant ||
    "primary";

  const className = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border px-6 py-3 text-base font-semibold",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-[var(--ysim-duration-normal)]",
    "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--ysim-color-focus)_25%,transparent)]",
    variant ===
      "primary" &&
      "border-transparent bg-[var(--ysim-color-brand-700)] text-white shadow-[var(--ysim-shadow-sm)] hover:bg-[var(--ysim-color-brand-800)] hover:shadow-[var(--ysim-shadow-md)]",
    variant ===
      "outline" &&
      "border-[var(--ysim-color-brand-700)] bg-transparent text-[var(--ysim-color-brand-800)] hover:bg-[var(--ysim-color-brand-50)]",
    variant ===
      "ghost" &&
      "border-transparent bg-transparent text-[var(--ysim-color-brand-800)] hover:bg-[var(--ysim-color-brand-50)]",
  );

  return (
    <Link
      href={action.href}
      className={
        className
      }
    >
      {action.label}

      <ArrowRight
        aria-hidden="true"
        className="h-4 w-4"
      />
    </Link>
  );
}

export function HeroContent({
  hero,
  search,
  className,
}: HeroContentProps) {
  const inverse =
    hero.variant ===
    "dark";

  const centered =
    hero.alignment ===
    "center";

  return (
    <div
      className={cn(
        "max-w-3xl",
        centered &&
          "mx-auto",
        className,
      )}
    >
      {hero.eyebrow ? (
        <p
          className={cn(
            "text-sm font-bold uppercase tracking-[0.12em]",
            inverse
              ? "text-white/72"
              : "text-[var(--ysim-color-brand-700)]",
          )}
        >
          {hero.eyebrow}
        </p>
      ) : null}

      <h1
        className={cn(
          "mt-4 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em]",
          inverse
            ? "text-white"
            : "text-[var(--ysim-color-text)]",
        )}
      >
        {hero.title}

        {hero.highlightedText ? (
          <>
            {" "}

            <span className="text-[var(--ysim-color-brand-600)]">
              {
                hero.highlightedText
              }
            </span>
          </>
        ) : null}
      </h1>

      {hero.description ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-[var(--ysim-line-height-relaxed)] sm:text-lg",
            centered &&
              "mx-auto",
            inverse
              ? "text-white/75"
              : "text-[var(--ysim-color-text-muted)]",
          )}
        >
          {
            hero.description
          }
        </p>
      ) : null}

      {search ? (
        <div className="mt-7">
          {search}
        </div>
      ) : null}

      {hero.benefits &&
      hero.benefits.length >
        0 ? (
        <HeroBenefitList
          items={
            hero.benefits
          }
          inverse={
            inverse
          }
          className="mt-7"
        />
      ) : null}

      {hero.primaryAction ||
      hero.secondaryAction ? (
        <div
          className={cn(
            "mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap",
            centered &&
              "sm:justify-center",
          )}
        >
          {hero.primaryAction ? (
            <HeroAction
              action={
                hero.primaryAction
              }
            />
          ) : null}

          {hero.secondaryAction ? (
            <HeroAction
              action={
                hero.secondaryAction
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
