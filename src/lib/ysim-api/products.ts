import type {
  ProductListQuery,
  ProductListResponse,
  ProductResolverResponse,
} from "@/lib/models/product";

import {
  api,
  ApiError,
} from "./client";

/**
 * Tạo query string cho Product Listing API.
 */
function createProductQueryString(
  query: ProductListQuery,
): string {
  const params = new URLSearchParams();

  if (query.locale) {
    params.set("locale", query.locale);
  }

  if (query.destination) {
    params.set("destination", query.destination);
  }

  if (query.category) {
    params.set("category", query.category);
  }

  if (query.featured !== undefined) {
    params.set(
      "featured",
      query.featured ? "1" : "0",
    );
  }

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.page !== undefined) {
    params.set(
      "page",
      String(Math.max(1, query.page)),
    );
  }

  if (query.pageSize !== undefined) {
    params.set(
      "pageSize",
      String(
        Math.min(
          100,
          Math.max(1, query.pageSize),
        ),
      ),
    );
  }

  const queryString = params.toString();

  return queryString
    ? `?${queryString}`
    : "";
}

/**
 * Lấy danh sách product family đã resolve theo locale.
 */
export async function getLocalizedProducts(
  query: ProductListQuery = {},
): Promise<ProductListResponse> {
  const queryString =
    createProductQueryString(query);

  return api.get<ProductListResponse>(
    `/products${queryString}`,
    {
      cache: "force-cache",
      next: {
        revalidate: 60,
      },
    },
  );
}

/**
 * Resolve một product theo Family Code.
 */
export async function getLocalizedProduct(
  familyCode: string,
  locale = "vi",
): Promise<ProductResolverResponse | null> {
  const normalizedFamilyCode =
    familyCode.trim().toUpperCase();

  if (!normalizedFamilyCode) {
    return null;
  }

  const params = new URLSearchParams({
    locale,
  });

  try {
    return await api.get<ProductResolverResponse>(
      `/products/${encodeURIComponent(
        normalizedFamilyCode,
      )}?${params.toString()}`,
      {
        cache: "force-cache",
        next: {
          revalidate: 60,
        },
      },
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return null;
    }

    throw error;
  }
}

/**
 * Resolve localized product từ slug SEO hiện tại.
 *
 * Slug có thể thuộc bất kỳ localized product nào trong family.
 * Backend sẽ tìm family rồi resolve sang locale yêu cầu.
 */
export async function getLocalizedProductBySlug(
  slug: string,
  locale = "vi",
): Promise<ProductResolverResponse | null> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const params = new URLSearchParams({
    locale,
  });

  try {
    return await api.get<ProductResolverResponse>(
      `/products/by-slug/${encodeURIComponent(
        normalizedSlug,
      )}?${params.toString()}`,
      {
        cache: "force-cache",
        next: {
          revalidate: 60,
        },
      },
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return null;
    }

    throw error;
  }
}
