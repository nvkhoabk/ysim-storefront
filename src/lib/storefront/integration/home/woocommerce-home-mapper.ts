import {
  destinationPresentation,
} from "@/config/storefront-destinations";

import {
  genericProductDataAttributeKeys,
  genericProductDurationAttributeKeys,
  resolveDestinationDefinition,
} from "@/config/storefront-production-home";

import {
  createDestinationCardViewModel,
} from "@/features/destination/destination-presenter";

import {
  createProductCardViewModel,
} from "@/features/catalog/product-card-presenter";

import type {
  WooCommerceProduct,
  WooCommerceProductAttribute,
} from "@/lib/woocommerce/types";

import type {
  DestinationCardViewModel,
  DestinationCategorySource,
  DestinationCommerceSummary,
} from "@/types/view-models/destination";

import type {
  HomeCommerceSnapshot,
  WooCommerceStoreCategorySource,
} from "@/types/view-models/home-production";

import type {
  ProductCardPresentationConfig,
  ProductCardViewModel,
  ProductSource,
} from "@/types/view-models/product-card";

function normalizeKey(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function normalizeMediaUrl(
  value:
    | string
    | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (
    value.startsWith(
      "http://shop.ysim.vn/",
    )
  ) {
    return value.replace(
      "http://shop.ysim.vn/",
      "https://shop.ysim.vn/",
    );
  }

  return value;
}

function moneyAmount(
  raw:
    | string
    | undefined,
  minorUnit:
    | number
    | undefined,
): number {
  const numeric =
    Number(raw);

  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return 0;
  }

  return (
    numeric /
    Math.pow(
      10,
      minorUnit ||
      0,
    )
  );
}

function attributeRecord(
  attributes:
    readonly WooCommerceProductAttribute[] | undefined,
):
  Readonly<
    Record<string, string>
  > {
  const record:
    Record<string, string> = {};

  for (
    const attribute
    of attributes ||
    []
  ) {
    const value =
      attribute.terms
        ?.map(
          (term) =>
            term.name,
        )
        .filter(Boolean)
        .join(" / ");

    if (!value) {
      continue;
    }

    record[
      attribute.name
    ] = value;

    if (
      attribute.taxonomy
    ) {
      record[
        attribute.taxonomy
      ] = value;
    }
  }

  return record;
}

function findAttributeValues(
  attributes:
    readonly WooCommerceProductAttribute[] | undefined,
  aliases:
    readonly string[],
): readonly string[] {
  const aliasSet =
    new Set(
      aliases.map(
        normalizeKey,
      ),
    );

  return (
    attributes ||
    []
  )
    .filter(
      (attribute) =>
        aliasSet.has(
          normalizeKey(
            attribute.name,
          ),
        ) ||
        (
          attribute.taxonomy
            ? aliasSet.has(
                normalizeKey(
                  attribute.taxonomy,
                ),
              )
            : false
        ),
    )
    .flatMap(
      (attribute) =>
        attribute.terms
          ?.map(
            (term) =>
              term.name,
          ) ||
        [],
    )
    .filter(Boolean);
}

function parseDurationDays(
  values:
    readonly string[],
): readonly number[] {
  return values
    .map(
      (value) => {
        const match =
          value.match(
            /\d+/,
          );

        return match
          ? Number(
              match[0],
            )
          : Number.NaN;
      },
    )
    .filter(
      (value) =>
        Number.isFinite(
          value,
        ) &&
        value > 0,
    );
}

function productAmount(
  product:
    WooCommerceProduct,
): number {
  return moneyAmount(
    product.prices
      ?.price,
    product.prices
      ?.currency_minor_unit,
  );
}

function productRegularAmount(
  product:
    WooCommerceProduct,
): number | undefined {
  const value =
    moneyAmount(
      product.prices
        ?.regular_price,
      product.prices
        ?.currency_minor_unit,
    );

  return value > 0
    ? value
    : undefined;
}

function familyCode(
  product:
    WooCommerceProduct,
): string {
  return (
    product.sku
      ?.trim() ||
    `WC-${product.id}`
  );
}

