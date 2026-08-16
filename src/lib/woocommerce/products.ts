import type {
  LocalizedProduct,
  ProductResolverResponse,
} from "@/lib/models/product";
import {
  getLocalizedProductBySlug,
  getLocalizedProducts,
} from "@/lib/ysim-api/products";
import {
  createWooCategoryTaxonomy,
  productMatchesCategory,
  productMatchesDestination,
} from "@/lib/storefront/catalog/woocommerce-category-taxonomy";
import type { WooCommerceStoreCategorySource } from "@/types/view-models/home-production";
import { storeApiFetch } from "./store-api";
import {
  getStoreApiVariationReferenceIds,
  hydrateStoreApiVariations,
} from "./store-api-variation-adapter";
import type {
  WooCommerceImage,
  WooCommercePrice,
  WooCommerceProduct,
  WooCommerceProductAttribute,
  WooCommerceProductCategory,
  WooCommerceProductVariation,
} from "./types";

interface GetProductsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  locale?: string;
  destination?: string;
  featured?: boolean;
}

type CatalogSource = "woocommerce" | "localization" | "hybrid";

function catalogSource(): CatalogSource {
  const configured =
    process.env.YSIM_PRODUCT_CATALOG_SOURCE?.trim().toLowerCase();
  if (configured === "localization" || configured === "hybrid") {
    return configured;
  }
  return "woocommerce";
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
  max: number,
): number {
  if (!value || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.min(max, Math.floor(value)));
}

function maxCatalogPages(): number {
  return normalizePositiveInteger(
    Number(process.env.YSIM_WOO_CATALOG_MAX_PAGES || 10),
    10,
    50,
  );
}

/** Convert a decimal price into Woo Store API minor units. */
function convertPriceToMinorUnits(value: string, decimals: number): string {
  if (!value) {
    return "";
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "";
  }
  const multiplier = Math.pow(10, Math.max(0, decimals));
  return String(Math.round(numericValue * multiplier));
}

function createWooCommercePrice(product: LocalizedProduct): WooCommercePrice {
  const decimals = Math.max(0, product.currencyDecimals);
  return {
    price: convertPriceToMinorUnits(product.price, decimals),
    regular_price: convertPriceToMinorUnits(product.regularPrice, decimals),
    sale_price: convertPriceToMinorUnits(product.salePrice, decimals),
    currency_code: product.currency,
    currency_symbol: product.currencySymbol,
    currency_minor_unit: decimals,
    currency_decimal_separator: decimals > 0 ? "." : "",
    currency_thousand_separator: ",",
    currency_prefix: product.currencySymbol,
    currency_suffix: "",
  };
}

function createWooCommerceImage(
  image: LocalizedProduct["image"],
  fallbackName: string,
): WooCommerceImage | null {
  if (!image) {
    return null;
  }
  return {
    id: image.id,
    src: image.src,
    thumbnail: image.src,
    srcset: "",
    sizes: "",
    name: fallbackName,
    alt: image.alt || fallbackName,
  };
}

function createWooCommerceImages(
  product: LocalizedProduct,
): WooCommerceImage[] {
  const images: WooCommerceImage[] = [];
  const primaryImage = createWooCommerceImage(product.image, product.name);
  if (primaryImage) {
    images.push(primaryImage);
  }
  for (const galleryImage of product.gallery) {
    if (primaryImage && galleryImage.id === primaryImage.id) {
      continue;
    }
    images.push({
      id: galleryImage.id,
      src: galleryImage.src,
      thumbnail: galleryImage.src,
      srcset: "",
      sizes: "",
      name: product.name,
      alt: galleryImage.alt || product.name,
    });
  }
  return images;
}

function createWooCommerceCategories(
  product: LocalizedProduct,
): WooCommerceProductCategory[] {
  return product.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));
}

function normalizeAttributeSlug(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, "-");
}

function createWooCommerceAttributes(
  product: LocalizedProduct,
): WooCommerceProductAttribute[] {
  return product.attributes.map((attribute, attributeIndex) => ({
    id: attributeIndex + 1,
    name: attribute.name,
    taxonomy: attribute.slug || null,
    has_variations: attribute.hasVariations,
    terms: attribute.options.map((option, optionIndex) => ({
      id: optionIndex + 1,
      name: option.name,
      slug: option.value || normalizeAttributeSlug(option.name),
      default: product.defaultAttributes?.[attribute.slug] === option.value,
    })),
  }));
}

