"use client";

import {
  useMemo,
  useState,
  type FocusEvent,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Globe2,
  PackageSearch,
  Search,
  type LucideIcon,
} from "lucide-react";

import {
  TextInput,
} from "@/components/ui";

import type {
  HeroSearchItemType,
  HeroSearchItemViewModel,
} from "@/types/view-models/hero";

import {
  cn,
} from "@/lib/ui/cn";

const typeLabels:
  Record<HeroSearchItemType, string> = {
    destination:
      "Điểm đến",

    product:
      "Sản phẩm",

    guide:
      "Cẩm nang",
  };

const typeIcons:
  Record<HeroSearchItemType, LucideIcon> = {
    destination:
      Globe2,

    product:
      PackageSearch,

    guide:
      BookOpen,
  };

const typeOrder:
  readonly HeroSearchItemType[] = [
    "destination",
    "product",
    "guide",
  ];

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

export interface HeroSearchProps {
  items:
    readonly HeroSearchItemViewModel[];
  placeholder?: string;
  label?: string;
  className?: string;
  maxResultsPerType?: number;
}

export function HeroSearch({
  items,
  placeholder =
    "Bạn sẽ đi đâu?",
  label =
    "Tìm điểm đến, sản phẩm hoặc cẩm nang",
  className,
  maxResultsPerType = 4,
}: HeroSearchProps) {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const normalizedQuery =
    normalize(query);

  const groupedResults =
    useMemo(() => {
      const grouped:
        Record<
          HeroSearchItemType,
          HeroSearchItemViewModel[]
        > = {
          destination:
            [],
          product:
            [],
          guide:
            [],
        };

      if (
        normalizedQuery.length <
        2
      ) {
        return grouped;
      }

      for (
        const item
        of items
      ) {
        const haystack =
          normalize(
            [
              item.label,
              item.description,
              item.meta,
              ...(item.keywords ||
                []),
            ]
              .filter(Boolean)
              .join(" "),
          );

        if (
          haystack.includes(
            normalizedQuery,
          )
        ) {
          if (
            grouped[
              item.type
            ].length <
            maxResultsPerType
          ) {
            grouped[
              item.type
            ].push(item);
          }
        }
      }

      return grouped;
    }, [
      items,
      maxResultsPerType,
      normalizedQuery,
    ]);

  const totalResults =
    typeOrder.reduce(
      (
        total,
        type,
      ) =>
        total +
        groupedResults[
          type
        ].length,
      0,
    );

  function handleBlur(
    event:
      FocusEvent<HTMLDivElement>,
  ) {
    if (
      event.currentTarget.contains(
        event.relatedTarget,
      )
    ) {
      return;
    }

    setOpen(false);
  }

  return (
    <div
      className={cn(
        "relative z-[var(--ysim-z-dropdown)]",
        className,
      )}
      onFocus={() =>
        setOpen(true)
      }
      onBlurCapture={
        handleBlur
      }
    >
      <TextInput
        label={label}
        value={query}
        onChange={(
          event,
        ) => {
          setQuery(
            event.target.value,
          );
          setOpen(true);
        }}
        placeholder={
          placeholder
        }
        startAdornment={
          <Search />
        }
        autoComplete="off"
        role="combobox"
        aria-expanded={
          open &&
          normalizedQuery.length >=
            2
        }
        aria-controls="hero-search-results"
      />

      {open &&
      normalizedQuery.length >=
        2 ? (
        <div
          id="hero-search-results"
          role="listbox"
          aria-label="Kết quả tìm kiếm"
          className="absolute inset-x-0 top-[calc(100%+0.75rem)] max-h-[min(31rem,65vh)] overflow-y-auto rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-3 shadow-[var(--ysim-shadow-md)]"
        >
          {totalResults >
          0 ? (
            <div className="space-y-4">
              {typeOrder.map(
                (type) => {
                  const results =
                    groupedResults[
                      type
                    ];

                  if (
                    results.length ===
                    0
                  ) {
                    return null;
                  }

                  const Icon =
                    typeIcons[
                      type
                    ];

                  return (
                    <section
                      key={type}
                      aria-labelledby={`hero-search-${type}`}
                    >
                      <h2
                        id={`hero-search-${type}`}
                        className="flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]"
                      >
                        <Icon className="h-4 w-4" />

                        {
                          typeLabels[
                            type
                          ]
                        }
                      </h2>

                      <div className="mt-1 space-y-1">
                        {results.map(
                          (
                            item,
                          ) => (
                            <Link
                              key={
                                item.id
                              }
                              href={
                                item.href
                              }
                              role="option"
                              className="group flex items-center justify-between gap-4 rounded-[var(--ysim-radius-md)] px-3 py-3 transition-colors hover:bg-[var(--ysim-color-brand-50)] focus:bg-[var(--ysim-color-brand-50)]"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-[var(--ysim-color-text)]">
                                  {
                                    item.label
                                  }
                                </span>

                                {item.description ? (
                                  <span className="mt-0.5 block truncate text-xs text-[var(--ysim-color-text-muted)]">
                                    {
                                      item.description
                                    }
                                  </span>
                                ) : null}
                              </span>

                              <span className="flex shrink-0 items-center gap-2">
                                {item.meta ? (
                                  <span className="hidden text-xs font-semibold text-[var(--ysim-color-brand-700)] sm:inline">
                                    {
                                      item.meta
                                    }
                                  </span>
                                ) : null}

                                <ArrowRight className="h-4 w-4 text-[var(--ysim-color-brand-700)] transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </Link>
                          ),
                        )}
                      </div>
                    </section>
                  );
                },
              )}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto h-8 w-8 text-[var(--ysim-color-text-soft)]" />

              <p className="mt-3 text-sm font-bold text-[var(--ysim-color-text)]">
                Không tìm thấy kết quả
              </p>

              <p className="mt-1 text-xs text-[var(--ysim-color-text-muted)]">
                Thử tìm theo tên quốc gia, dung lượng hoặc chủ đề cẩm nang.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
