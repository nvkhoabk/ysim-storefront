import type { ReactNode } from "react";

import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

import type {
  DestinationCatalogItem,
} from "./types";

export interface DestinationMobileCardProps {
  item: DestinationCatalogItem;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(
  value: number,
  currency: string,
): string {
  if (currency === "VND") {
    return `${new Intl.NumberFormat(
      "vi-VN",
    ).format(value)}đ`;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DestinationMobileCard({
  item,
  renderFlag,
  className,
}: DestinationMobileCardProps) {
  const flag = renderFlag?.(
    item.countryCode,
  );

  return (
    <article
      className={joinClasses(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <Link
        href={item.href}
        aria-label={`Xem eSIM ${item.name}`}
        className="group flex min-h-24 items-center gap-4 px-4 py-4 transition hover:bg-green-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
      >
        <div
          aria-hidden="true"
          className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"
        >
          {flag ? (
            <span className="flex h-full w-full items-center justify-center overflow-hidden">
              {flag}
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
              {item.countryCode}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950 transition group-hover:text-green-700">
                {item.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {item.continentLabel}
              </p>
            </div>

            <ChevronRight
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-green-700"
            />
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">
                {item.durationLabel}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {item.dataLabel}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500">
                Từ
              </p>

              <p className="mt-0.5 text-base font-bold text-green-700">
                {formatPrice(
                  item.priceFrom,
                  item.currency,
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}