import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import { loadGuideArticle, loadGuideLanding } from "@/lib/content/integration";

import {
  contentPreviewArticlePage,
  contentPreviewLanding,
} from "@/config/storefront-content-preview";

import { createSecondaryTranslator } from "@/i18n/secondary/secondary.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import { normalizeShellLocale } from "@/i18n/shell/shell.registry";

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
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  const pathname = localizeShellHref("/guides", normalizeShellLocale(locale));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function detailHref(locale: ContentLocale, slug: string): string {
  return localizeShellHref(
    `/guides/${encodeURIComponent(slug)}`,
    normalizeShellLocale(locale),
  );
}

function mapCategories(
  items: readonly ContentCategoryViewModel[],
  locale: ContentLocale,
): readonly ContentCategoryViewModel[] {
  const t = createSecondaryTranslator(locale);
  const labels: Readonly<Record<string, string>> = {
    all: t("guides.categoryAll"),
    installation: t("guides.categoryInstallation"),
    device: t("guides.categoryDevice"),
    usage: t("guides.categoryUsage"),
    faq: t("guides.categoryFaq"),
  };

  return items.map((item) => ({
    ...item,
    label: labels[item.id] ?? item.label,
    href: landingHref(locale, item.id),
  }));
}

function localizeLandingPage(
  page: GuideLandingRouteCandidateViewModel["page"],
  locale: ContentLocale,
): GuideLandingRouteCandidateViewModel["page"] {
  const t = createSecondaryTranslator(locale);

  return {
    ...page,
    hero: {
      ...page.hero,
      eyebrow: t("guides.eyebrow"),
      title: t("guides.title"),
      highlightedText: undefined,
      description: t("guides.description"),
    },
    categories: mapCategories(page.categories, locale),
    section: {
      ...page.section,
      eyebrow: t("guides.eyebrow"),
      title: t("guides.featured"),
      description: t("common.sourceNotice"),
    },
    articles: mapArticles(page.articles, locale),
    callout: undefined,
  };
}

function localizeArticlePage(
  page: GuideArticleRouteCandidateViewModel["page"],
  locale: ContentLocale,
): GuideArticleRouteCandidateViewModel["page"] {
  const t = createSecondaryTranslator(locale);

  return {
    ...page,
    article: {
      ...page.article,
      href: detailHref(locale, page.article.slug),
    },
    relatedTitle: t("guides.related"),
    relatedArticles: mapArticles(page.relatedArticles, locale),
    callout:
      page.article.locale === locale
        ? undefined
        : {
            title: t("guides.fallbackTitle"),
            description: t("common.sourceNotice"),
            tone: "info",
          },
  };
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
      page: localizeLandingPage(result.page, locale),
    };
  } catch (error) {
    const articles = contentPreviewLanding.articles.filter((item) =>
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
      page: localizeLandingPage(
        {
          ...contentPreviewLanding,
          activeCategoryId: category || "all",
          articles,
        },
        locale,
      ),
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
        page: localizeArticlePage(result.page, locale),
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
      page: localizeArticlePage(contentPreviewArticlePage, locale),
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
      message:
        "Guide không tồn tại trong nguồn active; dùng fixture candidate.",
    },
    warnings: [
      "Production route /guides/[slug] is unchanged.",
      "Candidate is using reviewed fixture fallback.",
    ],
    page: localizeArticlePage(contentPreviewArticlePage, locale),
  };
}
