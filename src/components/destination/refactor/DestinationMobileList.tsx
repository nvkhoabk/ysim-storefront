import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  PackageSearch,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  DestinationCatalogItemViewModel,
} from "@/types/view-models/destination-page";

export interface DestinationMobileListProps {
  items:
    readonly DestinationCatalogItemViewModel[];
}

export function DestinationMobileList({
  items,
}: DestinationMobileListProps) {
  return (
    <div className="space-y-4 lg:hidden">
      {items.map(
        (item) => (
          <article
            key={
              item.slug
            }
            className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-4 shadow-[var(--ysim-shadow-sm)]"
          >
            <div className="flex items-start gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[var(--ysim-color-border)]">
                <Image
                  src={
                    item.flagUrl
                  }
                  alt={`Quốc kỳ ${item.name}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-700)]">
                  {
                    item.continentLabel
                  }
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  <Link
                    href={
                      item.href
                    }
                    className="hover:text-[var(--ysim-color-brand-700)]"
                  >
                    {
                      item.name
                    }
                  </Link>
                </h2>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
              <span className="inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--ysim-color-brand-700)]" />

                {item.durationLabel ||
                  "Nhiều thời hạn"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1.5">
                <PackageSearch className="h-3.5 w-3.5 text-[var(--ysim-color-brand-700)]" />

                {
                  item.productCount ??
                  0
                }{" "}
                gói
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3 border-t border-[var(--ysim-color-border)] pt-4">
              <Price
                prefix="Từ"
                amount={
                  item.priceFrom
                }
                size="compact"
              />

              <Link
                href={
                  item.href
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-3 py-2 text-sm font-bold text-[var(--ysim-color-brand-700)]"
              >
                Xem gói

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ),
      )}
    </div>
  );
}
