import type {
  ContentGateway,
  ContentListQuery,
  ContentDetailQuery,
} from "./content-gateway";

import type {
  ContentKind,
  WordPressContentSource,
} from "@/types/view-models/content";

export interface WordPressRestGatewayOptions {
  baseUrl: string;
  namespace?:
    string;
  fetcher?:
    typeof fetch;
  headers?:
    Readonly<
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

function assertContentArray(
  value: unknown,
): readonly WordPressContentSource[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new Error(
      "Invalid WordPress content list response.",
    );
  }

  return value as
    readonly WordPressContentSource[];
}

function assertContentDetail(
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
      "Invalid WordPress content detail response.",
    );
  }

  return value as
    WordPressContentSource;
}

export function createWordPressRestGateway({
  baseUrl,
  namespace =
    "ysim/v1/content",
  fetcher =
    fetch,
  headers,
}: WordPressRestGatewayOptions): ContentGateway {
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
        `WordPress content request failed: ${response.status}`,
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

      const result =
        await request(url);

      return assertContentArray(
        result,
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

      const result =
        await request(url);

      return assertContentDetail(
        result,
      );
    },
  };
}
