import type {
  ApiCollection,
} from "@/lib/models/common";

import type {
  Category,
  Destination,
} from "@/lib/models/catalog";

import {
  api,
} from "./client";

export interface CategoryQuery {
  includeEmpty?: boolean;
  parent?: number;
}

export interface DestinationQuery {
  includeEmpty?: boolean;
}

/**
 * Tạo query string và bỏ qua các giá trị không được khai báo.
 */
function createQueryString(
  values: Record<
    string,
    string | number | boolean | undefined
  >,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      continue;
    }

    params.set(key, String(value));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

/**
 * Lấy danh sách WooCommerce product categories.
 */
export async function getCategories(
  query: CategoryQuery = {},
): Promise<ApiCollection<Category>> {
  const queryString = createQueryString({
    include_empty:
      query.includeEmpty === undefined
        ? undefined
        : query.includeEmpty
          ? 1
          : 0,

    parent: query.parent,
  });

  return api.get<ApiCollection<Category>>(
    `/categories${queryString}`,
    {
      cache: "force-cache",
      next: {
        revalidate: 300,
      },
    },
  );
}

/**
 * Lấy các product category cấp cao nhất dưới dạng destination.
 */
export async function getDestinations(
  query: DestinationQuery = {},
): Promise<ApiCollection<Destination>> {
  const queryString = createQueryString({
    include_empty:
      query.includeEmpty === undefined
        ? undefined
        : query.includeEmpty
          ? 1
          : 0,
  });

  return api.get<ApiCollection<Destination>>(
    `/destinations${queryString}`,
    {
      cache: "force-cache",
      next: {
        revalidate: 300,
      },
    },
  );
}

/**
 * Tìm một destination theo slug.
 */
export async function getDestinationBySlug(
  slug: string,
  query: DestinationQuery = {},
): Promise<Destination | null> {
  const normalizedSlug = slug
    .trim()
    .toLocaleLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const response = await getDestinations(query);

  return (
    response.items.find(
      (destination) =>
        destination.slug.toLocaleLowerCase() ===
        normalizedSlug,
    ) ?? null
  );
}

/**
 * Tìm một destination theo code như JP, KR hoặc TH.
 */
export async function getDestinationByCode(
  code: string,
  query: DestinationQuery = {},
): Promise<Destination | null> {
  const normalizedCode = code
    .trim()
    .toLocaleUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const response = await getDestinations(query);

  return (
    response.items.find(
      (destination) =>
        destination.code.toLocaleUpperCase() ===
        normalizedCode,
    ) ?? null
  );
}
