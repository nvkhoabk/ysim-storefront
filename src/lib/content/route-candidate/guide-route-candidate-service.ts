import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import {
  loadGuideArticle,
  loadGuideLanding,
} from "@/lib/content/integration";

import {
  contentPreviewArticlePage,
  contentPreviewLanding,
} from "@/config/storefront-content-preview";

import type {
  ArticleCardViewModel,
  ContentCategoryViewModel,
  ContentLocale,
} from "@/types/view-models/content";

import type {
  GuideArticleRouteCandidateViewModel,
  GuideLandingRouteCandidateViewModel,
} from "@/types/view-models/guide-route-candidate";

function landingHref(locale: ContentLocale, category?: string): string {
  const params = new URLSearchParams({ locale });
  if (category && category !== "all") params.set("category", category);
  return `/ui-preview/guides-route-candidate?${params.toString()}`;
}

function detailHref(locale: ContentLocale, slug: string): string {
  return `/ui-preview/guides-route-candidate/${slug}?locale=${locale}`;
}

function mapCategories(
  items: readonly ContentCategoryViewModel[],
  locale: ContentLocale,
): readonly ContentCategoryViewModel[] {
  return items.map((item) => ({
    ...item,
    href: landingHref(locale, item.id),
  }));
}

function mapArticles(
  items: readonly ArticleCardViewModel[],
  locale: ContentLocale,
): readonly ArticleCardViewModel[] {
  return items.map((item) => ({
    ...item,
    href: detailHref(locale, item.slug),
  }));
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function loadGuideLandingRouteCandidate({
  locale,
  category,
}: {
  locale: ContentLocale;
  category?: string;
}): Promise<GuideLandingRouteCandidateViewModel> {
  const routeMode = getProductionRouteMode("guides");

  try {
    const result = await loadGuideLanding({ locale, category });

    return {
      routeMode,
      routeModeLabel: getProductionRouteModeLabel(routeMode),
      environmentFlag: getProductionRouteFlag("guides"),
      sourceMode: result.sourceMode,
      sourceModeLabel:
        result.sourceMode === "wordpress" ? "WordPress" : "Fixture",
      requestedLocale: locale,
      diagnostic: {
        status: result.sourceMode === "wordpress" ? "live" : "fixture",
        statusLabel: result.sourceMode === "wordpress" ? "Live" : "Fixture",
        message:
          result.sourceMode === "wordpress"
            ? `${result.page.articles.length} bài Guide từ WordPress.`
            : "Guide Server Service đang dùng fixture.",
      },
      warnings: [
        "Production route /guides is unchanged.",
        "Legacy Guide landing remains the rollback path.",
      ],
      page: {
        ...result.page,
        categories: mapCategories(result.page.categories, locale),
        articles: mapArticles(result.page.articles, locale),
      },
    };
  } catch (error) {
    const articles = contentPreviewLanding.articles
      .filter((item) =>
        !category || category === "all"
          ? true
          : item.category?.toLowerCase().includes(category.toLowerCase()),
      );

    return {
      routeMode,
      routeModeLabel: getProductionRouteModeLabel(routeMode),
      environmentFlag: getProductionRouteFlag("guides"),
      sourceMode: "fixture",
      sourceModeLabel: "Fixture fallback",
      requestedLocale: locale,
      diagnostic: {
        status: "fallback",
        statusLabel: "Fallback",
        message: `WordPress candidate failed: ${message(error)}`,
      },
      warnings: [
        "Production route /guides is unchanged.",
        "Candidate is using reviewed fixture fallback.",
      ],
      page: {
        ...contentPreviewLanding,
        categories: mapCategories(contentPreviewLanding.categories, locale),
        activeCategoryId: category || "all",
        articles: mapArticles(articles, locale),
      },
    };
  }
}

export async function loadGuideArticleRouteCandidate({
  locale,
  slug,
}: {
  locale: ContentLocale;
  slug: string;
}): Promise<GuideArticleRouteCandidateViewModel | null> {
  const routeMode = getProductionRouteMode("guide-detail");

  try {
    const result = await loadGuideArticle({ locale, slug });

    if (result) {
      return {
        routeMode,
        routeModeLabel: getProductionRouteModeLabel(routeMode),
        environmentFlag: getProductionRouteFlag("guide-detail"),
        sourceMode: result.sourceMode,
        sourceModeLabel:
          result.sourceMode === "wordpress" ? "WordPress" : "Fixture",
        requestedLocale: locale,
        resolvedLocale: result.resolvedLocale,
        usedFallback: result.usedFallback,
        diagnostic: {
          status: result.sourceMode === "wordpress" ? "live" : "fixture",
          statusLabel: result.sourceMode === "wordpress" ? "Live" : "Fixture",
          message: result.usedFallback
            ? `Fallback sang ${result.resolvedLocale.toUpperCase()}.`
            : "Nội dung đúng locale yêu cầu.",
        },
        warnings: [
          "Production route /guides/[slug] is unchanged.",
          "Legacy Guide detail remains the rollback path.",
        ],
        page: {
          ...result.page,
          article: {
            ...result.page.article,
            href: detailHref(locale, result.page.article.slug),
          },
          relatedArticles: mapArticles(result.page.relatedArticles, locale),
        },
      };
    }
  } catch (error) {
    if (contentPreviewArticlePage.article.slug !== slug) return null;

    return {
      routeMode,
      routeModeLabel: getProductionRouteModeLabel(routeMode),
      environmentFlag: getProductionRouteFlag("guide-detail"),
      sourceMode: "fixture",
      sourceModeLabel: "Fixture fallback",
      requestedLocale: locale,
      resolvedLocale: contentPreviewArticlePage.article.locale,
      usedFallback: contentPreviewArticlePage.article.locale !== locale,
      diagnostic: {
        status: "fallback",
        statusLabel: "Fallback",
        message: `WordPress candidate failed: ${message(error)}`,
      },
      warnings: [
        "Production route /guides/[slug] is unchanged.",
        "Candidate is using reviewed fixture fallback.",
      ],
      page: {
        ...contentPreviewArticlePage,
        article: {
          ...contentPreviewArticlePage.article,
          href: detailHref(locale, slug),
        },
        relatedArticles: mapArticles(
          contentPreviewArticlePage.relatedArticles,
          locale,
        ),
      },
    };
  }

  if (contentPreviewArticlePage.article.slug !== slug) return null;

  return {
    routeMode,
    routeModeLabel: getProductionRouteModeLabel(routeMode),
    environmentFlag: getProductionRouteFlag("guide-detail"),
    sourceMode: "fixture",
    sourceModeLabel: "Fixture fallback",
    requestedLocale: locale,
    resolvedLocale: contentPreviewArticlePage.article.locale,
    usedFallback: contentPreviewArticlePage.article.locale !== locale,
    diagnostic: {
      status: "fallback",
      statusLabel: "Fallback",
      message: "Guide không tồn tại trong nguồn active; dùng fixture candidate.",
    },
    warnings: [
      "Production route /guides/[slug] is unchanged.",
      "Candidate is using reviewed fixture fallback.",
    ],
    page: {
      ...contentPreviewArticlePage,
      article: {
        ...contentPreviewArticlePage.article,
        href: detailHref(locale, slug),
      },
      relatedArticles: mapArticles(
        contentPreviewArticlePage.relatedArticles,
        locale,
      ),
    },
  };
}
