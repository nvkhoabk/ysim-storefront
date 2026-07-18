"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  destinationCatalogItems,
} from "@/content/destination/catalog";

import {
  destinationCatalogFilterDefinitions,
  initialDestinationCatalogFilters,
} from "@/content/destination/filters";

import {
  destinationContinents,
  destinationHeroContent,
} from "@/content/destination/navigation";

import {
  popularDestinations,
} from "@/content/destination/popular";

import {
  SiteContainer,
} from "@/components/layout/primitives";

import {
  DestinationCatalogToolbar,
} from "./catalog/DestinationCatalogToolbar";

import {
  DestinationDesktopTable,
} from "./catalog/DestinationDesktopTable";

import {
  DestinationMobileList,
} from "./catalog/DestinationMobileList";

import {
  DestinationHero,
} from "./hero/DestinationHero";

import {
  DestinationHeroIllustration,
} from "./hero/DestinationHeroIllustration";

import {
  PopularDestinationCarousel,
} from "./popular/PopularDestinationCarousel";

import type {
  DestinationCatalogFilterState,
  DestinationFilterChangePayload,
  DestinationSortValue,
} from "./catalog/types";

import type {
  DestinationContinentKey,
} from "./types";

function normalizeSearchValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("vi-VN");
}

const CONTINENT_LABEL_MAP: Record<
  string,
  string
> = {
  asia: "châu á",
  europe: "châu âu",
  "north-america": "bắc mỹ",
  "south-america": "nam mỹ",
  africa: "châu phi",
  oceania: "châu đại dương",
};

export function DestinationPage() {
  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    activeContinent,
    setActiveContinent,
  ] = useState<DestinationContinentKey>(
    "all",
  );

  const [
    catalogFilters,
    setCatalogFilters,
  ] =
    useState<DestinationCatalogFilterState>(
      initialDestinationCatalogFilters,
    );

  const filteredPopularDestinations =
    useMemo(() => {
      const normalizedQuery =
        normalizeSearchValue(searchValue);

      return popularDestinations.filter(
        (destination) => {
          const matchesContinent =
            activeContinent === "all" ||
            destination.continent ===
              activeContinent;

          const matchesSearch =
            normalizedQuery.length === 0 ||
            normalizeSearchValue(
              destination.name,
            ).includes(normalizedQuery) ||
            normalizeSearchValue(
              destination.networkLabel ?? "",
            ).includes(normalizedQuery);

          return (
            matchesContinent &&
            matchesSearch
          );
        },
      );
    }, [
      activeContinent,
      searchValue,
    ]);

  const filteredCatalogItems =
    useMemo(() => {
      const normalizedQuery =
        normalizeSearchValue(searchValue);

      const selectedContinentLabel =
        CONTINENT_LABEL_MAP[
          catalogFilters.continent
        ];

      const filteredItems =
        destinationCatalogItems.filter(
          (item) => {
            const matchesContinent =
              catalogFilters.continent ===
                "all" ||
              normalizeSearchValue(
                item.continentLabel,
              ) ===
                normalizeSearchValue(
                  selectedContinentLabel ?? "",
                );

            const matchesSearch =
              normalizedQuery.length === 0 ||
              normalizeSearchValue(
                item.name,
              ).includes(normalizedQuery) ||
              normalizeSearchValue(
                item.countryCode,
              ).includes(normalizedQuery) ||
              normalizeSearchValue(
                item.continentLabel,
              ).includes(normalizedQuery);

            const matchesDuration =
              catalogFilters.duration ===
                "all" ||
              matchesDurationFilter(
                item.durationLabel,
                catalogFilters.duration,
              );

            const matchesData =
              catalogFilters.data === "all" ||
              matchesDataFilter(
                item.dataLabel,
                catalogFilters.data,
              );

            return (
              matchesContinent &&
              matchesSearch &&
              matchesDuration &&
              matchesData
            );
          },
        );

      return [...filteredItems].sort(
        (first, second) => {
          switch (catalogFilters.sort) {
            case "price-asc":
              return (
                first.priceFrom -
                second.priceFrom
              );

            case "price-desc":
              return (
                second.priceFrom -
                first.priceFrom
              );

            case "name-asc":
              return first.name.localeCompare(
                second.name,
                "vi-VN",
              );

            case "name-desc":
              return second.name.localeCompare(
                first.name,
                "vi-VN",
              );

            case "popular":
            default:
              return 0;
          }
        },
      );
    }, [
      catalogFilters,
      searchValue,
    ]);

  const hasActiveCatalogFilters =
    catalogFilters.continent !== "all" ||
    catalogFilters.duration !== "all" ||
    catalogFilters.data !== "all" ||
    catalogFilters.sort !== "popular";

  const handleContinentChange = (
    continent: DestinationContinentKey,
  ) => {
    setActiveContinent(continent);

    setCatalogFilters((current) => ({
      ...current,
      continent,
    }));
  };

  const handleCatalogFilterChange = ({
    id,
    value,
  }: DestinationFilterChangePayload) => {
    setCatalogFilters((current) => {
      if (id === "sort") {
        return {
          ...current,
          sort:
            value as DestinationSortValue,
        };
      }

      return {
        ...current,
        [id]: value,
      };
    });

    if (id === "continent") {
      setActiveContinent(
        value as DestinationContinentKey,
      );
    }
  };

  const handleResetFilters = () => {
    setCatalogFilters(
      initialDestinationCatalogFilters,
    );

    setActiveContinent("all");
  };

  return (
    <main className="bg-slate-50">
      <section className="py-6 sm:py-8">
        <SiteContainer size="wide">
          <DestinationHero
            content={
              destinationHeroContent
            }
            continents={
              destinationContinents
            }
            searchValue={searchValue}
            activeContinent={
              activeContinent
            }
            onSearchChange={
              setSearchValue
            }
            onSearchSubmit={({
              query,
            }) => {
              setSearchValue(query);
            }}
            onContinentChange={
              handleContinentChange
            }
            visual={
              <DestinationHeroIllustration />
            }
          />

          <section
            id="destination-results"
            className="mt-8 sm:mt-10"
          >
            {filteredPopularDestinations.length >
            0 ? (
              <PopularDestinationCarousel
                destinations={
                  filteredPopularDestinations
                }
              />
            ) : (
              <DestinationEmptyState
                title="Chưa tìm thấy điểm đến phổ biến"
                description="Hãy thử thay đổi từ khóa hoặc chọn một châu lục khác."
              />
            )}
          </section>

          <DestinationCatalogToolbar
            className="mt-10 sm:mt-12"
            resultCount={
              filteredCatalogItems.length
            }
            definitions={
              destinationCatalogFilterDefinitions
            }
            values={catalogFilters}
            hasActiveFilters={
              hasActiveCatalogFilters
            }
            onFilterChange={
              handleCatalogFilterChange
            }
            onReset={
              handleResetFilters
            }
          />

          <DestinationDesktopTable
            className="mt-4"
            items={
              filteredCatalogItems
            }
          />

          <DestinationMobileList
            className="mt-4"
            items={
              filteredCatalogItems
            }
          />
        </SiteContainer>
      </section>
    </main>
  );
}

function DestinationEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h2 className="text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function matchesDurationFilter(
  durationLabel: string,
  filterValue: string,
): boolean {
  const normalizedLabel =
    normalizeSearchValue(durationLabel);

  switch (filterValue) {
    case "1-7":
      return (
        normalizedLabel.includes("1") ||
        normalizedLabel.includes("7")
      );

    case "8-15":
      return normalizedLabel.includes(
        "15",
      );

    case "16-30":
      return normalizedLabel.includes(
        "30",
      );

    case "31-90":
      return (
        normalizedLabel.includes("31") ||
        normalizedLabel.includes("90")
      );

    case "90-plus":
      return normalizedLabel.includes(
        "90",
      );

    case "all":
    default:
      return true;
  }
}

function matchesDataFilter(
  dataLabel: string,
  filterValue: string,
): boolean {
  const normalizedLabel =
    normalizeSearchValue(dataLabel);

  switch (filterValue) {
    case "under-3gb":
      return (
        normalizedLabel.includes(
          "500mb",
        ) ||
        normalizedLabel.includes("1gb") ||
        normalizedLabel.includes("2gb")
      );

    case "3gb-10gb":
      return (
        normalizedLabel.includes("3gb") ||
        normalizedLabel.includes("5gb") ||
        normalizedLabel.includes("10gb")
      );

    case "10gb-30gb":
      return (
        normalizedLabel.includes("10gb") ||
        normalizedLabel.includes("20gb") ||
        normalizedLabel.includes("30gb")
      );

    case "daily":
      return (
        normalizedLabel.includes(
          "/ngày",
        ) ||
        normalizedLabel.includes(
          "mỗi ngày",
        )
      );

    case "unlimited":
      return (
        normalizedLabel.includes(
          "không giới hạn",
        ) ||
        normalizedLabel.includes(
          "unlimited",
        )
      );

    case "all":
    default:
      return true;
  }
}