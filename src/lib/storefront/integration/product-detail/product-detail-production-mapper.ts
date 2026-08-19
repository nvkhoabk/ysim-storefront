import type {
  WooCommercePrice,
  WooCommerceProduct,
  WooCommerceProductAttribute,
  WooCommerceProductVariation,
} from "@/lib/woocommerce/types";

import type {
  ProductDetailAttributeViewModel,
  ProductDetailImageViewModel,
  ProductDetailRelatedItemViewModel,
  ProductDetailRouteProductViewModel,
  ProductDetailVariationViewModel,
} from "@/types/view-models/product-detail-route-candidate";
import { createDetailTranslator } from "@/i18n/detail/detail.registry";
import { localizeDestinationName } from "@/i18n/listing/static-destination.config";
import {
  normalizeProductDescriptionHtml,
  normalizeProductDescriptionText,
} from "@/lib/storefront/content/product-description";

type DetailTranslator = ReturnType<typeof createDetailTranslator>;

const fallbackImage = "/assets/products/esim-product-placeholder.webp";

function amount(
  prices: WooCommercePrice | undefined,
  field: "price" | "regular_price",
): number {
  const raw = Number(prices?.[field]);

  if (!Number.isFinite(raw)) {
    return 0;
  }

  return raw / Math.pow(10, prices?.currency_minor_unit || 0);
}

function httpsImage(value: string | undefined): string {
  if (!value) {
    return fallbackImage;
  }

  return value.replace("http://shop.ysim.vn/", "https://shop.ysim.vn/");
}

function displayAttributeValue(attribute: WooCommerceProductAttribute): string {
  return (attribute.terms || [])
    .map((term) => term.name)
    .filter(Boolean)
    .join(" / ");
}

function features(
  product: WooCommerceProduct,
  t: DetailTranslator,
): readonly ProductDetailAttributeViewModel[] {
  return (product.attributes || [])
    .map((attribute, index) => ({
      id: String(attribute.id || attribute.taxonomy || index),
      label: localizeAttributeLabel(attribute.name, t),
      value: displayAttributeValue(attribute),
    }))
    .filter((item) => Boolean(item.value));
}

function localizeAttributeLabel(label: string, t: DetailTranslator): string {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/data|capacity|allowance|dung luong/.test(normalized)) {
    return t("product.dataLabel");
  }

  if (/duration|validity|days|so ngay|thoi han/.test(normalized)) {
    return t("product.durationLabel");
  }

  if (/network|mang/.test(normalized)) {
    return t("product.networkLabel");
  }

  if (/activation|kich hoat/.test(normalized)) {
    return t("product.activationLabel");
  }

  if (/hotspot|chia se/.test(normalized)) {
    return t("product.hotspotLabel");
  }

  if (/phone|number|so dien thoai/.test(normalized)) {
    return t("product.phoneNumberLabel");
  }

  return label;
}

function variationAttributeRecord(
  attributes: WooCommerceProductVariation["attributes"],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    (attributes || [])
      .filter((attribute) => Boolean(attribute.slug && attribute.value))
      .map((attribute) => [attribute.slug, attribute.value]),
  );
}

function variationAttributeLabelRecord(
  attributes: WooCommerceProductVariation["attributes"],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    (attributes || [])
      .filter((attribute) => Boolean(attribute.slug))
      .map((attribute) => [
        attribute.slug,
        attribute.label || attribute.value || attribute.name,
      ]),
  );
}

function variationAttributeNameRecord(
  attributes: WooCommerceProductVariation["attributes"],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    (attributes || [])
      .filter((attribute) => Boolean(attribute.slug))
      .map((attribute) => [attribute.slug, attribute.name || attribute.slug]),
  );
}

function variationLabel(
  variation: WooCommerceProductVariation,
  index: number,
  t: DetailTranslator,
): string {
  const values = (variation.attributes || [])
    .map((attribute) => attribute.label || attribute.value || attribute.name)
    .filter(Boolean)
    .join(" · ");

  return (
    values ||
    variation.description ||
    variation.sku ||
    t("product.optionLabel", { count: index + 1 })
  );
}

