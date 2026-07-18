"use client";

import type {
  ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronDown,
  ListFilter,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

import {
  DestinationProductSearch,
} from "./DestinationProductSearch";

import type {
  DestinationProductHeroContent,
  DestinationProductSearchPayload,
  DestinationProductSortOption,
  DestinationProductSortValue,
} from "./types";

export interface DestinationProductHeroProps {
  content: DestinationProductHeroContent;

  searchValue: string;

  sortValue: DestinationProductSortValue;

  sortOptions: DestinationProductSortOption[];

  onSearchChange: (value: string) => void;

  onSearchSubmit?: (
    payload: DestinationProductSearchPayload,
  ) => void;

  onSortChange: (
    value: DestinationProductSortValue,
  ) => void;

  onOpenFilters?: () => void;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  visual?: ReactNode;

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
    return `${new Intl.NumberFormat(
      "vi-VN",
    ).format(price)}đ`;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function DestinationProductHero({
  content,
  searchValue,
  sortValue,
  sortOptions,
  onSearchChange,
  onSearchSubmit,
  onSortChange,
  onOpenFilters,
  renderFlag,
  visual,
  className,
}: DestinationProductHeroProps) {
  const flag = renderFlag?.(
    content.countryCode,
  );

  const hasImage =
    Boolean(content.imageSrc) ||
    Boolean(visual);

  return (
    <section
      aria-labelledby="destination-product-title"
      className={joinClasses(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-6"
          >
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-green-700"
                >
                  Trang chủ
                </Link>
              </li>

              <li aria-hidden="true">
                /
              </li>

              <li>
                <Link
                  href="/destinations"
                  className="transition hover:text-green-700"
                >
                  Điểm đến
                </Link>
              </li>

              <li aria-hidden="true">
                /
              </li>

              <li
                aria-current="page"
                className="font-medium text-slate-700"
              >
                {content.destinationName}
              </li>
            </ol>
          </nav>

          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {flag ? (
                <span className="flex h-full w-full items-center justify-center overflow-hidden">
                  {flag}
                </span>
              ) : (
                <span className="text-sm font-bold uppercase tracking-[0.08em] text-slate-600">
                  {content.countryCode}
                </span>
              )}
            </div>

            <div className="min-w-0">
              {content.badge ? (
                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {content.badge}
                </span>
              ) : null}

              <h1
                id="destination-product-title"
                className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
              >
                eSIM {content.destinationName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  {content.continentLabel}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <ListFilter
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  {content.packageCount} gói eSIM
                </span>
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {content.description}
          </p>

          {typeof content.startingPrice ===
            "number" &&
          content.currency ? (
            <p className="mt-5 text-sm text-slate-500">
              Giá từ{" "}
              <strong className="text-lg font-bold text-green-700">
                {formatPrice(
                  content.startingPrice,
                  content.currency,
                )}
              </strong>
            </p>
          ) : null}
        </div>

        <div
          className={joinClasses(
            "relative hidden min-h-[360px] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 lg:block",
            !hasImage &&
              "border-l border-slate-100",
          )}
        >
          {visual ? (
            <div
              aria-hidden="true"
              className="absolute inset-0"
            >
              {visual}
            </div>
          ) : content.imageSrc ? (
            <Image
              src={content.imageSrc}
              alt={
                content.imageAlt ??
                `Điểm đến ${content.destinationName}`
              }
              fill
              priority
              sizes="420px"
              className="object-cover"
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute left-[12%] top-[18%] h-32 w-32 rounded-full bg-green-200/50 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="absolute bottom-[10%] right-[8%] h-44 w-44 rounded-full bg-emerald-200/50 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="absolute inset-8 rounded-3xl border border-dashed border-green-200 bg-white/30"
              />
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_220px_auto]">
          <DestinationProductSearch
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />

          <label className="relative block">
            <span className="sr-only">
              Sắp xếp gói eSIM
            </span>

            <select
              value={sortValue}
              onChange={(event) => {
                onSortChange(
                  event.target
                    .value as DestinationProductSortValue,
                );
              }}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-green-600 focus:ring-4 focus:ring-green-100"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
          </label>

          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <SlidersHorizontal
              aria-hidden="true"
              className="h-4 w-4"
            />

            Bộ lọc
          </button>
        </div>
      </div>
    </section>
  );
}