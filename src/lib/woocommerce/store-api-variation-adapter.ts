import type {
  WooCommerceProduct,
  WooCommerceProductAttribute,
  WooCommerceProductVariation,
} from "./types";

interface StoreApiVariationReferenceAttribute {
  name: string;
  value: string | null;
}

interface StoreApiVariationReference {
  id: number;
  attributes: readonly StoreApiVariationReferenceAttribute[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInteger(value: unknown): number | undefined {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : undefined;
}

function storeApiVariationReferences(
  value: unknown,
): StoreApiVariationReference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const id = positiveInteger(item.id);
    if (!id) {
      return [];
    }
    const attributes = Array.isArray(item.attributes)
      ? item.attributes.flatMap((attribute) => {
          if (!isRecord(attribute)) {
            return [];
          }
          const name = stringValue(attribute.name);
          if (!name) {
            return [];
          }
          const rawValue = attribute.value;
          return [
            {
              name,
              value:
                typeof rawValue === "string" && rawValue.trim()
                  ? rawValue.trim()
                  : null,
            },
          ];
        })
      : [];

    return [{ id, attributes }];
  });
}

/**
 * The parent product is the authoritative list of variation IDs. Collection
 * queries can omit individually hidden variations, so callers should fetch
 * these IDs explicitly with catalog_visibility=any.
 */
export function getStoreApiVariationReferenceIds(value: unknown): number[] {
  return storeApiVariationReferences(value).map((reference) => reference.id);
}

function normalizeAttributeToken(value: string | null | undefined): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findParentProductAttribute(
  attributes: readonly WooCommerceProductAttribute[],
  requestedName: string,
): WooCommerceProductAttribute | undefined {
  const requested = normalizeAttributeToken(requestedName);
  return attributes.find((attribute) => {
    const candidates = [
      attribute.name,
      attribute.taxonomy || "",
      (attribute.taxonomy || "").replace(/^pa_/, ""),
    ];
    return candidates.some(
      (candidate) => normalizeAttributeToken(candidate) === requested,
    );
  });
}

function variationAttributeLabel(
  attribute: WooCommerceProductAttribute | undefined,
  value: string,
): string {
  if (!attribute) {
    return value;
  }
  const normalizedValue = normalizeAttributeToken(value);
  const term = (attribute.terms || []).find((item) => {
    return [item.slug, item.name].some(
      (candidate) => normalizeAttributeToken(candidate) === normalizedValue,
    );
  });
  return term?.name || value;
}

function normalizeStoreApiVariationAttributes(
  attributes: readonly StoreApiVariationReferenceAttribute[],
  parentAttributes: readonly WooCommerceProductAttribute[],
): WooCommerceProductVariation["attributes"] {
  return attributes.flatMap((attribute) => {
    if (!attribute.value) {
      return [];
    }
    const parentAttribute = findParentProductAttribute(
      parentAttributes,
      attribute.name,
    );
    const name = parentAttribute?.name || attribute.name;

    // Woo Store API cart requests require a `pa_` taxonomy slug for global
    // attributes, or the exact case-sensitive attribute name for custom ones.
    const slug = parentAttribute?.taxonomy || name;
    const value = attribute.value;
    return [
      {
        name,
        slug,
        value,
        label: variationAttributeLabel(parentAttribute, value),
      },
    ];
  });
}

function decodeVariationText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_match, code: string) => {
      const numeric = Number(code);
      return Number.isInteger(numeric) && numeric >= 0 && numeric <= 0x10ffff
        ? String.fromCodePoint(numeric)
        : " ";
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFormattedVariationAttributes(
  value: string,
): StoreApiVariationReferenceAttribute[] {
  const decoded = decodeVariationText(value);
  if (!decoded) {
    return [];
  }
  return decoded.split(/\s*,\s*/).flatMap((part) => {
    const separator = part.indexOf(":");
    if (separator < 1) {
      return [];
    }
    const name = part.slice(0, separator).trim();
    const attributeValue = part.slice(separator + 1).trim();
    return name && attributeValue ? [{ name, value: attributeValue }] : [];
  });
}

function hydrateStoreApiVariation(
  source: WooCommerceProduct,
  reference: StoreApiVariationReference | undefined,
  parentAttributes: readonly WooCommerceProductAttribute[],
): WooCommerceProductVariation {
  const referenceAttributes = reference?.attributes || [];
  const parsedAttributes = parseFormattedVariationAttributes(source.variation);
  const attributes = normalizeStoreApiVariationAttributes(
    referenceAttributes.length > 0 ? referenceAttributes : parsedAttributes,
    parentAttributes,
  );

  return {
    id: source.id,
    sku: source.sku,
    prices: source.prices,
    image: source.images?.[0] || null,
    description: source.description || source.short_description || "",
    is_purchasable: Boolean(source.is_purchasable),
    is_in_stock: Boolean(source.is_in_stock),
    attributes,
  };
}

/**
 * Merge the parent product's per-variation attribute references with the full
 * variation products that contain price, stock, SKU, description and images.
 * Parent reference order is retained so the matrix is deterministic.
 */
export function hydrateStoreApiVariations({
  parentProduct,
  variationProducts,
}: {
  parentProduct: WooCommerceProduct;
  variationProducts: readonly WooCommerceProduct[];
}): WooCommerceProductVariation[] {
  const references = storeApiVariationReferences(parentProduct.variations);
  const referencesById = new Map(
    references.map((reference) => [reference.id, reference]),
  );
  const productsById = new Map(
    variationProducts.map((variation) => [variation.id, variation]),
  );
  const parentAttributes = parentProduct.attributes || [];

  const referenced = references.flatMap((reference) => {
    const source = productsById.get(reference.id);
    return source
      ? [hydrateStoreApiVariation(source, reference, parentAttributes)]
      : [];
  });
  const unreferenced = variationProducts
    .filter((variation) => !referencesById.has(variation.id))
    .map((variation) =>
      hydrateStoreApiVariation(variation, undefined, parentAttributes),
    );

  return [...referenced, ...unreferenced];
}
