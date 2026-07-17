import type {
  LocalizedProduct,
  ProductResolverResponse,
} from "@/lib/models/product";

import {
  getLocalizedProducts,
} from "@/lib/ysim-api/products";

import {
  storeApiFetch,
} from "./store-api";

import type {
  WooCommerceImage,
  WooCommercePrice,
  WooCommerceProduct,
  WooCommerceProductAttribute,
  WooCommerceProductCategory,
} from "./types";

interface GetProductsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;

  /**
   * Các tùy chọn mới dành cho YSim Localization API.
   */
  locale?: string;
  destination?: string;
  featured?: boolean;
}

/**
 * Chuyển giá dạng decimal của WooCommerce CRUD:
 *
 * 169000 VND
 * 12.99 USD
 *
 * sang định dạng minor-unit mà UI hiện tại đang sử dụng:
 *
 * 169000 với VND decimals = 0
 * 1299 với USD decimals = 2
 */
function convertPriceToMinorUnits(
  value: string,
  decimals: number,
): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  const multiplier = Math.pow(
    10,
    Math.max(0, decimals),
  );

  return String(
    Math.round(numericValue * multiplier),
  );
}

function createWooCommercePrice(
  product: LocalizedProduct,
): WooCommercePrice {
  const decimals = Math.max(
    0,
    product.currencyDecimals,
  );

  return {
    price: convertPriceToMinorUnits(
      product.price,
      decimals,
    ),

    regular_price: convertPriceToMinorUnits(
      product.regularPrice,
      decimals,
    ),

    sale_price: convertPriceToMinorUnits(
      product.salePrice,
      decimals,
    ),

    currency_code: product.currency,

    currency_symbol:
      product.currencySymbol,

    currency_minor_unit: decimals,

    currency_decimal_separator:
      decimals > 0 ? "." : "",

    currency_thousand_separator: ",",

    currency_prefix:
      product.currencySymbol,

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

  const primaryImage =
    createWooCommerceImage(
      product.image,
      product.name,
    );

  if (primaryImage) {
    images.push(primaryImage);
  }

  for (const galleryImage of product.gallery) {
    /*
     * Tránh lặp lại ảnh đại diện nếu backend vô tình
     * đưa cùng attachment vào gallery.
     */
    if (
      primaryImage &&
      galleryImage.id === primaryImage.id
    ) {
      continue;
    }

    images.push({
      id: galleryImage.id,
      src: galleryImage.src,
      thumbnail: galleryImage.src,
      srcset: "",
      sizes: "",
      name: product.name,
      alt:
        galleryImage.alt ||
        product.name,
    });
  }

  return images;
}

function createWooCommerceCategories(
  product: LocalizedProduct,
): WooCommerceProductCategory[] {
  return product.categories.map(
    (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }),
  );
}

function createWooCommerceAttributes(
  product: LocalizedProduct,
): WooCommerceProductAttribute[] {
  return product.attributes.map(
    (attribute, attributeIndex) => ({
      id: attributeIndex + 1,
      name: attribute.name,
      taxonomy:
        attribute.slug || null,
      has_variations: false,

      terms: attribute.options.map(
        (option, optionIndex) => ({
          id: optionIndex + 1,
          name: option,
          slug: option
            .trim()
            .toLocaleLowerCase()
            .replace(/\s+/g, "-"),
        }),
      ),
    }),
  );
}

/**
 * Adapter LocalizedProduct → WooCommerceProduct.
 *
 * Nhờ adapter này, các component hiện tại như
 * FeaturedProducts và ProductSummary chưa cần sửa.
 */
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

    short_description:
      product.shortDescription,

    description:
      product.description,

    on_sale:
      product.onSale,

    prices:
      createWooCommercePrice(product),

    images:
      createWooCommerceImages(product),

    categories:
      createWooCommerceCategories(product),

    tags: [],

    attributes:
      createWooCommerceAttributes(product),

    is_purchasable:
      product.purchasable,

    is_in_stock:
      product.inStock,

    low_stock_remaining: null,

    average_rating: "0",
    review_count: 0,

    add_to_cart: {
      text: "Thêm vào giỏ hàng",
      description:
        `Thêm ${product.name} vào giỏ hàng`,
      url: "",
      minimum: 1,
      maximum: 99,
      multiple_of: 1,
    },
  };
}

/**
 * Lấy Product Listing từ YSim Localization API.
 */
export async function getProducts(
  options: GetProductsOptions = {},
): Promise<WooCommerceProduct[]> {
  const response =
    await getLocalizedProducts({
      page:
        options.page ?? 1,

      pageSize:
        options.perPage ?? 12,

      search:
        options.search,

      category:
        options.category,

      locale:
        options.locale ?? "vi",

      destination:
        options.destination,

      featured:
        options.featured,
    });

  return response.items.map(
    adaptLocalizedProduct,
  );
}

/**
 * Product Detail theo slug vẫn sử dụng WooCommerce Store API.
 *
 * Milestone kế tiếp sẽ chuyển detail sang Family Code resolver.
 */
export async function getProductBySlug(
  slug: string,
): Promise<WooCommerceProduct | null> {
  try {
    return await storeApiFetch<WooCommerceProduct>(
      `/products/${encodeURIComponent(slug)}`,
      {
        revalidate: 300,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    if (
      message.includes("404") ||
      message.includes(
        "woocommerce_rest_product_invalid_slug",
      ) ||
      message.includes(
        "woocommerce_rest_product_invalid_id",
      )
    ) {
      return null;
    }

    throw error;
  }
}
