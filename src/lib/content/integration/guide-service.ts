import {
  guideCategories,
  guideLandingHero,
  contentLocaleFallbacks,
} from "@/config/storefront-content";

import {
  createArticleCardViewModel,
  createArticlePageViewModel,
} from "@/lib/content/refactor/content-presenter";

import type {
  ContentGateway,
} from "@/lib/content/refactor/content-gateway";

import type {
  ArticleCardViewModel,
  ContentCategoryViewModel,
  ContentLocale,
  WordPressContentSource,
} from "@/types/view-models/content";

import type {
  GuideArticleIntegrationResult,
  GuideLandingIntegrationResult,
} from "@/types/view-models/guide-integration";

import {
  createGuideContentRuntime,
} from "./guide-runtime";

const supportedLocales:
  readonly ContentLocale[] = [
    "vi",
    "en",
    "ja",
    "ko",
  ];

export function parseContentLocale(
  value:
    | string
    | null
    | undefined,
): ContentLocale {
  return supportedLocales.includes(
    value as ContentLocale,
  )
    ? (
        value as
          ContentLocale
      )
    : "vi";
}

function previewGuideHref(
  slug: string,
  requestedLocale:
    ContentLocale,
): string {
  return `/ui-preview/guide-integration/${slug}?locale=${requestedLocale}`;
}

function toPreviewCard(
  source:
    WordPressContentSource,
  requestedLocale:
    ContentLocale,
): ArticleCardViewModel {
  const card =
    createArticleCardViewModel(
      source,
    );

  return {
    ...card,

    href:
      previewGuideHref(
        source.slug,
        requestedLocale,
      ),
  };
}

function previewCategories(
  locale:
    ContentLocale,
  activeCategory?: string,
): readonly ContentCategoryViewModel[] {
  return guideCategories.map(
    (category) => {
      const params =
        new URLSearchParams();

      params.set(
        "locale",
        locale,
      );

      if (
        category.id !==
        "all"
      ) {
        params.set(
          "category",
          category.id,
        );
      }

      return {
        ...category,

        href:
          `/ui-preview/guide-integration?${params.toString()}`,
      };
    },
  );
}

async function listWithFallback(
  gateway:
    ContentGateway,
  locale:
    ContentLocale,
  category?: string,
): Promise<
  readonly WordPressContentSource[]
> {
  const fallbackChain =
    contentLocaleFallbacks[
      locale
    ];

  const byFamily =
    new Map<
      string,
      WordPressContentSource
    >();

  for (
    const candidateLocale
    of fallbackChain
  ) {
    const items =
      await gateway.list({
        kind:
          "guide",

        locale:
          candidateLocale,

        category:
          category &&
          category !== "all"
            ? category
            : undefined,

        page:
          1,

        pageSize:
          100,
      });

    for (
      const item
      of items
    ) {
      if (
        !byFamily.has(
          item.contentFamilyCode,
        )
      ) {
        byFamily.set(
          item.contentFamilyCode,
          item,
        );
      }
    }
  }

  return Array.from(
    byFamily.values(),
  ).sort(
    (left, right) => {
      const leftDate =
        left.publishedAt
          ? new Date(
              left.publishedAt,
            ).getTime()
          : 0;

      const rightDate =
        right.publishedAt
          ? new Date(
              right.publishedAt,
            ).getTime()
          : 0;

      return (
        rightDate -
        leftDate
      );
    },
  );
}

async function getDetailWithFallback(
  gateway:
    ContentGateway,
  locale:
    ContentLocale,
  slug: string,
): Promise<{
  source:
    WordPressContentSource;
  resolvedLocale:
    ContentLocale;
} | null> {
  const fallbackChain =
    contentLocaleFallbacks[
      locale
    ];

  for (
    const candidateLocale
    of fallbackChain
  ) {
    const source =
      await gateway.getBySlug({
        kind:
          "guide",

        locale:
          candidateLocale,

        slug,
      });

    if (source) {
      return {
        source,
        resolvedLocale:
          candidateLocale,
      };
    }
  }

  return null;
}

export async function loadGuideLanding({
  locale =
    "vi",
  category,
}: {
  locale?:
    ContentLocale;
  category?: string;
}): Promise<
  GuideLandingIntegrationResult
> {
  const runtime =
    createGuideContentRuntime();

  const sources =
    await listWithFallback(
      runtime.gateway,
      locale,
      category,
    );

  const sourceLabel =
    runtime.mode ===
      "wordpress"
      ? "WordPress CMS"
      : "Fixture preview";

  return {
    sourceMode:
      runtime.mode,

    requestedLocale:
      locale,

    page: {
      hero:
        guideLandingHero,

      categories:
        previewCategories(
          locale,
          category,
        ),

      activeCategoryId:
        category ||
        "all",

      section: {
        eyebrow:
          "Cẩm nang YSim",

        title:
          "Hướng dẫn eSIM dành cho bạn",

        description:
          `Nguồn dữ liệu hiện tại: ${sourceLabel}.`,
      },

      articles:
        sources.map(
          (source) =>
            toPreviewCard(
              source,
              locale,
            ),
        ),

      callout: {
        title:
          runtime.mode ===
            "wordpress"
            ? "Đã kết nối WordPress CMS"
            : "Đang sử dụng fixture",

        description:
          runtime.mode ===
            "wordpress"
            ? "Guide được tải qua ContentGateway từ plugin ysim-content-localization."
            : "Thiết lập YSIM_WORDPRESS_CONTENT_BASE_URL để chuyển sang WordPress.",

        tone:
          runtime.mode ===
            "wordpress"
            ? "success"
            : "info",
      },
    },
  };
}

export async function loadGuideArticle({
  locale =
    "vi",
  slug,
}: {
  locale?:
    ContentLocale;
  slug: string;
}): Promise<
  GuideArticleIntegrationResult | null
> {
  const runtime =
    createGuideContentRuntime();

  const detail =
    await getDetailWithFallback(
      runtime.gateway,
      locale,
      slug,
    );

  if (!detail) {
    return null;
  }

  const article =
    createArticlePageViewModel(
      detail.source,
    );

  const allSources =
    await listWithFallback(
      runtime.gateway,
      locale,
    );

  const related =
    allSources
      .filter(
        (item) =>
          item.contentFamilyCode !==
          detail.source
            .contentFamilyCode,
      )
      .slice(
        0,
        3,
      )
      .map(
        (source) =>
          toPreviewCard(
            source,
            locale,
          ),
      );

  return {
    sourceMode:
      runtime.mode,

    requestedLocale:
      locale,

    resolvedLocale:
      detail.resolvedLocale,

    usedFallback:
      detail.resolvedLocale !==
      locale,

    page: {
      article: {
        ...article,

        href:
          previewGuideHref(
            detail.source.slug,
            locale,
          ),
      },

      relatedTitle:
        "Tiếp tục tìm hiểu về eSIM",

      relatedArticles:
        related,

      callout: {
        title:
          detail.resolvedLocale !==
          locale
            ? "Đang hiển thị nội dung dự phòng"
            : "Cần hỗ trợ thêm?",

        description:
          detail.resolvedLocale !==
          locale
            ? `Chưa có bản dịch ${locale.toUpperCase()}; nội dung được lấy từ ${detail.resolvedLocale.toUpperCase()}.`
            : "Trung tâm hỗ trợ YSim luôn sẵn sàng đồng hành cùng bạn.",

        tone:
          detail.resolvedLocale !==
          locale
            ? "warning"
            : "info",
      },
    },
  };
}
