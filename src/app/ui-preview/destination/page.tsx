"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  DestinationCatalogToolbar,
  DestinationDesktopTable,
  DestinationHero,
  PopularDestinationCarousel,
  DestinationMobileList,
} from "@/components/destination";

import type {
  DestinationCatalogFilterState,
  DestinationContinentKey,
  DestinationFilterChangePayload,
  DestinationSortValue,
} from "@/components/destination";

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

function normalizeSearchValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("vi-VN");
}

export default function DestinationPreviewPage() {
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

      const filtered =
        destinationCatalogItems.filter(
          (item) => {
            const continentMap: Record<
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

            const selectedContinentLabel =
              continentMap[
                catalogFilters.continent
              ];

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

            return (
              matchesContinent &&
              matchesSearch
            );
          },
        );

      return [...filtered].sort(
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
      catalogFilters.continent,
      catalogFilters.sort,
      searchValue,
    ]);

  const hasActiveCatalogFilters =
    catalogFilters.continent !== "all" ||
    catalogFilters.duration !== "all" ||
    catalogFilters.data !== "all" ||
    catalogFilters.sort !== "popular";

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

  const handleContinentChange = (
    continent: DestinationContinentKey,
  ) => {
    setActiveContinent(continent);

    setCatalogFilters((current) => ({
      ...current,
      continent,
    }));
  };

  const handleResetFilters = () => {
    setCatalogFilters(
      initialDestinationCatalogFilters,
    );

    setActiveContinent("all");
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <SiteContainer size="wide">
        <DestinationHero
          content={destinationHeroContent}
          continents={destinationContinents}
          searchValue={searchValue}
          activeContinent={activeContinent}
          onSearchChange={setSearchValue}
          onSearchSubmit={({ query }) => {
            setSearchValue(query);
          }}
          onContinentChange={
            handleContinentChange
          }
        />

        <section
          id="destination-results"
          className="mt-8"
        >
          {filteredPopularDestinations.length >
          0 ? (
            <PopularDestinationCarousel
              destinations={
                filteredPopularDestinations
              }
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h2 className="text-xl font-bold text-slate-950">
                Chưa tìm thấy điểm đến
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Hãy thử thay đổi từ khóa hoặc chọn
                một châu lục khác.
              </p>
            </div>
          )}
        </section>

        <DestinationCatalogToolbar
          className="mt-10"
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
          onReset={handleResetFilters}
          onOpenAdvancedFilters={() => {
            console.log(
              "Open advanced destination filters",
            );
          }}
        />

        <DestinationDesktopTable
          className="mt-4"
          items={filteredCatalogItems}
        />
		<DestinationMobileList
		  className="mt-4"
		  items={filteredCatalogItems}
		/>
      </SiteContainer>
    </main>
  );
}