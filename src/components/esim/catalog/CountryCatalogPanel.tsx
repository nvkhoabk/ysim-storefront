import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type {
  EsimContinent,
  EsimCountryLink,
  EsimSpecialDestination,
} from "./types";

export interface CountryCatalogPanelProps {
  continents: EsimContinent[];

  specialDestinations: EsimSpecialDestination[];

  renderContinentIcon?: (
    continent: EsimContinent,
  ) => ReactNode;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  renderSpecialIcon?: (
    destination: EsimSpecialDestination,
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

function CountryRow({
  country,
  renderFlag,
}: {
  country: EsimCountryLink;
  renderFlag?: (
    countryCode: string,
  ) => ReactNode;
}) {
  const flag = renderFlag?.(country.code);

  return (
    <Link
      href={country.href}
      className="group flex items-center gap-3 rounded-lg px-1 py-1.5 transition hover:bg-green-50"
    >
      {flag ? (
        <span
          aria-hidden="true"
          className="flex h-5 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm"
        >
          {flag}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="h-4 w-6 shrink-0 rounded-sm border border-slate-200 bg-slate-50"
        />
      )}

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 transition group-hover:text-green-700">
        {country.name}
      </span>
    </Link>
  );
}

function ContinentColumn({
  continent,
  renderContinentIcon,
  renderFlag,
}: {
  continent: EsimContinent;
  renderContinentIcon?: (
    continent: EsimContinent,
  ) => ReactNode;
  renderFlag?: (
    countryCode: string,
  ) => ReactNode;
}) {
  const icon =
    renderContinentIcon?.(continent) ??
    continent.icon;

  return (
    <section className="min-w-0 border-slate-200 px-4 py-2 first:pl-0 lg:border-r lg:last:border-r-0">
      <div className="flex min-h-10 items-center gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-green-700"
          >
            {icon}
          </span>
        ) : null}

        <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-green-700">
          {continent.title}
        </h3>
      </div>

      <div className="mt-4 space-y-1">
        {continent.countries.map(
          (country) => (
            <CountryRow
              key={country.code}
              country={country}
              renderFlag={renderFlag}
            />
          ),
        )}
      </div>

      <Link
        href={continent.href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700 transition hover:text-green-800"
      >
        {continent.totalLabel}

        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4"
        />
      </Link>
    </section>
  );
}

export function CountryCatalogPanel({
  continents,
  specialDestinations,
  renderContinentIcon,
  renderFlag,
  renderSpecialIcon,
  className,
}: CountryCatalogPanelProps) {
  const primaryContinents =
    continents.filter(
      (continent) =>
        continent.key !== "oceania",
    );

  const oceania =
    continents.find(
      (continent) =>
        continent.key === "oceania",
    ) ?? null;

  return (
    <section
      aria-labelledby="country-catalog-title"
      className={joinClasses(
        "min-w-0",
        className,
      )}
    >
      <h2
        id="country-catalog-title"
        className="text-lg font-bold uppercase tracking-[0.04em] text-slate-900"
      >
        Chọn eSIM theo châu lục
      </h2>

      <div className="mt-6 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-y-0">
        {primaryContinents.map(
          (continent) => (
            <ContinentColumn
              key={continent.key}
              continent={continent}
              renderContinentIcon={
                renderContinentIcon
              }
              renderFlag={renderFlag}
            />
          ),
        )}
      </div>

      <div className="mt-8 grid gap-8 border-t border-slate-200 pt-7 lg:grid-cols-[1fr_1.2fr]">
        {oceania ? (
          <ContinentColumn
            continent={oceania}
            renderContinentIcon={
              renderContinentIcon
            }
            renderFlag={renderFlag}
          />
        ) : null}

        <section className="px-4 py-2 lg:border-l lg:border-slate-200">
          <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-green-700">
            Điểm đến đặc biệt
          </h3>

          <div className="mt-4 space-y-2">
            {specialDestinations.map(
              (destination) => {
                const icon =
                  renderSpecialIcon?.(
                    destination,
                  ) ?? destination.icon;

                return (
                  <Link
                    key={destination.id}
                    href={destination.href}
                    className="group flex items-center gap-3 rounded-lg px-1 py-2 transition hover:bg-green-50"
                  >
                    {icon ? (
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center text-green-700"
                      >
                        {icon}
                      </span>
                    ) : null}

                    <span className="text-sm font-medium text-slate-700 transition group-hover:text-green-700">
                      {destination.title}
                    </span>
                  </Link>
                );
              },
            )}
          </div>
        </section>
      </div>
    </section>
  );
}