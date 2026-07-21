import type {
  ContentDetailQuery,
  ContentGateway,
  ContentListQuery,
} from "@/lib/content/refactor/content-gateway";

import {
  htmlToPlainText,
} from "@/lib/content/refactor/content-presenter";

import type {
  WordPressContentSource,
} from "@/types/view-models/content";

function normalize(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

export function createFixtureContentGateway(
  fixtures:
    readonly WordPressContentSource[],
): ContentGateway {
  return {
    async list(
      query:
        ContentListQuery,
    ) {
      const search =
        normalize(
          query.search ||
          "",
        );

      const filtered =
        fixtures.filter(
          (item) => {
            if (
              item.kind !==
                query.kind ||
              item.locale !==
                query.locale
            ) {
              return false;
            }

            if (
              query.category &&
              !item.categoryIds?.includes(
                query.category,
              )
            ) {
              return false;
            }

            if (!search) {
              return true;
            }

            return normalize(
              [
                htmlToPlainText(
                  item.titleHtml,
                ),
                htmlToPlainText(
                  item.excerptHtml,
                ),
                item.categoryLabels?.join(
                  " ",
                ),
              ]
                .filter(Boolean)
                .join(" "),
            ).includes(
              search,
            );
          },
        );

      const page =
        Math.max(
          query.page || 1,
          1,
        );

      const pageSize =
        Math.max(
          query.pageSize || 12,
          1,
        );

      const start =
        (page - 1) *
        pageSize;

      return filtered.slice(
        start,
        start + pageSize,
      );
    },

    async getBySlug(
      query:
        ContentDetailQuery,
    ) {
      return (
        fixtures.find(
          (item) =>
            item.kind ===
              query.kind &&
            item.locale ===
              query.locale &&
            item.slug ===
              query.slug,
        ) || null
      );
    },
  };
}
