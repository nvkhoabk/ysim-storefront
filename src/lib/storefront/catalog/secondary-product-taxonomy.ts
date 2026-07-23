import {
  esimDestinationExplorer,
} from "@/config/esim-destination-explorer";

import type {
  WooCommerceProduct,
} from "@/lib/woocommerce/types";

export interface SecondaryProductCatalogIdentity {
  destination?: string;
  filterTerms:
    readonly string[];
}

interface KnownDestination {
  label: string;
  aliases:
    readonly string[];
}

const genericCategoryAliases =
  new Set([
    "esim",
    "esim du lich",
    "travel esim",
    "san pham",
    "products",
  ]);

function normalize(
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
      /đ/g,
      "d",
    )
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim()
    .replace(
      /\s+/g,
      " ",
    );
}

function unique(
  values:
    readonly (
      string |
      undefined
    )[],
): readonly string[] {
  return Array.from(
    new Set(
      values
        .filter(
          (
            value,
          ): value is string =>
            Boolean(
              value
                ?.trim(),
            ),
        )
        .map(
          (
            value,
          ) =>
            value.trim(),
        ),
    ),
  );
}

const knownDestinations:
  readonly KnownDestination[] = [
    ...esimDestinationExplorer
      .primaryContinents,
    ...esimDestinationExplorer
      .secondaryContinents,
  ]
    .flatMap(
      (
        continent,
      ) =>
        continent
          .destinations,
    )
    .map(
      (
        destination,
      ) => ({
        label:
          destination.label,

        aliases:
          unique([
            destination.slug,
            destination.label,
            destination.countryCode,
          ])
            .map(
              normalize,
            )
            .filter(Boolean),
      }),
    );

function rawCategoryTerms(
  product:
    WooCommerceProduct,
): readonly string[] {
  return (
    product.categories ||
    []
  )
    .flatMap(
      (
        category,
      ) => [
        category.name,
        category.slug,
      ],
    )
    .filter(Boolean);
}

function rawAttributeTerms(
  product:
    WooCommerceProduct,
): readonly string[] {
  return (
    product.attributes ||
    []
  )
    .flatMap(
      (
        attribute,
      ) => [
        attribute.name,
        attribute.taxonomy,
        ...(
          attribute.terms ||
          []
        ).flatMap(
          (
            term,
          ) => [
            term.name,
            term.slug,
          ],
        ),
      ],
    )
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value,
        ),
    );
}

function containsAlias(
  value: string,
  alias: string,
): boolean {
  if (
    !alias
  ) {
    return false;
  }

  if (
    alias.length <=
    2
  ) {
    return value ===
      alias;
  }

  return (
    value ===
      alias ||
    ` ${value} `
      .includes(
        ` ${alias} `,
      )
  );
}

function findKnownDestination(
  rawTerms:
    readonly string[],
):
  KnownDestination |
  undefined {
  const normalizedTerms =
    rawTerms
      .map(
        normalize,
      )
      .filter(Boolean);

  return knownDestinations
    .find(
      (
        destination,
      ) =>
        destination
          .aliases
          .some(
            (
              alias,
            ) =>
              normalizedTerms
                .some(
                  (
                    term,
                  ) =>
                    containsAlias(
                      term,
                      alias,
                    ),
                ),
          ),
    );
}

function fallbackDestination(
  product:
    WooCommerceProduct,
): string | undefined {
  return (
    product.categories ||
    []
  )
    .find(
      (
        category,
      ) =>
        !genericCategoryAliases
          .has(
            normalize(
              category.name,
            ),
          ) &&
        !genericCategoryAliases
          .has(
            normalize(
              category.slug,
            ),
          ),
    )
    ?.name;
}

export function createSecondaryProductCatalogIdentity(
  product:
    WooCommerceProduct,
): SecondaryProductCatalogIdentity {
  const categories =
    rawCategoryTerms(
      product,
    );

  const attributes =
    rawAttributeTerms(
      product,
    );

  const baseTerms =
    unique([
      product.name,
      product.slug,
      product.sku,
      ...categories,
      ...attributes,
    ]);

  const knownDestination =
    findKnownDestination(
      baseTerms,
    );

  return {
    destination:
      knownDestination
        ?.label ||
      fallbackDestination(
        product,
      ),

    filterTerms:
      unique([
        ...baseTerms,
        knownDestination
          ?.label,
        ...(
          knownDestination
            ?.aliases ||
          []
        ),
      ]),
  };
}
