import {
  destinationPresentation,
} from "@/config/storefront-destinations";

import {
  destinationDailySignals,
  destinationTotalSignals,
  destinationUnlimitedSignals,
  productionDestinationCatalogMetadata,
} from "@/config/storefront-production-destinations";

import {
  genericProductDurationAttributeKeys,
  resolveDestinationDefinition,
} from "@/config/storefront-production-home";

import {
  createDestinationCardViewModel,
} from "@/features/destination/destination-presenter";

import type {
  WooCommerceProduct,
  WooCommerceProductAttribute,
} from "@/lib/woocommerce/types";

import type {
  DestinationCategorySource,
  DestinationCommerceSummary,
} from "@/types/view-models/destination";

import type {
  DestinationCatalogItemViewModel,
  DestinationDataFilter,
} from "@/types/view-models/destination-page";

import type {
  HomeCommerceSnapshot,
  WooCommerceStoreCategorySource,
} from "@/types/view-models/home-production";

function normalizeText(
  value: string,
): string {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[_-]+/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function moneyAmount(
  product:
    WooCommerceProduct,
): number {
  const raw =
    Number(
      product.prices
        ?.price,
    );

  if (
    !Number.isFinite(
      raw,
    )
  ) {
    return 0;
  }

  return (
    raw /
    Math.pow(
      10,
      product.prices
        ?.currency_minor_unit ||
        0,
    )
  );
}

function productText(
  product:
    WooCommerceProduct,
): string {
  const attributeText =
    (
      product.attributes ||
      []
    )
      .flatMap(
        (attribute) => [
          attribute.name,
          attribute.taxonomy ||
            "",
          ...(
            attribute.terms ||
            []
          ).flatMap(
            (term) => [
              term.name,
              term.slug,
            ],
          ),
        ],
      )
      .join(
        " ",
      );

  return normalizeText(
    [
      product.name,
      product.slug,
      product.short_description,
      attributeText,
    ]
      .filter(Boolean)
      .join(
        " ",
      ),
  );
}

function containsSignal(
  text: string,
  signals:
    readonly string[],
): boolean {
  return signals.some(
    (signal) =>
      text.includes(
        normalizeText(
          signal,
        ),
      ),
  );
}

function dataKinds(
  products:
    readonly WooCommerceProduct[],
):
  readonly Exclude<
    DestinationDataFilter,
    "all"
  >[] {
  const kinds =
    new Set<
      Exclude<
        DestinationDataFilter,
        "all"
      >
    >();

  for (
    const product
    of products
  ) {
    const text =
      productText(
        product,
      );

    if (
      containsSignal(
        text,
        destinationUnlimitedSignals,
      )
    ) {
      kinds.add(
        "unlimited",
      );
    }

    if (
      containsSignal(
        text,
        destinationDailySignals,
      )
    ) {
      kinds.add(
        "daily",
      );
    }

    if (
      containsSignal(
        text,
        destinationTotalSignals,
      ) ||
      kinds.size ===
        0
    ) {
      kinds.add(
        "total",
      );
    }
  }

  if (
    kinds.size ===
    0
  ) {
    kinds.add(
      "total",
    );
  }

  return Array.from(
    kinds,
  );
}

function normalizedAttributeAliases():
  ReadonlySet<string> {
  return new Set(
    genericProductDurationAttributeKeys.map(
      normalizeText,
    ),
  );
}

const durationAttributeAliases =
  normalizedAttributeAliases();

function durationValues(
  attributes:
    readonly WooCommerceProductAttribute[] | undefined,
): readonly string[] {
  return (
    attributes ||
    []
  )
    .filter(
      (attribute) =>
        durationAttributeAliases.has(
          normalizeText(
            attribute.name,
          ),
        ) ||
        (
          attribute.taxonomy
            ? durationAttributeAliases.has(
                normalizeText(
                  attribute.taxonomy,
                ),
              )
            : false
        ),
    )
    .flatMap(
      (attribute) =>
        (
          attribute.terms ||
          []
        ).flatMap(
          (term) => [
            term.name,
            term.slug,
          ],
        ),
    );
}

function extractDays(
  value: string,
): readonly number[] {
  const normalized =
    normalizeText(
      value,
    );

  const matches =
    normalized.matchAll(
      /(\d{1,3})\s*(?:ngay|day|days)/g,
    );

  const values =
    Array.from(
      matches,
      (match) =>
        Number(
          match[1],
        ),
    )
      .filter(
        (day) =>
          Number.isFinite(
            day,
          ) &&
          day >
            0 &&
          day <=
            365,
      );

  if (
    values.length >
    0
  ) {
    return values;
  }

  const simple =
    normalized.match(
      /^\s*(\d{1,3})\s*$/,
    );

  if (!simple) {
    return [];
  }

  const day =
    Number(
      simple[1],
    );

  return (
    day >
      0 &&
    day <=
      365
  )
    ? [
        day,
      ]
    : [];
}

function productDurations(
  product:
    WooCommerceProduct,
): readonly number[] {
  const fromAttributes =
    durationValues(
      product.attributes,
    )
      .flatMap(
        extractDays,
      );

  if (
    fromAttributes.length >
    0
  ) {
    return fromAttributes;
  }

  return extractDays(
    [
      product.name,
      product.slug,
    ].join(
      " ",
    ),
  );
}

function canonicalProductCategorySlugs(
  product:
    WooCommerceProduct,
): readonly string[] {
  return (
    product.categories ||
    []
  )
    .map(
      (category) =>
        resolveDestinationDefinition(
          category.slug,
        )?.canonicalSlug,
    )
    .filter(
      (
        slug,
      ): slug is string =>
        Boolean(
          slug,
        ),
    );
}

function chosenCategories(
  categories:
    readonly WooCommerceStoreCategorySource[],
):
  ReadonlyMap<
    string,
    WooCommerceStoreCategorySource
  > {
  const byCanonical =
    new Map<
      string,
      WooCommerceStoreCategorySource
    >();

  for (
    const category
    of categories
  ) {
    const definition =
      resolveDestinationDefinition(
        category.slug,
      );

    if (
      !definition ||
      !destinationPresentation[
        definition.canonicalSlug
      ] ||
      !productionDestinationCatalogMetadata[
        definition.canonicalSlug
      ]
    ) {
      continue;
    }

    const current =
      byCanonical.get(
        definition.canonicalSlug,
      );

    if (
      !current ||
      category.count >
        current.count
    ) {
      byCanonical.set(
        definition.canonicalSlug,
        category,
      );
    }
  }

  return byCanonical;
}

export function mapProductionDestinationCatalog(
  snapshot:
    HomeCommerceSnapshot,
): readonly DestinationCatalogItemViewModel[] {
  const categories =
    chosenCategories(
      snapshot.categories,
    );

  const items:
    DestinationCatalogItemViewModel[] = [];

  for (
    const [
      canonicalSlug,
      category,
    ]
    of categories.entries()
  ) {
    const metadata =
      productionDestinationCatalogMetadata[
        canonicalSlug
      ];

    const presentation =
      destinationPresentation[
        canonicalSlug
      ];

    if (
      !metadata ||
      !presentation
    ) {
      continue;
    }

    const products =
      snapshot.products.filter(
        (product) =>
          product.is_purchasable &&
          product.is_in_stock &&
          moneyAmount(
            product,
          ) >
            0 &&
          canonicalProductCategorySlugs(
            product,
          ).includes(
            canonicalSlug,
          ),
      );

    if (
      products.length ===
      0
    ) {
      continue;
    }

    const prices =
      products.map(
        moneyAmount,
      );

    const durations =
      products.flatMap(
        productDurations,
      );

    const source:
      DestinationCategorySource = {
        id:
          category.id,
        slug:
          canonicalSlug,
        name:
          category.name,
        description:
          category.description,
        parentSlug:
          metadata.continent,
        parentName:
          metadata.continentLabel,
        productCount:
          products.length,
      };

    const commerce:
      DestinationCommerceSummary = {
        destinationSlug:
          canonicalSlug,
        minPurchasablePrice:
          Math.min(
            ...prices,
          ),
        minDurationDays:
          durations.length >
            0
            ? Math.min(
                ...durations,
              )
            : undefined,
        maxDurationDays:
          durations.length >
            0
            ? Math.max(
                ...durations,
              )
            : undefined,
        purchasableProductCount:
          products.length,
      };

    const card =
      createDestinationCardViewModel(
        source,
        commerce,
        presentation,
      );

    items.push({
      ...card,
      continent:
        metadata.continent,
      continentLabel:
        metadata.continentLabel,
      popularity:
        metadata.popularityBase +
        Math.min(
          products.length,
          20,
        ),
      minDurationDays:
        commerce.minDurationDays,
      maxDurationDays:
        commerce.maxDurationDays,
      dataKinds:
        dataKinds(
          products,
        ),
    });
  }

  return items.sort(
    (
      left,
      right,
    ) =>
      (
        destinationPresentation[
          left.slug
        ]?.order ||
        999
      ) -
      (
        destinationPresentation[
          right.slug
        ]?.order ||
        999
      ),
  );
}