function createGenericProductPresentation(
  code: string,
): ProductCardPresentationConfig {
  return {
    familyCode:
      code,

    featured:
      true,

    dataAttributeKeys:
      genericProductDataAttributeKeys,

    durationAttributeKeys:
      genericProductDurationAttributeKeys,
  };
}

function toProductSource(
  product:
    WooCommerceProduct,
): ProductSource {
  const attributes =
    attributeRecord(
      product.attributes,
    );

  const image =
    product.images?.[0];

  const code =
    familyCode(
      product,
    );

  return {
    id:
      product.id,

    familyCode:
      code,

    slug:
      product.slug,

    name:
      product.name,

    description:
      product.short_description,

    imageUrl:
      normalizeMediaUrl(
        image?.src,
      ) ||
      "/ui-preview/products/global-esim.svg",

    imageAlt:
      image?.alt ||
      product.name,

    attributes,

    variations: [
      {
        id:
          product.id,

        sku:
          product.sku,

        price:
          productAmount(
            product,
          ),

        regularPrice:
          productRegularAmount(
            product,
          ),

        purchasable:
          Boolean(
            product.is_purchasable,
          ),

        inStock:
          Boolean(
            product.is_in_stock,
          ),

        attributes,
      },
    ],
  };
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
        Boolean(slug),
    );
}

function chooseCategories(
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

export function mapWooCommerceHomeProducts(
  snapshot:
    HomeCommerceSnapshot,
  limit: number,
): readonly ProductCardViewModel[] {
  return snapshot.products
    .filter(
      (product) =>
        product.is_purchasable &&
        product.is_in_stock &&
        productAmount(
          product,
        ) > 0,
    )
    .slice(
      0,
      limit,
    )
    .map(
      (product) => {
        const source =
          toProductSource(
            product,
          );

        return createProductCardViewModel(
          source,
          createGenericProductPresentation(
            source.familyCode,
          ),
        );
      },
    );
}

export function mapWooCommerceHomeDestinations(
  snapshot:
    HomeCommerceSnapshot,
  limit: number,
): readonly DestinationCardViewModel[] {
  const categories =
    chooseCategories(
      snapshot.categories,
    );

  const destinations:
    DestinationCardViewModel[] = [];

  for (
    const [
      canonicalSlug,
      category,
    ] of categories.entries()
  ) {
    const presentation =
      destinationPresentation[
        canonicalSlug
      ];

    const definition =
      resolveDestinationDefinition(
        category.slug,
      );

    if (
      !presentation ||
      !definition
    ) {
      continue;
    }

    const matchingProducts =
      snapshot.products.filter(
        (product) =>
          product.is_purchasable &&
          product.is_in_stock &&
          canonicalProductCategorySlugs(
            product,
          ).includes(
            canonicalSlug,
          ) &&
          productAmount(
            product,
          ) > 0,
      );

    if (
      matchingProducts.length ===
      0
    ) {
      continue;
    }

    const prices =
      matchingProducts.map(
        productAmount,
      );

    const durationDays =
      matchingProducts.flatMap(
        (product) =>
          parseDurationDays(
            findAttributeValues(
              product.attributes,
              genericProductDurationAttributeKeys,
            ),
          ),
      );

    const categorySource:
      DestinationCategorySource = {
        id:
          category.id,

        slug:
          canonicalSlug,

        name:
          category.name,

        description:
          category.description,

        parentName:
          definition.regionLabel,

        productCount:
          matchingProducts.length,
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
          durationDays.length
            ? Math.min(
                ...durationDays,
              )
            : undefined,

        maxDurationDays:
          durationDays.length
            ? Math.max(
                ...durationDays,
              )
            : undefined,

        purchasableProductCount:
          matchingProducts.length,
      };

    destinations.push(
      createDestinationCardViewModel(
        categorySource,
        commerce,
        presentation,
      ),
    );
  }

  return destinations
    .sort(
      (left, right) =>
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
    )
    .slice(
      0,
      limit,
    );
}
