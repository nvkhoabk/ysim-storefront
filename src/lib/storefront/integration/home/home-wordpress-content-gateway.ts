import type {
  ContentDetailQuery,
  ContentGateway,
  ContentListQuery,
} from "@/lib/content/refactor/content-gateway";

import type {
  WordPressContentSource,
} from "@/types/view-models/content";

export interface HomeWordPressContentGatewayOptions {
  baseUrl: string;
  namespace?: string;
  fetcher?:
    typeof fetch;
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

function unwrapList(
  value: unknown,
): readonly WordPressContentSource[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value as
      readonly WordPressContentSource[];
  }

  if (
    typeof value ===
      "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray(
      (
        value as {
          items?: unknown;
        }
      ).items,
    )
  ) {
    return (
      value as {
        items:
          readonly WordPressContentSource[];
      }
    ).items;
  }

  throw new Error(
    "Invalid WordPress Home content list response.",
  );
}

function unwrapDetail(
  value: unknown,
): WordPressContentSource | null {
  if (
    value === null
  ) {
    return null;
  }

  if (
    typeof value !==
      "object"
  ) {
    throw new Error(
      "Invalid WordPress Home content detail response.",
    );
  }

  if (
    "item" in value
  ) {
    const item =
      (
        value as {
          item?: unknown;
        }
      ).item;

    return (
      item &&
      typeof item ===
        "object"
    )
      ? (
          item as
            WordPressContentSource
        )
      : null;
  }

  return value as
    WordPressContentSource;
}

export function createHomeWordPressContentGateway({
  baseUrl,
  namespace =
    "ysim/v1/content",
  fetcher =
    fetch,
  revalidateSeconds =
    300,
}: HomeWordPressContentGatewayOptions):
  ContentGateway {
  const normalizedBaseUrl =
    normalizeBaseUrl(
      baseUrl,
    );

  async function request(
    url: URL,
  ): Promise<unknown> {
    const response =
      await fetcher(
        url,
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

    if (
      response.status ===
      404
    ) {
      return null;
    }

    if (!response.ok) {
      const body =
        await response
          .text();

      throw new Error(
        `WordPress Content API ${response.status}: ${body.slice(0, 180)}`,
      );
    }

    return response.json();
  }

  return {
    async list(
      query:
        ContentListQuery,
    ) {
      const endpoint =
        query.kind ===
          "guide"
          ? "guides"
          : query.kind ===
              "policy"
            ? "policies"
            : query.kind;

      const url =
        new URL(
          `${normalizedBaseUrl}/wp-json/${namespace}/${endpoint}`,
        );

      url.searchParams.set(
        "locale",
        query.locale,
      );

      url.searchParams.set(
        "page",
        String(
          query.page ||
          1,
        ),
      );

      url.searchParams.set(
        "pageSize",
        String(
          query.pageSize ||
          12,
        ),
      );

      if (
        query.category
      ) {
        url.searchParams.set(
          "category",
          query.category,
        );
      }

      if (
        query.search
      ) {
        url.searchParams.set(
          "search",
          query.search,
        );
      }

      return unwrapList(
        await request(
          url,
        ),
      );
    },

    async getBySlug(
      query:
        ContentDetailQuery,
    ) {
      const endpoint =
        query.kind ===
          "guide"
          ? "guides"
          : query.kind ===
              "policy"
            ? "policies"
            : query.kind;

      const url =
        new URL(
          `${normalizedBaseUrl}/wp-json/${namespace}/${endpoint}/${encodeURIComponent(
            query.slug,
          )}`,
        );

      url.searchParams.set(
        "locale",
        query.locale,
      );

      return unwrapDetail(
        await request(
          url,
        ),
      );
    },
  };
}
