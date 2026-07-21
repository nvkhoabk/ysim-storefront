import type {
  WooCommerceProduct,
} from "@/lib/woocommerce/types";

import type {
  HomeCommerceGateway,
  HomeCommerceSnapshot,
  WooCommerceStoreCategorySource,
} from "@/types/view-models/home-production";

export interface HomeWooCommerceGatewayOptions {
  baseUrl: string;
  fetcher?:
    typeof fetch;
  productFetchLimit?: number;
  categoryFetchLimit?: number;
  revalidateSeconds?: number;
}

function normalizeBaseUrl(
  value: string,
): string {
  return value.replace(
    /\/+$/g,
    "",
  );
}

function normalizeLimit(
  value:
    | number
    | undefined,
  fallback: number,
): number {
  if (
    !value ||
    !Number.isFinite(
      value,
    )
  ) {
    return fallback;
  }

  return Math.max(
    1,
    Math.min(
      100,
      Math.floor(
        value,
      ),
    ),
  );
}

function assertArray<T>(
  value: unknown,
  label: string,
): readonly T[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new Error(
      `Invalid WooCommerce ${label} response.`,
    );
  }

  return value as
    readonly T[];
}

export function createHomeWooCommerceGateway({
  baseUrl,
  fetcher =
    fetch,
  productFetchLimit,
  categoryFetchLimit,
  revalidateSeconds =
    60,
}: HomeWooCommerceGatewayOptions):
  HomeCommerceGateway {
  const normalizedBaseUrl =
    normalizeBaseUrl(
      baseUrl,
    );

  const storeApiBaseUrl =
    `${normalizedBaseUrl}/wp-json/wc/store/v1`;

  async function request(
    endpoint: string,
  ): Promise<unknown> {
    const response =
      await fetcher(
        `${storeApiBaseUrl}${endpoint}`,
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json",
          },

          next: {
            revalidate:
              revalidateSeconds,
          },
        },
      );

    if (!response.ok) {
      const body =
        await response
          .text();

      throw new Error(
        `WooCommerce Store API ${response.status}: ${body.slice(0, 180)}`,
      );
    }

    return response.json();
  }

  return {
    async load():
      Promise<
        HomeCommerceSnapshot
      > {
      const productLimit =
        normalizeLimit(
          productFetchLimit,
          48,
        );

      const categoryLimit =
        normalizeLimit(
          categoryFetchLimit,
          100,
        );

      const [
        productsResponse,
        categoriesResponse,
      ] =
        await Promise.all([
          request(
            `/products?per_page=${productLimit}&catalog_visibility=visible`,
          ),

          request(
            `/products/categories?per_page=${categoryLimit}`,
          ),
        ]);

      return {
        products:
          assertArray<
            WooCommerceProduct
          >(
            productsResponse,
            "products",
          ),

        categories:
          assertArray<
            WooCommerceStoreCategorySource
          >(
            categoriesResponse,
            "categories",
          ),
      };
    },
  };
}
