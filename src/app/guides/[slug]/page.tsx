/* YSIM_PACKAGE_24_ACTIVATION:guide-detail */
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import LegacyGuideDetailPage from "./legacy-page";

import { ArticlePageComposition } from "@/components/content/refactor";

import { GuideArticleRouteCandidatePage } from "@/components/content/refactor/integration";

import { parseContentLocale } from "@/lib/content/integration";

import { loadGuideArticleRouteCandidate } from "@/lib/content/route-candidate";

import { createGuideMetadata } from "@/lib/content/integration";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";

interface GuideDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    locale?: string;
  }>;
}

export async function generateMetadata(
  props: GuideDetailPageProps,
): Promise<Metadata> {
  const [{ slug }, request] = await Promise.all([
    props.params,
    getStorefrontLocaleRequest(),
  ]);
  const locale = parseContentLocale(request.shell.locale);
  const candidate = await loadGuideArticleRouteCandidate({ locale, slug });

  if (!candidate) return { robots: { index: false, follow: false } };

  return withLocalizedAlternates(
    createGuideMetadata(candidate.page.article),
    request,
  );
}

export default async function GuideDetailPage(props: GuideDetailPageProps) {
  const mode = getProductionRouteMode("guide-detail");

  if (mode === "legacy") {
    return <LegacyGuideDetailPage {...props} />;
  }

  const params = await props.params;

  const query = props.searchParams ? await props.searchParams : {};

  const request = await getStorefrontLocaleRequest();
  const locale = parseContentLocale(
    request.localized ? request.shell.locale : query.locale,
  );

  const candidate = await loadGuideArticleRouteCandidate({
    locale,
    slug: params.slug,
  });

  if (!candidate) {
    notFound();
  }

  if (mode === "candidate") {
    return <GuideArticleRouteCandidatePage candidate={candidate} />;
  }

  return <ArticlePageComposition page={candidate.page} />;
}
