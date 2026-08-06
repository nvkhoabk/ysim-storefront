"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Globe2,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

import { Badge, Price } from "@/components/ui";

import type {
  DestinationBadgeViewModel,
  DestinationCardViewModel,
} from "@/types/view-models/destination";

import { cn } from "@/lib/ui/cn";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import { localizeDurationLabel } from "@/i18n/listing/static-destination.config";

const badgeIconMap: Record<
  NonNullable<DestinationBadgeViewModel["icon"]>,
  LucideIcon
> = {
  sparkles: Sparkles,

  popular: Star,

  global: Globe2,
};

export interface DestinationCardProps {
  destination: DestinationCardViewModel;
  className?: string;
  priority?: boolean;
}

export function DestinationCard({
  destination,
  className,
  priority = false,
}: DestinationCardProps) {
  const { locale } = useStorefrontLocale();
  const t = createListingTranslator(locale);
  const durationLabel = localizeDurationLabel(
    destination.durationLabel,
    locale,
  );
  const badgeLabel = destination.badge
    ? destination.badge.icon === "popular"
      ? t("ordinary.sortPopular")
      : destination.badge.icon === "global"
        ? t("filters.regionGlobal")
        : t("ordinary.featured")
    : undefined;
  const BadgeIcon = destination.badge?.icon
    ? badgeIconMap[destination.badge.icon]
    : null;

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white shadow-[var(--ysim-shadow-sm)]",
        "transition-[transform,box-shadow,border-color] duration-[var(--ysim-duration-normal)] ease-[var(--ysim-ease-standard)]",
        "hover:-translate-y-1 hover:border-[var(--ysim-color-brand-200)] hover:shadow-[var(--ysim-shadow-card-hover)]",
        className,
      )}
    >
      <Link
        href={destination.href}
        aria-label={t("ordinary.destinationLinkAria", {
          name: destination.name,
        })}
        className="relative block aspect-[16/10] overflow-hidden bg-[var(--ysim-color-surface-subtle)]"
      >
        <Image
          src={destination.imageUrl}
          alt={destination.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 22rem"
          className="object-cover"
        />

        <span className="absolute top-4 left-4 inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-[var(--ysim-shadow-sm)]">
          <Image
            src={destination.flagUrl}
            alt={t("ordinary.flagAlt", { name: destination.name })}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </span>

        {destination.badge ? (
          <Badge
            icon={BadgeIcon ? <BadgeIcon /> : undefined}
            className="absolute top-4 right-4 shadow-[var(--ysim-shadow-sm)]"
          >
            {badgeLabel}
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div>
          {destination.regionLabel ? (
            <p className="text-xs font-bold tracking-[0.1em] text-[var(--ysim-color-brand-700)] uppercase">
              {destination.regionLabel}
            </p>
          ) : null}

          <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-[var(--ysim-color-text)]">
            <Link
              href={destination.href}
              className="rounded-[var(--ysim-radius-sm)] hover:text-[var(--ysim-color-brand-700)]"
            >
              {destination.name}
            </Link>
          </h2>

          {destination.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
              {destination.description}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
          {durationLabel ? <span>{durationLabel}</span> : null}

          {destination.productCount !== undefined ? (
            <>
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-[var(--ysim-color-border-strong)]"
              />

              <span>
                {t("ordinary.planCount", {
                  count: destination.productCount,
                })}
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <Price
            prefix={t("ordinary.priceFrom")}
            amount={destination.priceFrom}
          />

          <Link
            href={destination.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--ysim-radius-md)] px-3 py-2 text-sm font-bold text-[var(--ysim-color-brand-700)] transition-colors hover:bg-[var(--ysim-color-brand-50)]"
          >
            {t("common.viewDetails")}

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
