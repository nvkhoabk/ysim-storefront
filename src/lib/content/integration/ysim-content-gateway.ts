import type {
  ContentDetailQuery,
  ContentGateway,
  ContentListQuery,
} from "@/lib/content/refactor/content-gateway";

import type {
  ContentKind,
  WordPressContentSource,
} from "@/types/view-models/content";

export interface YSimContentGatewayOptions {
  baseUrl: string;
  namespace?: string;
  fetcher?: typeof fetch;
  headers?: Readonly<
    Record<string, string>
  >;
}

const kindEndpoint:
  Readonly<
    Record<
      ContentKind,
      string
    >
  > = {
    guide:
      "guides",
    help:
      "help",
    policy:
      "policies",
    faq:
      "faq",
  };

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
    "Invalid YSim Content list response.",
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
      "Invalid YSim Content detail response.",
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

    if (
      item === null ||
      item === undefined
    ) {
      return null;
    }

    if (
      typeof item !==
        "object"
    ) {
      throw new Error(
        "Invalid YSim Content detail envelope.",
      );
    }

    return item as
      WordPressContentSource;
  }

  return value as
    WordPressContentSource;
}

export function createYSimContentGateway({
  baseUrl,
  namespace =
    "ysim/v1/content",
  fetcher =
    fetch,
  headers,
}: YSimContentGatewayOptions): ContentGateway {
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
            ...headers,
          },
          cache:
            "no-store",
        },
      );

    if (
      response.status ===
      404
    ) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `YSim Content request failed: ${response.status}`,
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
        kindEndpoint[
          query.kind
        ];

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
          query.page || 1,
        ),
      );
      url.searchParams.set(
        "pageSize",
        String(
          query.pageSize || 12,
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
        await request(url),
      );
    },

    async getBySlug(
      query:
        ContentDetailQuery,
    ) {
      const endpoint =
        kindEndpoint[
          query.kind
        ];

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
        await request(url),
      );
    },
  };
}
