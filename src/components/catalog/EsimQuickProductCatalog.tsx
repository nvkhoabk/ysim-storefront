"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { ArrowUpDown, PackageSearch, X } from "lucide-react";

import { StorefrontSearchCombobox } from "@/components/search";
import { Price } from "@/components/ui";

import {
  esimQuickFilterSelectionKey,
  productMatchesEsimQuickFilter,
} from "@/lib/storefront/catalog/esim-quick-filter";
import {
  createProductStorefrontSuggestions,
  normalizeStorefrontSearchText,
} from "@/lib/storefront/search/storefront-search";

import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";

import type { SecondaryProductViewModel } from "@/types/view-models/secondary-routes";

import styles from "./EsimInlineQuickFilter.module.css";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import { createShellTranslator } from "@/i18n/shell/shell.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";

type EsimCatalogSort = "recommended" | "price-asc" | "price-desc" | "name-asc";

function productMatchesSearch(
  product: SecondaryProductViewModel,
  query: string,
): boolean {
  const normalizedQuery = normalizeStorefrontSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const haystack = normalizeStorefrontSearchText(
    [
      product.name,
      product.slug,
      product.destination || "",
      ...(product.filterTerms || []),
    ].join(" "),
  );

  return normalizedQuery.split(" ").every((token) => haystack.includes(token));
}

function sortedProducts(
  products: readonly SecondaryProductViewModel[],
  sort: EsimCatalogSort,
  locale: string,
): readonly SecondaryProductViewModel[] {
  const next = [...products];

  switch (sort) {
    case "price-asc":
      return next.sort((left, right) => left.price - right.price);

    case "price-desc":
      return next.sort((left, right) => right.price - left.price);

    case "name-asc":
      return next.sort((left, right) =>
        left.name.localeCompare(right.name, locale),
      );

    default:
      return next;
  }
}

export function EsimQuickProductCatalog({
  products,
  selection,
  prefilteredSelectionKey,
  onClearSelection,
}: {
  products: readonly SecondaryProductViewModel[];
  selection: EsimQuickFilterSelection;
  prefilteredSelectionKey?: string;
  onClearSelection: () => void;
}) {
  const { locale } = useStorefrontLocale();
  const t = createListingTranslator(locale);
  const shell = createShellTranslator(locale);
  const sortLabels: Readonly<Record<EsimCatalogSort, string>> = {
    recommended: t("esim.sortRecommended"),
    "price-asc": t("ordinary.sortPriceAsc"),
    "price-desc": t("ordinary.sortPriceDesc"),
    "name-asc": t("ordinary.sortName"),
  };
  const [query, setQuery] = useState("");

  const [sort, setSort] = useState<EsimCatalogSort>("recommended");

  const selectionKey = esimQuickFilterSelectionKey(selection);
  const selectionPrefiltered = prefilteredSelectionKey === selectionKey;

  const searchSuggestions = useMemo(
    () => createProductStorefrontSuggestions(products, locale),
    [locale, products],
  );

  const filteredBySelection = useMemo(
    () =>
      selectionPrefiltered
        ? products
        : products.filter((product) =>
            productMatchesEsimQuickFilter(product, selection),
          ),
    [products, selection, selectionPrefiltered],
  );

  const visibleProducts = useMemo(
    () =>
      sortedProducts(
        filteredBySelection.filter((product) =>
          productMatchesSearch(product, query),
        ),
        sort,
        locale,
      ),
    [filteredBySelection, query, sort, locale],
  );

  return (
    <section
      id="esim-quick-catalog"
      data-ysim-quick-filter={selectionKey}
      data-ysim-filter-index={
        selectionPrefiltered
          ? "taxonomy-authoritative-v3"
          : "taxonomy-attribute-v2"
      }
      data-ysim-product-count={visibleProducts.length}
      className={styles.catalog}
    >
      <header className={styles.catalogHeader}>
        <div>
          <p className={styles.catalogEyebrow}>
            {t("ordinary.catalogEyebrow")}
          </p>

          <h2 className={styles.catalogTitle}>{t("ordinary.catalogTitle")}</h2>

          <p className={styles.catalogDescription}>
            {t("ordinary.catalogDescription")}
          </p>
        </div>

        {selection.kind !== "all" ? (
          <div className={styles.selectionBadge}>
            {selection.label}

            <button
              type="button"
              aria-label={t("ordinary.clearSelection")}
              onClick={onClearSelection}
              className={styles.clearSelection}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </header>

      <div className={styles.catalogControls}>
        <StorefrontSearchCombobox
          items={searchSuggestions}
          locale={locale}
          value={query}
          onChange={setQuery}
          label={t("esim.searchLabel")}
          placeholder={t("esim.searchPlaceholder")}
          resultsLabel={shell("search.results")}
          typeLabels={{
            destination: shell("search.destination"),
            product: shell("search.product"),
            guide: shell("search.guide"),
          }}
          flagLabel={(name) => shell("search.flagLabel", { name })}
          minResults={5}
          maxResults={10}
          className={styles.searchControl}
          inputClassName={styles.searchInput}
        />

        <label className={styles.sortControl}>
          <span className="sr-only">{t("esim.sortLabel")}</span>

          <ArrowUpDown aria-hidden="true" className={styles.sortIcon} />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as EsimCatalogSort)}
            className={styles.sortSelect}
          >
            {(
              Object.entries(sortLabels) as readonly [EsimCatalogSort, string][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={styles.catalogCount}>
        {t("ordinary.resultSummary", {
          visible: visibleProducts.length,
          total: filteredBySelection.length,
        })}
        {selection.kind !== "all"
          ? t("ordinary.selectionSuffix", { selection: selection.label })
          : ""}
      </p>

      {visibleProducts.length > 0 ? (
        <div className={styles.productGrid}>
          {visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={localizeShellHref(product.href, locale)}
              className={styles.productCard}
            >
              <div className={styles.productImage}>
                {product.onSale ? (
                  <span className={styles.saleBadge}>{t("ordinary.sale")}</span>
                ) : null}

                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 560px) 92vw, (max-width: 860px) 46vw, (max-width: 1180px) 31vw, 24vw"
                  className="object-cover"
                />
              </div>

              <div className={styles.productBody}>
                {product.destination ? (
                  <p className={styles.productDestination}>
                    {product.destination}
                  </p>
                ) : null}

                <h3 className={styles.productName}>{product.name}</h3>

                <div className={styles.productPrice}>
                  <Price
                    amount={product.price}
                    originalAmount={product.regularPrice}
                    size="compact"
                  />
                </div>

                {!product.inStock ? (
                  <p className={styles.stockWarning}>
                    {t("ordinary.outOfStock")}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div>
            <span aria-hidden="true" className={styles.emptyIcon}>
              <PackageSearch className="h-7 w-7" />
            </span>

            <h3 className={styles.emptyTitle}>{t("esim.noResultsTitle")}</h3>

            <p className={styles.emptyDescription}>
              {t("esim.noResultsDescription")}
            </p>

            <button
              type="button"
              onClick={() => {
                setQuery("");

                onClearSelection();
              }}
              className={styles.emptyAction}
            >
              {t("esim.clearFilters")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
