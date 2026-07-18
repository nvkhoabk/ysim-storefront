import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Globe2,
} from "lucide-react";

import type {
  PopularDestination,
} from "../types";

export interface PopularDestinationCardProps {
  destination: PopularDestination;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  priority?: boolean;

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
  price: number,
  currency: string,
): string {
  if (currency === "VND") {
    return `${new Intl.NumberFormat("vi-VN").format(
      price,
    )}đ`;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function PopularDestinationCard({
  destination,
  renderFlag,
  priority = false,
  className,
}: PopularDestinationCardProps) {
  const flag = destination.countryCode
    ? renderFlag?.(destination.countryCode)
    : null;

  return (
    <article
      className={joinClasses(
        "group h-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md",
        className,
      )}
    >
      <Link
        href={destination.href}
        className="flex h-full flex-col"
        aria-label={`Xem eSIM ${destination.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-100 via-white to-emerald-100">
          {destination.imageSrc ? (
            <Image
              src={destination.imageSrc}
              alt={destination.imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 38vw, 220px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <Globe2 className="h-16 w-16 text-green-300" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-4 pt-14">
            <div className="flex items-center gap-2">
              {flag ? (
                <span
                  aria-hidden="true"
                  className="flex h-5 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white"
                >
                  {flag}
                </span>
              ) : destination.countryCode ? (
                <span className="flex h-5 min-w-7 items-center justify-center rounded-sm bg-white px-1 text-[10px] font-bold text-slate-700">
                  {destination.countryCode}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-green-700"
                >
                  <Globe2 className="h-4 w-4" />
                </span>
              )}

              <h3 className="truncate text-lg font-bold text-white">
                {destination.name}
              </h3>
            </div>
          </div>

          {destination.badge ? (
            <span className="absolute left-3 top-3 rounded-md bg-green-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              {destination.badge}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="text-sm text-slate-500">
            {destination.durationLabel}
          </p>

          {destination.networkLabel ? (
            <p className="mt-1 truncate text-xs text-slate-400">
              {destination.networkLabel}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div>
              <p className="text-xs text-slate-500">
                Từ
              </p>

              <p className="text-base font-bold text-slate-950">
                {formatPrice(
                  destination.priceFrom,
                  destination.currency,
                )}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition group-hover:border-green-700 group-hover:bg-green-700 group-hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}