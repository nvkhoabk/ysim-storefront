import { destinationPresentation } from "@/config/storefront-destinations";
import {
  destinationDailySignals,
  destinationTotalSignals,
  destinationUnlimitedSignals,
  productionDestinationCatalogMetadata,
} from "@/config/storefront-production-destinations";
import { genericProductDurationAttributeKeys } from "@/config/storefront-production-home";
import { createDestinationCardViewModel } from "@/features/destination/destination-presenter";
import {
  createWooCategoryTaxonomy,
  productMatchesDestination,
  type DestinationDescriptor,
  type WooCategoryTaxonomy,
} from "@/lib/storefront/catalog/woocommerce-category-taxonomy";
import type {
  WooCommerceProduct,
  WooCommerceProductAttribute,
} from "@/lib/woocommerce/types";
import type {
  DestinationCategorySource,
  DestinationCommerceSummary,
  DestinationPresentationConfig,
} from "@/types/view-models/destination";
import type {
  DestinationCatalogItemViewModel,
  DestinationDataFilter,
} from "@/types/view-models/destination-page";
import type {
  HomeCommerceSnapshot,
  WooCommerceStoreCategorySource,
} from "@/types/view-models/home-production";

const fallbackProductImage = "/assets/products/esim-product-placeholder.webp";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function secureAssetUrl(value: string | undefined): string | undefined {
  return value?.replace("http://shop.ysim.vn/", "https://shop.ysim.vn/");
}

function moneyAmount(product: WooCommerceProduct): number {
  const raw = Number(product.prices?.price);
  if (!Number.isFinite(raw)) {
    return 0;
  }
  return raw / Math.pow(10, product.prices?.currency_minor_unit || 0);
}

function productText(product: WooCommerceProduct): string {
  const attributeText = (product.attributes || [])
    .flatMap((attribute) => [
      attribute.name,
      attribute.taxonomy || "",
      ...(attribute.terms || []).flatMap((term) => [term.name, term.slug]),
    ])
    .join(" ");
  return normalizeText(
    [product.name, product.slug, product.short_description, attributeText]
      .filter(Boolean)
      .join(" "),
  );
}

function containsSignal(text: string, signals: readonly string[]): boolean {
  return signals.some((signal) => text.includes(normalizeText(signal)));
}

function dataKinds(
  products: readonly WooCommerceProduct[],
): readonly Exclude<DestinationDataFilter, "all">[] {
  const kinds = new Set<Exclude<DestinationDataFilter, "all">>();
  for (const product of products) {
    const text = productText(product);
    if (containsSignal(text, destinationUnlimitedSignals)) {
      kinds.add("unlimited");
    }
    if (containsSignal(text, destinationDailySignals)) {
      kinds.add("daily");
    }
    if (containsSignal(text, destinationTotalSignals)) {
      kinds.add("total");
    }
  }
  if (kinds.size === 0) {
    kinds.add("total");
  }
  return Array.from(kinds);
}

const durationAttributeAliases = new Set(genericProductDurationAttributeKeys.map(normalizeText));

function durationValues(
  attributes: readonly WooCommerceProductAttribute[] | undefined,
): readonly string[] {
  return (attributes || [])
    .filter((attribute) =>
      durationAttributeAliases.has(normalizeText(attribute.name))
      || Boolean(attribute.taxonomy && durationAttributeAliases.has(normalizeText(attribute.taxonomy))),
    )
    .flatMap((attribute) =>
      (attribute.terms || []).flatMap((term) => [term.name, term.slug]),
    );
}

function extractDays(value: string): readonly number[] {
  const normalized = normalizeText(value);
  const matches = normalized.matchAll(/(\d{1,3})\s*(?:ngay|day|days)/g);
  const values = Array.from(matches, (match) => Number(match[1]))
    .filter((day) => Number.isFinite(day) && day > 0 && day <= 365);
  if (values.length > 0) {
    return values;
  }
  const simple = normalized.match(/^\s*(\d{1,3})\s*$/);
  if (!simple) {
    return [];
  }
  const day = Number(simple[1]);
  return day > 0 && day <= 365 ? [day] : [];
}

function productDurations(product: WooCommerceProduct): readonly number[] {
  const fromAttributes = durationValues(product.attributes).flatMap(extractDays);
  if (fromAttributes.length > 0) {
    return fromAttributes;
  }
  return extractDays([product.name, product.slug].join(" "));
}

