import { storeApiFetch } from "./store-api";
import type { WooCommerceProduct } from "./types";

interface GetProductsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<WooCommerceProduct[]> {
  const params = new URLSearchParams();

  params.set("page", String(options.page ?? 1));
  params.set("per_page", String(options.perPage ?? 12));

  if (options.search) {
    params.set("search", options.search);
  }

  if (options.category) {
    params.set("category", options.category);
  }

  return storeApiFetch<WooCommerceProduct[]>(
    `/products?${params.toString()}`,
    {
      revalidate: 300,
    },
  );
}

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
      error instanceof Error ? error.message : String(error);

    if (
      message.includes("404") ||
      message.includes("woocommerce_rest_product_invalid_slug") ||
      message.includes("woocommerce_rest_product_invalid_id")
    ) {
      return null;
    }

    throw error;
  }
}