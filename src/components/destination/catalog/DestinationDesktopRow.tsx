import type { ReactNode } from "react";

import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  DestinationCatalogItem,
} from "./types";

export interface DestinationDesktopRowProps {
  item: DestinationCatalogItem;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;
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

export function DestinationDesktopRow({
  item,
  renderFlag,
}: DestinationDesktopRowProps) {
  const flag = renderFlag?.(
    item.countryCode,
  );

  return (
    <div
      role="row"
      className="grid items-center gap-4 border-b border-slate-100 bg-white px-6 py-4 transition last:border-b-0 hover:bg-green-50/70"
      style={{
        gridTemplateColumns:
          "260px 140px 160px 220px 120px 56px",
      }}
    >
      <div
        role="cell"
        className="flex min-w-0 items-center gap-3"
      >
        {flag ? (
          <span
            aria-hidden="true"
            className="flex h-6 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm"
          >
            {flag}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-6 w-8 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-[10px] font-bold text-slate-600"
          >
            {item.countryCode}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {item.name}
          </p>

          <p className="mt-0.5 text-xs uppercase tracking-[0.04em] text-slate-400">
            {item.countryCode}
          </p>
        </div>
      </div>

      <div
        role="cell"
        className="text-sm text-slate-600"
      >
        {item.continentLabel}
      </div>

      <div
        role="cell"
        className="text-sm text-slate-600"
      >
        {item.durationLabel}
      </div>

      <div
        role="cell"
        className="text-sm text-slate-600"
      >
        {item.dataLabel}
      </div>

      <div
        role="cell"
        className="text-sm font-bold text-green-700"
      >
        {formatPrice(
          item.priceFrom,
          item.currency,
        )}
      </div>

      <div
        role="cell"
        className="flex justify-end"
      >
        <Link
          href={item.href}
          aria-label={`Xem eSIM ${item.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-green-700 hover:bg-green-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Link>
      </div>
    </div>
  );
}