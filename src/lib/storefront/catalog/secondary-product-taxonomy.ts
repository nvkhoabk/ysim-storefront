import type { WooCommerceProduct } from "@/lib/woocommerce/types";
import {
  createWooCategoryTaxonomy,
  normalizeCategoryToken,
  productDestinationDescriptors,
} from "./woocommerce-category-taxonomy";

export interface SecondaryProductCatalogIdentity {
  destination?: string;
  filterTerms: readonly string[];
}

const destinationAttributeAliases = new Set([
  "destination code",
  "destination_code",
  "pa destination code",
]);

function unique(values: readonly (string | undefined)[]): readonly string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())),
  );
}

function rawCategoryTerms(product: WooCommerceProduct): readonly string[] {
  return (product.categories || [])
    .flatMap((category) => [category.name, category.slug])
    .filter(Boolean);
}

function rawAttributeTerms(
  product: WooCommerceProduct,
  includeDestinationCode: boolean,
): readonly string[] {
  return (product.attributes || [])
    .filter((attribute) => {
      if (includeDestinationCode) {
        return true;
      }
      const keys = [attribute.name, attribute.taxonomy || ""].map(normalizeCategoryToken);
      return !keys.some((key) => destinationAttributeAliases.has(key) || key.replace(/\s+/g, "_") === "destination_code");
    })
    .flatMap((attribute) => [
      attribute.name,
      attribute.taxonomy || undefined,
      ...(attribute.terms || []).flatMap((term) => [term.name, term.slug]),
    ])
    .filter((value): value is string => Boolean(value));
}

function primaryDestinationLabel(product: WooCommerceProduct): string | undefined {
  const taxonomy = createWooCategoryTaxonomy();
  const destinations = productDestinationDescriptors(product, taxonomy)
    .filter((descriptor) => descriptor.canonicalSlug !== "global");

  if (destinations.length === 1) {
    return destinations[0]?.label;
  }
  if (destinations.length > 1) {
    return "Đa quốc gia";
  }

  const globalDestination = productDestinationDescriptors(product, taxonomy)
    .find((descriptor) => descriptor.canonicalSlug === "global");
  return globalDestination?.label;
}

/**
 * Build the /esim filter identity from Woo categories first.
 *
 * A category assignment is authoritative. Legacy destination_code attributes
 * are ignored whenever categories exist because several imported products have
 * destination_code=JP even though their category is Korea, China or Thailand.
 */
export function createSecondaryProductCatalogIdentity(
  product: WooCommerceProduct,
): SecondaryProductCatalogIdentity {
  const taxonomy = createWooCategoryTaxonomy();
  const categories = rawCategoryTerms(product);
  const destinations = productDestinationDescriptors(product, taxonomy);
  const hasCategoryEvidence = (product.categories || []).length > 0;
  const attributes = rawAttributeTerms(product, !hasCategoryEvidence);
  const destinationTerms = destinations.flatMap((descriptor) => [
    descriptor.canonicalSlug,
    descriptor.label,
    descriptor.countryCode,
    ...descriptor.aliases,
    descriptor.continent,
    descriptor.continentLabel,
  ]);

  return {
    destination: primaryDestinationLabel(product),
    filterTerms: unique([
      product.name,
      product.slug,
      product.sku,
      ...categories,
      ...destinationTerms,
      ...attributes,
    ]),
  };
}
