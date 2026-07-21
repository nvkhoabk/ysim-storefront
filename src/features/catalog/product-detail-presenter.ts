import type {
  ProductDetailPresentationConfig,
  ProductDetailSource,
  ProductDetailVariationViewModel,
  ProductDetailViewModel,
} from "@/types/view-models/product-detail";

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findAttribute(
  attributes: Readonly<Record<string, string>>,
  aliases: readonly string[],
): string | undefined {
  const values = new Map<string, string>();

  for (const [key, value] of Object.entries(attributes)) {
    values.set(normalizeKey(key), value);
  }

  for (const alias of aliases) {
    const value = values.get(normalizeKey(alias));
    if (value?.trim()) return value.trim();
  }

  return undefined;
}

function toAmount(value: number | string | undefined): number | null {
  if (value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function discountLabel(
  price: number | string,
  regularPrice: number | string | undefined,
): string | undefined {
  const sale = toAmount(price);
  const regular = toAmount(regularPrice);

  if (sale === null || regular === null || regular <= sale || regular <= 0) {
    return undefined;
  }

  return `-${Math.round(((regular - sale) / regular) * 100)}%`;
}

export function createProductDetailViewModel(
  source: ProductDetailSource,
  config: ProductDetailPresentationConfig,
): ProductDetailViewModel {
  if (source.familyCode !== config.familyCode) {
    throw new Error(`Product detail config mismatch: ${source.familyCode}`);
  }

  const variations: ProductDetailVariationViewModel[] =
    source.variations.map((variation) => {
      const dataValue = findAttribute(
        variation.attributes,
        config.dataAttributeKeys,
      );
      const durationValue = findAttribute(
        variation.attributes,
        config.durationAttributeKeys,
      );

      if (!dataValue || !durationValue) {
        throw new Error(`Variation ${variation.id} is missing attributes.`);
      }

      return {
        id: variation.id,
        sku: variation.sku,
        price: variation.price,
        regularPrice: variation.regularPrice,
        discountLabel: discountLabel(
          variation.price,
          variation.regularPrice,
        ),
        purchasable: variation.purchasable,
        inStock: variation.inStock,
        dataValue,
        durationValue,
      };
    });

  const initialVariation =
    variations.find((item) => item.purchasable && item.inStock) ??
    variations[0];

  if (!initialVariation) {
    throw new Error("Product detail requires at least one variation.");
  }

  const gallery =
    source.gallery?.length
      ? source.gallery.map((image, index) => ({
          id: image.id ?? `gallery-${index + 1}`,
          url: image.url,
          alt: image.alt ?? source.name,
        }))
      : [{
          id: "primary",
          url: source.imageUrl,
          alt: source.imageAlt ?? source.name,
        }];

  return {
    id: source.id,
    familyCode: source.familyCode,
    slug: source.slug,
    name: source.name,
    destinationName: source.destinationName,
    shortDescription: source.shortDescription,
    gallery,
    badges: config.badges ?? [],
    dataOptions: Array.from(new Set(variations.map((item) => item.dataValue))),
    durationOptions: Array.from(
      new Set(variations.map((item) => item.durationValue)),
    ),
    variations,
    initialVariationId: initialVariation.id,
    features: config.features,
    usageNotes: config.usageNotes,
  };
}