function variationViewModel(
  variation: WooCommerceProductVariation,
  index: number,
  t: DetailTranslator,
): ProductDetailVariationViewModel {
  const price = amount(variation.prices, "price");

  const regularPrice = amount(variation.prices, "regular_price");

  return {
    id: variation.id,
    sku: variation.sku,
    label: variationLabel(variation, index, t),
    description: normalizeProductDescriptionText(variation.description),
    price,
    regularPrice: regularPrice > price ? regularPrice : undefined,
    purchasable: Boolean(variation.is_purchasable),
    inStock: Boolean(variation.is_in_stock),
    imageUrl: variation.image ? httpsImage(variation.image.src) : undefined,
    attributes: variationAttributeRecord(variation.attributes),
    attributeLabels: variationAttributeLabelRecord(variation.attributes),
    attributeNames: variationAttributeNameRecord(variation.attributes),
  };
}

function simpleVariation(
  product: WooCommerceProduct,
  t: DetailTranslator,
): ProductDetailVariationViewModel {
  const price = amount(product.prices, "price");

  const regularPrice = amount(product.prices, "regular_price");

  return {
    id: product.id,
    sku: product.sku,
    label: t("product.standardPlan"),
    description: normalizeProductDescriptionText(product.short_description),
    price,
    regularPrice: regularPrice > price ? regularPrice : undefined,
    purchasable: Boolean(product.is_purchasable),
    inStock: Boolean(product.is_in_stock),
    imageUrl: product.images?.[0]
      ? httpsImage(product.images[0].src)
      : undefined,
    attributes: {},
    attributeLabels: {},
    attributeNames: {},
  };
}

function gallery(
  product: WooCommerceProduct,
): readonly ProductDetailImageViewModel[] {
  const images = (product.images || []).map((image, index) => ({
    id: String(image.id || index),
    src: httpsImage(image.src),
    alt: image.alt || image.name || product.name,
  }));

  return images.length > 0
    ? images
    : [
        {
          id: "fallback",
          src: fallbackImage,
          alt: product.name,
        },
      ];
}

function firstAttribute(
  product: WooCommerceProduct,
  signals: readonly string[],
): string | undefined {
  const normalizedSignals = signals.map((signal) => signal.toLowerCase());

  const attribute = (product.attributes || []).find((item) => {
    const key = `${item.name} ${item.taxonomy || ""}`.toLowerCase();

    return normalizedSignals.some((signal) => key.includes(signal));
  });

  return attribute ? displayAttributeValue(attribute) : undefined;
}

function relatedItem(
  product: WooCommerceProduct,
): ProductDetailRelatedItemViewModel {
  const price = amount(product.prices, "price");

  const regularPrice = amount(product.prices, "regular_price");

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.images?.[0]
      ? httpsImage(product.images[0].src)
      : fallbackImage,
    imageAlt: product.images?.[0]?.alt || product.name,
    price,
    regularPrice: regularPrice > price ? regularPrice : undefined,
    dataLabel: firstAttribute(product, ["data", "dung lượng", "dung-luong"]),
    durationLabel: firstAttribute(product, [
      "duration",
      "số ngày",
      "so-ngay",
      "validity",
    ]),
    href: `/esim/${product.slug}`,
  };
}

export function mapProductDetailRouteProduct(
  {
    product,
    related,
  }: {
    product: WooCommerceProduct;
    related: readonly WooCommerceProduct[];
  },
  locale: unknown = "vi",
): ProductDetailRouteProductViewModel {
  const t = createDetailTranslator(locale);
  const mappedVariations = (product.variations || []).map((variation, index) =>
    variationViewModel(variation, index, t),
  );

  const variations =
    mappedVariations.length > 0
      ? mappedVariations
      : [simpleVariation(product, t)];

  const preferred =
    variations.find(
      (variation) => variation.purchasable && variation.inStock,
    ) || variations[0];

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    destinationName: product.categories?.[0]?.name
      ? localizeDestinationName(
          product.categories[0].slug,
          locale,
          product.categories[0].name,
        )
      : undefined,
    shortDescription: normalizeProductDescriptionText(
      product.short_description,
    ),
    description: normalizeProductDescriptionHtml(product.description),
    gallery: gallery(product),
    features: features(product, t),
    variations,
    defaultVariationId: preferred?.id,
    purchasable: Boolean(product.is_purchasable),
    inStock: Boolean(product.is_in_stock),
    usageNotes: [
      t("product.usageStableWifi"),
      t("product.usageKeepInstalled"),
      t("product.usageEnableAtDestination"),
      t("product.usageUnlockedDevice"),
    ],
    relatedProducts: related
      .filter((item) => item.id !== product.id)
      .map(relatedItem),
  };
}
