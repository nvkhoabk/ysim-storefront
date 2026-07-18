"use client";

import {
  ListFilter,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import type {
  DestinationCatalogFilterState,
  DestinationFilterChangePayload,
  DestinationFilterDefinition,
} from "./types";

import {
  DestinationFilters,
} from "./DestinationFilters";

export interface DestinationCatalogToolbarProps {
  title?: string;

  resultCount: number;

  definitions: DestinationFilterDefinition[];

  values: DestinationCatalogFilterState;

  hasActiveFilters?: boolean;

  onFilterChange: (
    payload: DestinationFilterChangePayload,
  ) => void;

  onReset?: () => void;

  onOpenAdvancedFilters?: () => void;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function DestinationCatalogToolbar({
  title = "Tất cả điểm đến",
  resultCount,
  definitions,
  values,
  hasActiveFilters = false,
  onFilterChange,
  onReset,
  onOpenAdvancedFilters,
  className,
}: DestinationCatalogToolbarProps) {
  return (
    <section
      aria-labelledby="destination-catalog-title"
      className={joinClasses(
        "rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
            >
              <ListFilter className="h-5 w-5" />
            </span>

            <div>
              <h2
                id="destination-catalog-title"
                className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
              >
                {title}
              </h2>

              <p
                aria-live="polite"
                className="mt-1 text-sm text-slate-500"
              >
                {resultCount > 0
                  ? `${resultCount} điểm đến phù hợp`
                  : "Không có điểm đến phù hợp"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <RotateCcw
                aria-hidden="true"
                className="h-4 w-4"
              />

              <span className="hidden sm:inline">
                Đặt lại
              </span>
            </button>
          ) : null}

          {onOpenAdvancedFilters ? (
            <button
              type="button"
              onClick={onOpenAdvancedFilters}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <SlidersHorizontal
                aria-hidden="true"
                className="h-4 w-4"
              />

              Bộ lọc
            </button>
          ) : null}
        </div>
      </div>

      <div className="hidden border-t border-slate-200 px-5 py-5 sm:px-6 lg:block">
        <DestinationFilters
          definitions={definitions}
          values={values}
          onChange={onFilterChange}
        />
      </div>

      <div className="border-t border-slate-200 lg:hidden">
        <div className="overflow-x-auto px-5 py-4 sm:px-6">
          <DestinationFilters
            definitions={definitions}
            values={values}
            onChange={onFilterChange}
            compact
          />
        </div>
      </div>
    </section>
  );
}