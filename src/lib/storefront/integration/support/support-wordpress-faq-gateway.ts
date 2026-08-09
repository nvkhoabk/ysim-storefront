import type {
  SupportFaqGateway,
  WordPressSupportFaqSource,
} from "@/types/view-models/support-production";

import type {
  SupportFaqViewModel,
} from "@/types/view-models/support";

export interface SupportWordPressFaqGatewayOptions {
  baseUrl: string;
  namespace?: string;
  locale: string;
  limit?: number;
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

function boundedLimit(
  value:
    | number
    | undefined,
): number {
  if (
    !value ||
    !Number.isFinite(
      value,
    )
  ) {
    return 20;
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

function renderedText(
  value:
    | string
    | {
        rendered?: string;
      }
    | undefined,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return value?.rendered ||
    "";
}

function htmlToText(
  value: string,
): string {
  return value
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " ",
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " ",
    )
    .replace(
      /<[^>]+>/g,
      " ",
    )
    .replace(
      /&nbsp;/gi,
      " ",
    )
    .replace(
      /&amp;/gi,
      "&",
    )
    .replace(
      /&quot;/gi,
      '"',
    )
    .replace(
      /&#039;/gi,
      "'",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function unwrapItems(
  value: unknown,
): readonly WordPressSupportFaqSource[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value as
      readonly WordPressSupportFaqSource[];
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
          readonly WordPressSupportFaqSource[];
      }
    ).items;
  }

  throw new Error(
    "Invalid WordPress FAQ response.",
  );
}

function toFaq(
  source:
    WordPressSupportFaqSource,
  index: number,
): SupportFaqViewModel | null {
  const question =
    htmlToText(
      source.question ||
      renderedText(
        source.title,
      ) ||
      source.slug ||
      "",
    );

  const answer =
    htmlToText(
      source.answer ||
      renderedText(
        source.content,
      ) ||
      renderedText(
        source.excerpt,
      ),
    );

  if (
    !question ||
    !answer
  ) {
    return null;
  }

  return {
    id:
      String(
        source.id ||
        source.slug ||
        `faq-${index + 1}`,
      ),
    question,
    answer,
  };
}

export function createSupportWordPressFaqGateway({
  baseUrl,
  namespace =
    "ysim/v1/content",
  locale,
  limit,
  fetcher =
    fetch,
  revalidateSeconds =
    300,
}: SupportWordPressFaqGatewayOptions):
  SupportFaqGateway {
  const normalizedBaseUrl =
    normalizeBaseUrl(
      baseUrl,
    );

  return {
    async load():
      Promise<
        readonly SupportFaqViewModel[]
      > {
      const url =
        new URL(
          `${normalizedBaseUrl}/wp-json/${namespace}/faqs`,
        );

      url.searchParams.set(
        "locale",
        locale,
      );
      url.searchParams.set(
        "page",
        "1",
      );
      url.searchParams.set(
        "pageSize",
        String(
          boundedLimit(
            limit,
          ),
        ),
      );

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

      if (!response.ok) {
        const body =
          await response
            .text();

        throw new Error(
          `WordPress FAQ API ${response.status}: ${body.slice(0, 180)}`,
        );
      }

      return unwrapItems(
        await response.json(),
      )
        .map(
          toFaq,
        )
        .filter(
          (
            item,
          ): item is SupportFaqViewModel =>
            Boolean(
              item,
            ),
        );
    },
  };
}