function purchasableProductsForDestination(
  snapshot: HomeCommerceSnapshot,
  destinationSlug: string,
  taxonomy: WooCategoryTaxonomy,
): readonly WooCommerceProduct[] {
  return snapshot.products.filter((product) =>
    product.is_purchasable
    && product.is_in_stock
    && moneyAmount(product) > 0
    && productMatchesDestination(product, destinationSlug, taxonomy),
  );
}

function chosenCategories(
  snapshot: HomeCommerceSnapshot,
  taxonomy: WooCategoryTaxonomy,
): ReadonlyMap<string, WooCommerceStoreCategorySource> {
  const byCanonical = new Map<string, WooCommerceStoreCategorySource>();
  for (const category of snapshot.categories) {
    if (category.count <= 0 || !taxonomy.isDestinationCategory(category)) {
      continue;
    }
    const canonicalSlug = taxonomy.categoryDescriptor(category).canonicalSlug;
    const current = byCanonical.get(canonicalSlug);
    if (!current || category.count > current.count) {
      byCanonical.set(canonicalSlug, category);
    }
  }
  return byCanonical;
}

function dynamicPresentation(
  descriptor: DestinationDescriptor,
  category: WooCommerceStoreCategorySource,
  products: readonly WooCommerceProduct[],
): DestinationPresentationConfig {
  const configured = destinationPresentation[descriptor.canonicalSlug];
  if (configured) {
    return configured;
  }

  const categoryImage = secureAssetUrl(category.image?.src || category.image?.thumbnail);
  const productImage = secureAssetUrl(products[0]?.images?.[0]?.src);
  const imageUrl = categoryImage || productImage || fallbackProductImage;

  return {
    slug: descriptor.canonicalSlug,
    imageUrl,
    imageAlt: `Minh họa điểm đến ${descriptor.label}`,
    // Until a dedicated flag asset exists, reusing a valid category/product
    // image is safer than generating a broken local flag URL.
    flagUrl: imageUrl,
    featured: false,
    order: 500 + category.id,
    badge: descriptor.canonicalSlug === "global"
      ? { label: "Nhiều quốc gia", icon: "global" }
      : undefined,
  };
}

function staticPopularityBase(slug: string): number {
  const metadata = productionDestinationCatalogMetadata[slug];
  return metadata?.popularityBase || 0;
}

export function mapProductionDestinationCatalog(
  snapshot: HomeCommerceSnapshot,
): readonly DestinationCatalogItemViewModel[] {
  const taxonomy = createWooCategoryTaxonomy(snapshot.categories);
  const categories = chosenCategories(snapshot, taxonomy);
  const items: DestinationCatalogItemViewModel[] = [];

  for (const [canonicalSlug, category] of categories.entries()) {
    const descriptor = taxonomy.categoryDescriptor(category);
    const products = purchasableProductsForDestination(snapshot, canonicalSlug, taxonomy);
    if (products.length === 0) {
      continue;
    }

    const prices = products.map(moneyAmount);
    const durations = products.flatMap(productDurations);
    const presentation = dynamicPresentation(descriptor, category, products);
    const source: DestinationCategorySource = {
      id: category.id,
      slug: canonicalSlug,
      name: descriptor.label || category.name,
      description: category.description,
      parentSlug: descriptor.continent,
      parentName: descriptor.continentLabel,
      productCount: products.length,
    };
    const commerce: DestinationCommerceSummary = {
      destinationSlug: canonicalSlug,
      minPurchasablePrice: Math.min(...prices),
      minDurationDays: durations.length > 0 ? Math.min(...durations) : undefined,
      maxDurationDays: durations.length > 0 ? Math.max(...durations) : undefined,
      purchasableProductCount: products.length,
    };
    const card = createDestinationCardViewModel(source, commerce, presentation);

    items.push({
      ...card,
      continent: descriptor.continent,
      continentLabel: descriptor.continentLabel,
      popularity: staticPopularityBase(canonicalSlug) + Math.min(products.length, 20),
      minDurationDays: commerce.minDurationDays,
      maxDurationDays: commerce.maxDurationDays,
      dataKinds: dataKinds(products),
    });
  }

  return items.sort((left, right) => {
    const leftOrder = destinationPresentation[left.slug]?.order || 500 + left.id;
    const rightOrder = destinationPresentation[right.slug]?.order || 500 + right.id;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.name.localeCompare(right.name, "vi");
  });
}
