"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import {
  ContinentTabs,
} from "../continent/ContinentTabs";

import {
  DestinationSearch,
} from "../search/DestinationSearch";

import type {
  DestinationContinent,
  DestinationContinentKey,
  DestinationHeroContent,
  DestinationSearchSubmitPayload,
} from "../types";

export interface DestinationHeroProps {
  content: DestinationHeroContent;

  continents: DestinationContinent[];

  searchValue: string;

  activeContinent: DestinationContinentKey;

  onSearchChange: (value: string) => void;

  onSearchSubmit?: (
    payload: DestinationSearchSubmitPayload,
  ) => void;

  onContinentChange: (
    continent: DestinationContinentKey,
  ) => void;

  renderContinentIcon?: (
    continent: DestinationContinent,
    active: boolean,
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

export function DestinationHero({
  content,
  continents,
  searchValue,
  activeContinent,
  onSearchChange,
  onSearchSubmit,
  onContinentChange,
  renderContinentIcon,
  visual,
  className,
}: DestinationHeroProps) {
  return (
    <section
      aria-labelledby="destination-hero-title"
      className={joinClasses(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="relative grid min-h-[320px] lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-7"
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

              <li
                aria-current="page"
                className="font-medium text-slate-700"
              >
                Điểm đến
              </li>
            </ol>
          </nav>

          {content.eyebrow ? (
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-green-700">
              {content.eyebrow}
            </p>
          ) : null}

          <h1
            id="destination-hero-title"
            className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            {content.title}{" "}
            {content.highlightedTitle ? (
              <span className="text-green-700">
                {content.highlightedTitle}
              </span>
            ) : null}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            {content.description}
          </p>

          <DestinationSearch
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder={
              content.searchPlaceholder
            }
            className="mt-7 max-w-xl"
          />
        </div>

        <div className="relative hidden min-h-[320px] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 lg:block">
		  <div
			  aria-hidden="true"
			  className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(34,197,94,0.12),transparent_60%)]"
			/>
          {visual ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-end justify-center p-6"
            >
              {visual}
            </div>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute left-[12%] top-[20%] h-32 w-32 rounded-full bg-green-100/60 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full bg-emerald-100/70 blur-3xl"
              />

              <div className="absolute inset-x-12 bottom-10 top-10 rounded-3xl border border-dashed border-green-200/80 bg-white/30" />
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <ContinentTabs
          items={continents}
          activeContinent={activeContinent}
          onChange={onContinentChange}
          renderIcon={renderContinentIcon}
        />
      </div>
    </section>
  );
}