function createWooCommerceVariations(
  product: LocalizedProduct,
): WooCommerceProductVariation[] {
  return product.variations.map((variation) => ({
    id: variation.id,
    sku: variation.sku,
    prices: {
      price: convertPriceToMinorUnits(
        variation.price,
        variation.currencyDecimals,
      ),
      regular_price: convertPriceToMinorUnits(
        variation.regularPrice,
        variation.currencyDecimals,
      ),
      sale_price: convertPriceToMinorUnits(
        variation.salePrice,
        variation.currencyDecimals,
      ),
      currency_code: variation.currency,
      currency_symbol: variation.currencySymbol,
      currency_minor_unit: variation.currencyDecimals,
      currency_decimal_separator: variation.currencyDecimals > 0 ? "." : "",
      currency_thousand_separator: ",",
      currency_prefix: variation.currencySymbol,
      currency_suffix: "",
    },
    image: createWooCommerceImage(variation.image, product.name),
    description: variation.description,
    is_purchasable: variation.purchasable,
    is_in_stock: variation.inStock,
    attributes: variation.attributes,
  }));
}

/** Adapter LocalizedProduct -> WooCommerceProduct, preserving the current UI contract. */
function adaptLocalizedProduct(
  resolved: ProductResolverResponse,
): WooCommerceProduct {
  const product = resolved.product;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    parent: 0,
    type: product.type || "simple",
    variation: "",
    permalink: `/esim/${product.slug}`,
    sku: product.sku,
    short_description: product.shortDescription,
    description: product.description,
    on_sale: product.onSale,
    prices: createWooCommercePrice(product),
    images: createWooCommerceImages(product),
    categories: createWooCommerceCategories(product),
    tags: [],
    attributes: createWooCommerceAttributes(product),
    variations: createWooCommerceVariations(product),
    default_attributes: product.defaultAttributes,
    is_purchasable: product.purchasable,
    is_in_stock: product.inStock,
    low_stock_remaining: null,
    average_rating: "0",
    review_count: 0,
    add_to_cart: {
      text: "Thêm vào giỏ hàng",
      description: `Thêm ${product.name} vào giỏ hàng`,
      url: "",
      minimum: 1,
      maximum: 99,
      multiple_of: 1,
    },
  };
}

async function fetchStoreApiPages<T>(endpoint: string): Promise<T[]> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const results: T[] = [];
  const perPage = 100;

  for (let page = 1; page <= maxCatalogPages(); page += 1) {
    const response = await storeApiFetch<unknown>(
      `${endpoint}${separator}per_page=${perPage}&page=${page}`,
      { revalidate: 60 },
    );
    if (!Array.isArray(response)) {
      throw new Error(
        `Invalid WooCommerce Store API array response for ${endpoint}.`,
      );
    }
    results.push(...(response as T[]));
    if (response.length < perPage) {
      break;
    }
  }

  return results;
}

async function fetchWooCategories(): Promise<WooCommerceStoreCategorySource[]> {
  return fetchStoreApiPages<WooCommerceStoreCategorySource>(
    "/products/categories?hide_empty=false",
  );
}

async function fetchWooCatalog(
  options: GetProductsOptions,
): Promise<WooCommerceProduct[]> {
  const query = new URLSearchParams({ catalog_visibility: "visible" });
  if (options.search?.trim()) {
    query.set("search", options.search.trim());
  }
  if (options.featured) {
    query.set("featured", "true");
  }

  const products = await fetchStoreApiPages<WooCommerceProduct>(
    `/products?${query.toString()}`,
  );
  if (!options.destination?.trim() && !options.category?.trim()) {
    return products;
  }

  const categories = await fetchWooCategories();
  const taxonomy = createWooCategoryTaxonomy(categories);
  return products.filter(
    (product) =>
      productMatchesDestination(product, options.destination, taxonomy) &&
      productMatchesCategory(product, options.category, taxonomy),
  );
}

async function fetchLocalizedCatalog(
  options: GetProductsOptions,
): Promise<WooCommerceProduct[]> {
  const response = await getLocalizedProducts({
    page: options.page ?? 1,
    pageSize: options.perPage ?? 12,
    search: options.search,
    category: options.category,
    locale: options.locale ?? "vi",
    destination: options.destination,
    featured: options.featured,
  });
  return response.items.map(adaptLocalizedProduct);
}

function paginate(
  products: readonly WooCommerceProduct[],
  pageValue: number | undefined,
  perPageValue: number | undefined,
): WooCommerceProduct[] {
  const page = normalizePositiveInteger(pageValue, 1, 10000);
  const perPage = normalizePositiveInteger(perPageValue, 12, 100);
  const offset = (page - 1) * perPage;
  return products.slice(offset, offset + perPage);
}

