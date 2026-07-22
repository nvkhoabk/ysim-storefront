"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  SearchX,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  DestinationCatalogFilterState,
  DestinationCatalogItemViewModel,
  DestinationCatalogSectionViewModel,
  DestinationContinentKey,
  DestinationDataFilter,
  DestinationDurationFilter,
  DestinationRouteSelectionViewModel,
  DestinationSortValue,
} from "@/types/view-models/destination-page";

import {
  createDestinationInitialFilters,
} from "@/lib/storefront/navigation/destination-query";

import {
  DestinationCatalogToolbar,
} from "./DestinationCatalogToolbar";

import {
  DestinationCategoryNav,
} from "./DestinationCategoryNav";

import {
  DestinationDesktopTable,
} from "./DestinationDesktopTable";

import {
  DestinationMobileList,
} from "./DestinationMobileList";

import {
  DestinationSelectionNotice,
} from "./DestinationSelectionNotice";

function normalize(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

function toPrice(
  value:
    | number
    | string,
): number {
  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  const parsed =
    Number(
      value.replace(
        /[^\d.-]/g,
        "",
      ),
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : Number.MAX_SAFE_INTEGER;
}

function matchesDuration(
  item:
    DestinationCatalogItemViewModel,
  filter:
    DestinationDurationFilter,
): boolean {
  if (
    filter === "all"
  ) {
    return true;
  }

  const min =
    item.minDurationDays ??
    0;

  const max =
    item.maxDurationDays ??
    min;

  if (
    filter === "1-5"
  ) {
    return (
      min <= 5 &&
      max >= 1
    );
  }

  if (
    filter === "6-10"
  ) {
    return (
      min <= 10 &&
      max >= 6
    );
  }

  return (
    min <= 30 &&
    max >= 11
  );
}

export interface DestinationCatalogProps {
  section:
    DestinationCatalogSectionViewModel;
  initialSelection?:
    DestinationRouteSelectionViewModel;
}

export function DestinationCatalog({
  section,
  initialSelection,
}: DestinationCatalogProps) {
  const [
    filters,
    setFilters,
  ] =
    useState<DestinationCatalogFilterState>(
      () =>
        createDestinationInitialFilters(
          section.initialFilters,
          initialSelection,
        ),
    );

  const [
    selectedDestinationSlug,
    setSelectedDestinationSlug,
  ] =
    useState<
      string | undefined
    >(
      initialSelection
        ?.kind ===
        "destination"
          ? initialSelection
              .destinationSlug
          : undefined,
    );

  const categories =
    useMemo(
      () =>
        section.categories.map(
          (category) => ({
            ...category,

            count:
              category.key ===
              "all"
                ? section.items
                    .length
                : section.items.filter(
                    (item) =>
                      item.continent ===
                      category.key,
                  ).length,
          }),
        ),
      [
        section.categories,
        section.items,
      ],
    );

  const filteredItems =
    useMemo(() => {
      const query =
        normalize(
          filters.query,
        );

      const next =
        section.items.filter(
          (item) => {
            const matchesQuery =
              !query ||
              normalize(
                [
                  item.name,
                  item.description,
                  item.continentLabel,
                ]
                  .filter(Boolean)
                  .join(" "),
              ).includes(
                query,
              );

            const matchesContinent =
              filters.continent ===
                "all" ||
              item.continent ===
                filters.continent;

            const matchesSelectedDestination =
              !selectedDestinationSlug ||
              item.slug ===
                selectedDestinationSlug;

            const matchesData =
              filters.data ===
                "all" ||
              item.dataKinds.includes(
                filters.data,
              );

            return (
              matchesQuery &&
              matchesContinent &&
              matchesSelectedDestination &&
              matchesData &&
              matchesDuration(
                item,
                filters.duration,
              )
            );
          },
        );

      return [...next].sort(
        (left, right) => {
          if (
            filters.sort ===
            "price-asc"
          ) {
            return (
              toPrice(
                left.priceFrom,
              ) -
              toPrice(
                right.priceFrom,
              )
            );
          }

          if (
            filters.sort ===
            "name-asc"
          ) {
            return left.name.localeCompare(
              right.name,
              "vi",
            );
          }

          return (
            right.popularity -
            left.popularity
          );
        },
      );
    }, [
      filters,
      section.items,
      selectedDestinationSlug,
    ]);

  function updateFilter<
    Key extends
      keyof DestinationCatalogFilterState,
  >(
    key: Key,
    value:
      DestinationCatalogFilterState[
        Key
      ],
  ) {
    setSelectedDestinationSlug(
      undefined,
    );

    setFilters(
      (current) => ({
        ...current,
        [key]:
          value,
      }),
    );
  }

  return (
    <Section
      id="destination-catalog"
      variant="subtle"
    >
      <Container>
        <SectionHeader
          eyebrow={
            section.eyebrow
          }
          title={
            section.title
          }
          description={
            section.description
          }
        />

        {
          initialSelection
            ? (
                <DestinationSelectionNotice
                  selection={
                    initialSelection
                  }
                />
              )
            : null
        }

        <DestinationCategoryNav
          items={
            categories
          }
          value={
            filters.continent
          }
          onChange={(
            value:
              DestinationContinentKey,
          ) =>
            updateFilter(
              "continent",
              value,
            )
          }
        />

        <div className="mt-5">
          <DestinationCatalogToolbar
            value={
              filters
            }
            onQueryChange={(
              value: string,
            ) =>
              updateFilter(
                "query",
                value,
              )
            }
            onDurationChange={(
              value:
                DestinationDurationFilter,
            ) =>
              updateFilter(
                "duration",
                value,
              )
            }
            onDataChange={(
              value:
                DestinationDataFilter,
            ) =>
              updateFilter(
                "data",
                value,
              )
            }
            onSortChange={(
              value:
                DestinationSortValue,
            ) =>
              updateFilter(
                "sort",
                value,
              )
            }
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[var(--ysim-color-text-muted)]">
            {
              filteredItems.length
            }{" "}
            điểm đến phù hợp
          </p>

          <button
            type="button"
            onClick={() => {
              setSelectedDestinationSlug(
                undefined,
              );

              setFilters(
                section.initialFilters,
              );
            }}
            className="rounded-[var(--ysim-radius-md)] px-3 py-2 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-100)]"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <div className="mt-5">
          {filteredItems.length >
          0 ? (
            <>
              <DestinationDesktopTable
                items={
                  filteredItems
                }
              />

              <DestinationMobileList
                items={
                  filteredItems
                }
              />
            </>
          ) : (
            <div className="rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] bg-white px-6 py-14 text-center">
              <SearchX className="mx-auto h-10 w-10 text-[var(--ysim-color-text-soft)]" />

              <h2 className="mt-4 text-lg font-bold text-[var(--ysim-color-text)]">
                {
                  initialSelection
                    ?.kind ===
                    "destination"
                      ? `Chưa có gói eSIM cho ${initialSelection.label}`
                      : "Không tìm thấy điểm đến"
                }
              </h2>

              <p className="mt-2 text-sm text-[var(--ysim-color-text-muted)]">
                Hãy thử thay đổi từ khóa hoặc bộ lọc.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
