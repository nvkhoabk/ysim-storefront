"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpDown,
  PackageSearch,
  Search,
  X,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import {
  normalizeEsimCatalogToken,
  productMatchesEsimQuickFilter,
} from "@/lib/storefront/catalog/esim-quick-filter";

import type {
  EsimQuickFilterSelection,
} from "@/types/view-models/esim-quick-filter";

import type {
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

import styles from "./EsimInlineQuickFilter.module.css";

type EsimCatalogSort =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "name-asc";

const sortLabels:
  Readonly<
    Record<
      EsimCatalogSort,
      string
    >
  > = {
    recommended:
      "Đề xuất",
    "price-asc":
      "Giá thấp đến cao",
    "price-desc":
      "Giá cao đến thấp",
    "name-asc":
      "Tên A–Z",
  };

function productMatchesSearch(
  product:
    SecondaryProductViewModel,
  query: string,
): boolean {
  const normalizedQuery =
    normalizeEsimCatalogToken(
      query,
    );

  if (
    !normalizedQuery
  ) {
    return true;
  }

  const haystack =
    normalizeEsimCatalogToken(
      [
        product.name,
        product.slug,
        product.destination ||
          "",
      ]
        .join(
          " ",
        ),
    );

  return normalizedQuery
    .split(
      " ",
    )
    .every(
      (
        token,
      ) =>
        haystack.includes(
          token,
        ),
    );
}

function sortedProducts(
  products:
    readonly SecondaryProductViewModel[],
  sort:
    EsimCatalogSort,
): readonly SecondaryProductViewModel[] {
  const next = [
    ...products,
  ];

  switch (
    sort
  ) {
    case "price-asc":
      return next.sort(
        (
          left,
          right,
        ) =>
          left.price -
          right.price,
      );

    case "price-desc":
      return next.sort(
        (
          left,
          right,
        ) =>
          right.price -
          left.price,
      );

    case "name-asc":
      return next.sort(
        (
          left,
          right,
        ) =>
          left.name.localeCompare(
            right.name,
            "vi",
          ),
      );

    default:
      return next;
  }
}

export function EsimQuickProductCatalog({
  products,
  selection,
  onClearSelection,
}: {
  products:
    readonly SecondaryProductViewModel[];
  selection:
    EsimQuickFilterSelection;
  onClearSelection:
    () => void;
}) {
  const [
    query,
    setQuery,
  ] =
    useState(
      "",
    );

  const [
    sort,
    setSort,
  ] =
    useState<
      EsimCatalogSort
    >(
      "recommended",
    );

  const filteredBySelection =
    useMemo(
      () =>
        products.filter(
          (
            product,
          ) =>
            productMatchesEsimQuickFilter(
              product,
              selection,
            ),
        ),
      [
        products,
        selection,
      ],
    );

  const visibleProducts =
    useMemo(
      () =>
        sortedProducts(
          filteredBySelection.filter(
            (
              product,
            ) =>
              productMatchesSearch(
                product,
                query,
              ),
          ),
          sort,
        ),
      [
        filteredBySelection,
        query,
        sort,
      ],
    );

  return (
    <section
      id="esim-quick-catalog"
      data-ysim-quick-filter={`${selection.kind}:${selection.id}`}
      data-ysim-filter-index="taxonomy-attribute-v2"
      data-ysim-product-count={
        visibleProducts.length
      }
      className={
        styles.catalog
      }
    >
      <header
        className={
          styles.catalogHeader
        }
      >
        <div>
          <p
            className={
              styles.catalogEyebrow
            }
          >
            Lọc nhanh sản phẩm
          </p>

          <h2
            className={
              styles.catalogTitle
            }
          >
            Gói eSIM phù hợp
          </h2>

          <p
            className={
              styles.catalogDescription
            }
          >
            Chọn điểm đến ở phía trên, sau đó so sánh và sắp xếp các gói ngay trên trang này.
          </p>
        </div>

        {
          selection.kind !==
          "all"
            ? (
                <div
                  className={
                    styles.selectionBadge
                  }
                >
                  {
                    selection.label
                  }

                  <button
                    type="button"
                    aria-label="Xóa bộ lọc đang chọn"
                    onClick={
                      onClearSelection
                    }
                    className={
                      styles.clearSelection
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            : null
        }
      </header>

      <div
        className={
          styles.catalogControls
        }
      >
        <label
          className={
            styles.searchControl
          }
        >
          <span className="sr-only">
            Tìm gói eSIM
          </span>

          <Search
            aria-hidden="true"
            className={
              styles.searchIcon
            }
          />

          <input
            type="search"
            value={
              query
            }
            onChange={
              (
                event,
              ) =>
                setQuery(
                  event
                    .target
                    .value,
                )
            }
            placeholder="Tìm tên gói hoặc điểm đến"
            className={
              styles.searchInput
            }
          />
        </label>

        <label
          className={
            styles.sortControl
          }
        >
          <span className="sr-only">
            Sắp xếp sản phẩm
          </span>

          <ArrowUpDown
            aria-hidden="true"
            className={
              styles.sortIcon
            }
          />

          <select
            value={
              sort
            }
            onChange={
              (
                event,
              ) =>
                setSort(
                  event
                    .target
                    .value as
                    EsimCatalogSort,
                )
            }
            className={
              styles.sortSelect
            }
          >
            {
              (
                Object.entries(
                  sortLabels,
                ) as
                  readonly [
                    EsimCatalogSort,
                    string,
                  ][]
              )
                .map(
                  (
                    [
                      value,
                      label,
                    ],
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )
            }
          </select>
        </label>
      </div>

      <p
        className={
          styles.catalogCount
        }
      >
        Hiển thị {
          visibleProducts.length
        } / {
          filteredBySelection.length
        } gói
        {
          selection.kind !==
            "all"
            ? ` cho ${selection.label}`
            : ""
        }
      </p>

      {
        visibleProducts.length >
        0
          ? (
              <div
                className={
                  styles.productGrid
                }
              >
                {
                  visibleProducts.map(
                    (
                      product,
                    ) => (
                      <Link
                        key={
                          product.id
                        }
                        href={
                          product.href
                        }
                        className={
                          styles.productCard
                        }
                      >
                        <div
                          className={
                            styles.productImage
                          }
                        >
                          {
                            product.onSale
                              ? (
                                  <span
                                    className={
                                      styles.saleBadge
                                    }
                                  >
                                    Ưu đãi
                                  </span>
                                )
                              : null
                          }

                          <Image
                            src={
                              product.imageUrl
                            }
                            alt={
                              product.name
                            }
                            fill
                            sizes="(max-width: 560px) 92vw, (max-width: 860px) 46vw, (max-width: 1180px) 31vw, 24vw"
                            className="object-cover"
                          />
                        </div>

                        <div
                          className={
                            styles.productBody
                          }
                        >
                          {
                            product.destination
                              ? (
                                  <p
                                    className={
                                      styles.productDestination
                                    }
                                  >
                                    {
                                      product.destination
                                    }
                                  </p>
                                )
                              : null
                          }

                          <h3
                            className={
                              styles.productName
                            }
                          >
                            {
                              product.name
                            }
                          </h3>

                          <div
                            className={
                              styles.productPrice
                            }
                          >
                            <Price
                              amount={
                                product.price
                              }
                              originalAmount={
                                product
                                  .regularPrice
                              }
                              size="compact"
                            />
                          </div>

                          {
                            !product.inStock
                              ? (
                                  <p
                                    className={
                                      styles.stockWarning
                                    }
                                  >
                                    Tạm hết hàng
                                  </p>
                                )
                              : null
                          }
                        </div>
                      </Link>
                    ),
                  )
                }
              </div>
            )
          : (
              <div
                className={
                  styles.emptyState
                }
              >
                <div>
                  <span
                    aria-hidden="true"
                    className={
                      styles.emptyIcon
                    }
                  >
                    <PackageSearch className="h-7 w-7" />
                  </span>

                  <h3
                    className={
                      styles.emptyTitle
                    }
                  >
                    Chưa có gói phù hợp với bộ lọc này
                  </h3>

                  <p
                    className={
                      styles.emptyDescription
                    }
                  >
                    Hãy thử xóa từ khóa tìm kiếm hoặc xem toàn bộ catalog eSIM hiện có.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery(
                        "",
                      );

                      onClearSelection();
                    }}
                    className={
                      styles.emptyAction
                    }
                  >
                    Xem tất cả gói
                  </button>
                </div>
              </div>
            )
      }
    </section>
  );
}
