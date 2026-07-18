"use client";

import type { ReactNode } from "react";

import type {
  DestinationContinent,
  DestinationContinentKey,
} from "../types";

export interface ContinentTabsProps {
  items: DestinationContinent[];

  activeContinent: DestinationContinentKey;

  onChange: (
    continent: DestinationContinentKey,
  ) => void;

  renderIcon?: (
    continent: DestinationContinent,
    active: boolean,
  ) => ReactNode;

  ariaLabel?: string;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function ContinentTabs({
  items,
  activeContinent,
  onChange,
  renderIcon,
  ariaLabel = "Lọc điểm đến theo châu lục",
  className,
}: ContinentTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={joinClasses(
        "relative min-w-0",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={joinClasses(
          "flex min-w-0 gap-2 overflow-x-auto pb-1",
          "scrollbar-none snap-x snap-mandatory",
          "lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0",
        )}
      >
        {items.map((continent) => {
          const active =
            continent.key === activeContinent;

          const icon =
            renderIcon?.(continent, active) ??
            continent.icon;

          return (
            <button
              key={continent.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="destination-results"
              tabIndex={active ? 0 : -1}
              onClick={() =>
                onChange(continent.key)
              }
              className={joinClasses(
                "group flex min-h-11 shrink-0 snap-start items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700",
                "lg:w-full",
                active
                  ? "border-green-700 bg-green-700 text-white shadow-sm"
                  : "border-transparent bg-white text-slate-600 hover:border-green-100 hover:bg-green-50 hover:text-green-700",
              )}
            >
              {icon ? (
                <span
                  aria-hidden="true"
                  className={joinClasses(
                    "flex h-6 w-6 shrink-0 items-center justify-center",
                    active
                      ? "text-white"
                      : "text-slate-500 group-hover:text-green-700",
                  )}
                >
                  {icon}
                </span>
              ) : null}

              <span className="whitespace-nowrap">
                <span className="lg:hidden">
                  {continent.shortLabel ??
                    continent.label}
                </span>

                <span className="hidden lg:inline">
                  {continent.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}