/**
 * Product listing.
 *
 * Default source is WooCommerce Store API because Woo categories are the
 * canonical destination taxonomy. Set YSIM_PRODUCT_CATALOG_SOURCE=localization
 * only when the localization endpoint has complete product-family coverage.
 */
export async function getProducts(
  options: GetProductsOptions = {},
): Promise<WooCommerceProduct[]> {
  const source = catalogSource();
  if (source === "localization") {
    return fetchLocalizedCatalog(options);
  }

  try {
    const products = await fetchWooCatalog(options);
    return paginate(products, options.page, options.perPage);
  } catch (error) {
    if (source !== "hybrid") {
      throw error;
    }
    return fetchLocalizedCatalog(options);
  }
}

function chunkValues<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

async function fetchStoreApiArray<T>(endpoint: string): Promise<T[]> {
  const response = await storeApiFetch<unknown>(endpoint, { revalidate: 60 });
  if (!Array.isArray(response)) {
    throw new Error(
      `Invalid WooCommerce Store API array response for ${endpoint}.`,
    );
  }
  return response as T[];
}

async function fetchWooVariationProducts(
  parentProduct: WooCommerceProduct,
): Promise<WooCommerceProduct[]> {
  const referenceIds = getStoreApiVariationReferenceIds(
    parentProduct.variations,
  );

  if (referenceIds.length === 0) {
    return fetchStoreApiPages<WooCommerceProduct>(
      `/products?type=variation&parent=${parentProduct.id}&catalog_visibility=any`,
    );
  }

  const fetched: WooCommerceProduct[] = [];
  for (const ids of chunkValues(referenceIds, 100)) {
    const query = new URLSearchParams({
      type: "variation",
      include: ids.join(","),
      catalog_visibility: "any",
      orderby: "include",
      per_page: String(ids.length),
    });
    fetched.push(
      ...(await fetchStoreApiArray<WooCommerceProduct>(
        `/products?${query.toString()}`,
      )),
    );
  }

  const fetchedById = new Map(fetched.map((item) => [item.id, item]));
  const missingIds = referenceIds.filter((id) => !fetchedById.has(id));

  // Some WooCommerce/plugin combinations do not fully honor include for
  // variations. Retry the parent query with hidden catalog items enabled and
  // merge only the missing IDs.
  if (missingIds.length > 0) {
    const fallback = await fetchStoreApiPages<WooCommerceProduct>(
      `/products?type=variation&parent=${parentProduct.id}&catalog_visibility=any`,
    );
    for (const item of fallback) {
      if (missingIds.includes(item.id) && !fetchedById.has(item.id)) {
        fetchedById.set(item.id, item);
      }
    }
  }

  return referenceIds.flatMap((id) => {
    const product = fetchedById.get(id);
    return product ? [product] : [];
  });
}

function isWooStoreApiNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.startsWith("WooCommerce Store API error 404:")
  );
}

function isTopLevelWooProduct(product: WooCommerceProduct): boolean {
  return product.type !== "variation" && Number(product.parent || 0) === 0;
}

function selectExactTopLevelWooProduct(
  products: readonly WooCommerceProduct[],
  slug: string,
): WooCommerceProduct | null {
  const exact = products.filter((item) => item.slug === slug);
  return (
    exact.find(
      (item) => item.type === "variable" && isTopLevelWooProduct(item),
    ) ||
    exact.find((item) => isTopLevelWooProduct(item)) ||
    null
  );
}

function exactVariationParentId(
  products: readonly WooCommerceProduct[],
  slug: string,
): number | null {
  const variation = products.find(
    (item) =>
      item.slug === slug &&
      (item.type === "variation" || Number(item.parent || 0) > 0),
  );
  const parentId = Number(variation?.parent || 0);
  return Number.isInteger(parentId) && parentId > 0 ? parentId : null;
}

async function fetchWooProductById(
  productId: number,
): Promise<WooCommerceProduct | null> {
  try {
    return await storeApiFetch<WooCommerceProduct>(`/products/${productId}`, {
      revalidate: 60,
    });
  } catch (error) {
    if (isWooStoreApiNotFound(error)) {
      return null;
    }
    throw error;
  }
}

