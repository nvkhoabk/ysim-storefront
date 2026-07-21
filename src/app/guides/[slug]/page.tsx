/* YSIM_PACKAGE_24_ACTIVATION:guide-detail */
import {
  notFound,
} from "next/navigation";

import LegacyGuideDetailPage from "./legacy-page";

import {
  ArticlePageComposition,
} from "@/components/content/refactor";

import {
  GuideArticleRouteCandidatePage,
} from "@/components/content/refactor/integration";

import {
  parseContentLocale,
} from "@/lib/content/integration";

import {
  loadGuideArticleRouteCandidate,
} from "@/lib/content/route-candidate";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";



export default async function GuideDetailPage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "guide-detail",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacyGuideDetailPage
        {...props}
      />
    );
  }

  const params =
    await props.params;

  const query =
    await (
      props.searchParams ||
      Promise.resolve({})
    );

  const locale =
    parseContentLocale(
      query.locale,
    );

  const candidate =
    await loadGuideArticleRouteCandidate({
      locale,
      slug:
        params.slug,
    });

  if (!candidate) {
    notFound();
  }

  if (
    mode ===
    "candidate"
  ) {
    return (
      <GuideArticleRouteCandidatePage
        candidate={
          candidate
        }
      />
    );
  }

  return (
    <ArticlePageComposition
      page={
        candidate.page
      }
    />
  );
}
