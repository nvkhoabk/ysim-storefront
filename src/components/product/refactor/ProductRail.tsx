"use client";

import { useRef } from "react";

import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Container, Section, SectionHeader } from "@/components/layout";

import type { ProductCardViewModel } from "@/types/view-models/product-card";

import { ProductCard } from "./ProductCard";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";

export interface ProductRailProps {
  products: readonly ProductCardViewModel[];
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  sectionId?: string;
  variant?: "default" | "subtle" | "highlighted";
}

export function ProductRail({
  products,
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref = "/esim",
  sectionId,
  variant = "default",
}: ProductRailProps) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  const effectiveActionLabel = actionLabel || t("ordinary.viewAll");
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "previous" | "next") {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left:
        direction === "next"
          ? Math.max(rail.clientWidth * 0.85, 320)
          : -Math.max(rail.clientWidth * 0.85, 320),
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
                aria-label={t("ordinary.previousProducts")}
                onClick={() => scroll("previous")}
                className="hidden h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)] sm:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label={t("ordinary.nextProducts")}
                onClick={() => scroll("next")}
                className="hidden h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)] hover:bg-[var(--ysim-color-brand-50)] sm:inline-flex"
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
          className="grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[minmax(18rem,88vw)] grid-flow-col gap-5 overflow-x-auto pb-4 lg:auto-cols-[minmax(34rem,42rem)] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <div key={product.familyCode} className="snap-start">
              <ProductCard product={product} priority={index < 2} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
