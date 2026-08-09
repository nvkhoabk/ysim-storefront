import type {
  Metadata,
} from "next";

import type {
  ArticlePageViewModel,
} from "@/types/view-models/content";

export function createGuideMetadata(
  article:
    ArticlePageViewModel,
): Metadata {
  return {
    title:
      article.seo.title,

    description:
      article.seo.description,

    alternates:
      article.seo
        .canonicalUrl
        ? {
            canonical:
              article.seo
                .canonicalUrl,
          }
        : undefined,

    robots:
      article.seo.noindex
        ? {
            index:
              false,
            follow:
              false,
          }
        : undefined,

    openGraph: {
      title:
        article.seo.title,

      description:
        article.seo
          .description,

      images:
        article.seo
          .ogImageUrl
          ? [
              {
                url:
                  article.seo
                    .ogImageUrl,
              },
            ]
          : undefined,

      type:
        "article",
    },
  };
}
