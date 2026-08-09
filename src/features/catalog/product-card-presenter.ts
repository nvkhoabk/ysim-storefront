import type {
  ProductCardPresentationConfig,
  ProductCardViewModel,
  ProductSource,
  ProductVariationSource,
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

function toAmount(
  value:
    | number
    | string
    | undefined,
): number | null {
  if (
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value,
    )
      ? value
      : null;
  }

  const normalized =
    value
      .trim()
      .replace(
        /[^\d.-]/g,
        "",
      );

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null;
}

function findAttribute(
  attributes:
    Readonly<
      Record<string, string>
    >,
  keys:
    readonly string[],
): string | undefined {
  const normalizedAttributes =
    new Map<string, string>();

  for (
    const [
      key,
      value,
    ] of Object.entries(
      attributes,
    )
  ) {
    normalizedAttributes.set(
      normalizeKey(key),
      value,
    );
  }

  for (
    const key
    of keys
  ) {
    const value =
      normalizedAttributes.get(
        normalizeKey(key),
      );

    if (
      value?.trim()
    ) {
      return value.trim();
    }
  }

  return undefined;
}

function getProductAttribute(
  product: ProductSource,
  keys:
    readonly string[],
): string | undefined {
  if (
    !product.attributes
  ) {
    return undefined;
  }

  const normalizedAttributes =
    new Map<
      string,
      string | readonly string[]
    >();

  for (
    const [
      key,
      value,
    ] of Object.entries(
      product.attributes,
    )
  ) {
    normalizedAttributes.set(
      normalizeKey(key),
      value,
    );
  }

  for (
    const key
    of keys
  ) {
    const value =
      normalizedAttributes.get(
        normalizeKey(key),
      );

    if (
      typeof value ===
      "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      Array.isArray(value) &&
      value.length > 0
    ) {
      return value
        .filter(Boolean)
        .join(" / ");
    }
  }

  return undefined;
}

function selectLowestPurchasableVariation(
  variations:
    readonly ProductVariationSource[],
): ProductVariationSource {
  const candidates =
    variations
      .map(
        (variation) => ({
          variation,
          price:
            toAmount(
              variation.price,
            ),
        }),
      )
      .filter(
        (
          candidate,
        ): candidate is {
          variation:
            ProductVariationSource;
          price: number;
        } =>
          candidate.variation
            .purchasable &&
          candidate.variation
            .inStock &&
          candidate.price !==
            null,
      )
      .sort(
        (left, right) =>
          left.price -
          right.price,
      );

  const selected =
    candidates[0]
      ?.variation;

  if (!selected) {
    throw new Error(
      "Product has no purchasable in-stock variation with a valid price.",
    );
  }

  return selected;
}

function createDiscountLabel(
  price:
    | number
    | string,
  regularPrice:
    | number
    | string
    | undefined,
): string | undefined {
  const sale =
    toAmount(price);

  const regular =
    toAmount(
      regularPrice,
    );

  if (
    sale === null ||
    regular === null ||
    regular <= sale ||
    regular <= 0
  ) {
    return undefined;
  }

  const percent =
    Math.round(
      ((regular - sale) /
        regular) *
        100,
    );

  return percent > 0
    ? `-${percent}%`
    : undefined;
}

export function createProductCardViewModel(
  product: ProductSource,
  presentation:
    ProductCardPresentationConfig,
): ProductCardViewModel {
  if (
    product.familyCode !==
    presentation.familyCode
  ) {
    throw new Error(
      `Product presentation mismatch: ${product.familyCode} != ${presentation.familyCode}`,
    );
  }

  const selected =
    selectLowestPurchasableVariation(
      product.variations,
    );

  const dataLabel =
    findAttribute(
      selected.attributes,
      presentation
        .dataAttributeKeys,
    ) ||
    getProductAttribute(
      product,
      presentation
        .dataAttributeKeys,
    ) ||
    "Nhiều mức dung lượng";

  const durationLabel =
    findAttribute(
      selected.attributes,
      presentation
        .durationAttributeKeys,
    ) ||
    getProductAttribute(
      product,
      presentation
        .durationAttributeKeys,
    ) ||
    "Nhiều thời hạn";

  const discountLabel =
    createDiscountLabel(
      selected.price,
      selected.regularPrice,
    );

  const badges = [
    ...(presentation.badge
      ? [
          presentation.badge,
        ]
      : []),

    ...(discountLabel
      ? [
          {
            label:
              "Ưu đãi",
            icon:
              "sale" as const,
          },
        ]
      : []),
  ];

  return {
    id:
      product.id,

    familyCode:
      product.familyCode,

    slug:
      product.slug,

    name:
      product.name,

    href:
      `/esim/${product.slug}`,

    imageUrl:
      product.imageUrl,

    imageAlt:
      product.imageAlt ||
      product.name,

    price:
      selected.price,

    regularPrice:
      selected.regularPrice,

    discountLabel,

    dataLabel,

    durationLabel,

    sku:
      selected.sku,

    badges,
  };
}