async function fetchWooParentProductBySlug(
  slug: string,
): Promise<WooCommerceProduct | null> {
  // Woo officially supports GET /products/:slug. Some stores can resolve a
  // duplicated variation slug first, so follow its parent ID when necessary.
  try {
    const direct = await storeApiFetch<WooCommerceProduct>(
      `/products/${encodeURIComponent(slug)}`,
      { revalidate: 60 },
    );
    if (direct.slug === slug && isTopLevelWooProduct(direct)) {
      return direct;
    }
    const directParentId = Number(direct.parent || 0);
    if (directParentId > 0) {
      const parent = await fetchWooProductById(directParentId);
      if (parent && isTopLevelWooProduct(parent)) {
        return parent;
      }
    }
  } catch (error) {
    if (!isWooStoreApiNotFound(error)) {
      throw error;
    }
  }

  // Prefer an explicitly variable, top-level product. This avoids selecting a
  // variation that happens to expose the same slug as its parent.
  const variableQuery = new URLSearchParams({
    slug,
    type: "variable",
    catalog_visibility: "any",
    per_page: "100",
  });
  const variableCandidates = await fetchStoreApiArray<WooCommerceProduct>(
    `/products?${variableQuery.toString()}`,
  );
  const variableParent = selectExactTopLevelWooProduct(
    variableCandidates,
    slug,
  );
  if (variableParent) {
    return variableParent;
  }

  // Last-resort collection query for simple/external products and unusual Woo
  // extensions. If the only exact hit is a variation, resolve its parent.
  const broadQuery = new URLSearchParams({
    slug,
    catalog_visibility: "any",
    per_page: "100",
  });
  const candidates = await fetchStoreApiArray<WooCommerceProduct>(
    `/products?${broadQuery.toString()}`,
  );
  const topLevel = selectExactTopLevelWooProduct(candidates, slug);
  if (topLevel) {
    return topLevel;
  }

  const parentId = exactVariationParentId(candidates, slug);
  if (!parentId) {
    return null;
  }
  const parent = await fetchWooProductById(parentId);
  return parent && isTopLevelWooProduct(parent) ? parent : null;
}

async function fetchWooProductBySlug(
  slug: string,
): Promise<WooCommerceProduct | null> {
  const product = await fetchWooParentProductBySlug(slug);
  if (!product) {
    return null;
  }

  if (product.type !== "variable") {
    return product;
  }

  const variationProducts = await fetchWooVariationProducts(product);
  const variations = hydrateStoreApiVariations({
    parentProduct: product,
    variationProducts,
  });
  return { ...product, variations };
}

function mergeWooProductDetailWithLocalizedContent(
  wooProduct: WooCommerceProduct,
  localizedProduct: WooCommerceProduct,
): WooCommerceProduct {
  return {
    ...wooProduct,
    name: localizedProduct.name || wooProduct.name,
    short_description:
      localizedProduct.short_description || wooProduct.short_description,
    description: localizedProduct.description || wooProduct.description,
    images:
      localizedProduct.images?.length > 0
        ? localizedProduct.images
        : wooProduct.images,
    // Woo category, attribute and variation data remain authoritative. They
    // share the IDs used by Store API cart operations and may be more complete
    // than the current localization family.
    categories:
      (wooProduct.categories?.length ?? 0) > 0
        ? wooProduct.categories
        : localizedProduct.categories,
    attributes:
      (wooProduct.attributes?.length ?? 0) > 0
        ? wooProduct.attributes
        : localizedProduct.attributes,
    variations:
      (wooProduct.variations?.length ?? 0) > 0
        ? wooProduct.variations
        : localizedProduct.variations,
  };
}

async function fetchLocalizedProductBySlugSafe(
  slug: string,
  locale: string,
): Promise<WooCommerceProduct | null> {
  try {
    const resolved = await getLocalizedProductBySlug(slug, locale);
    return resolved ? adaptLocalizedProduct(resolved) : null;
  } catch {
    return null;
  }
}

/**
 * Product detail uses WooCommerce as the authoritative source for IDs,
 * categories, variation references, prices and stock. Localized content is
 * overlaid when available without allowing an incomplete localization family
 * to collapse the Woo variation matrix.
 */
export async function getProductBySlug(
  slug: string,
  locale = "vi",
): Promise<WooCommerceProduct | null> {
  const source = catalogSource();
  if (source === "localization") {
    const localized = await fetchLocalizedProductBySlugSafe(slug, locale);
    return localized || fetchWooProductBySlug(slug);
  }

  let wooError: unknown;
  const [wooProduct, localizedProduct] = await Promise.all([
    fetchWooProductBySlug(slug).catch((error: unknown) => {
      wooError = error;
      return null;
    }),
    fetchLocalizedProductBySlugSafe(slug, locale),
  ]);

  if (wooProduct && localizedProduct) {
    return mergeWooProductDetailWithLocalizedContent(
      wooProduct,
      localizedProduct,
    );
  }
  if (wooProduct) {
    return wooProduct;
  }
  if (localizedProduct) {
    return localizedProduct;
  }
  if (wooError) {
    throw wooError;
  }
  return null;
}
