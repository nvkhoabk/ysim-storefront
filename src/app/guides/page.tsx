/* YSIM_PACKAGE_24_ACTIVATION:guides */
import LegacyGuidesPage from "./legacy-page";
import type { Metadata } from "next";

import { ContentLandingComposition } from "@/components/content/refactor";

import { GuideLandingRouteCandidatePage } from "@/components/content/refactor/integration";

import { parseContentLocale } from "@/lib/content/integration";

import { loadGuideLandingRouteCandidate } from "@/lib/content/route-candidate";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";

import { createSecondaryTranslator } from "@/i18n/secondary/secondary.registry";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";

export async function generateMetadata(): Promise<Metadata> {
  const request = await getStorefrontLocaleRequest();
  const t = createSecondaryTranslator(request.shell.locale);

  return withLocalizedAlternates(
    {
      title: t("guides.title"),
      description: t("guides.description"),
    },
    request,
  );
}

interface GuidesPageProps {
  searchParams?: Promise<{
    locale?: string;
    category?: string;
  }>;
}

export default async function GuidesPage(props: GuidesPageProps) {
  const mode = getProductionRouteMode("guides");

  if (mode === "legacy") {
    return <LegacyGuidesPage />;
  }

  const query = props.searchParams ? await props.searchParams : {};

  const request = await getStorefrontLocaleRequest();
  const locale = parseContentLocale(
    request.localized ? request.shell.locale : query.locale,
  );

  const candidate = await loadGuideLandingRouteCandidate({
    locale,
    category: query.category,
  });

  if (mode === "candidate") {
    return <GuideLandingRouteCandidatePage candidate={candidate} />;
  }

  return <ContentLandingComposition page={candidate.page} />;
}
