"use client";

import { useRef } from "react";

import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Container, Section, SectionHeader } from "@/components/layout";

import type { DestinationCardViewModel } from "@/types/view-models/destination";

import { DestinationCard } from "./DestinationCard";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";

export interface DestinationRailProps {
  destinations: readonly DestinationCardViewModel[];
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  sectionId?: string;
  variant?: "default" | "subtle" | "highlighted";
}

export function DestinationRail({
  destinations,
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref = "/destinations",
  sectionId,
  variant = "default",
}: DestinationRailProps) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  const effectiveActionLabel = actionLabel || t("ordinary.viewAll");
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "previous" | "next") {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const amount = Math.max(rail.clientWidth * 0.8, 280);

    rail.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <Section id={sectionId} variant={variant}>
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t("ordinary.previousDestinations")}
                onClick={() => scroll("previous")}
                className="hidden h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white text-[var(--ysim-color-text)] transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)] sm:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label={t("ordinary.nextDestinations")}
                onClick={() => scroll("next")}
                className="hidden h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white text-[var(--ysim-color-text)] transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)] sm:inline-flex"
              >
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href={actionHref}
                className="inline-flex min-h-10 items-center gap-2 rounded-[var(--ysim-radius-md)] px-3 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
              >
                {effectiveActionLabel}

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        <div
          ref={railRef}
          className="grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[minmax(17rem,82vw)] grid-flow-col gap-5 overflow-x-auto pb-4 sm:auto-cols-[minmax(18rem,22rem)] lg:auto-cols-[minmax(19rem,22rem)] [&::-webkit-scrollbar]:hidden"
        >
          {destinations.map((destination, index) => (
            <div key={destination.slug} className="snap-start">
              <DestinationCard destination={destination} priority={index < 2} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
