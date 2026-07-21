/* YSIM_PACKAGE_24_ACTIVATION:guides */
import LegacyGuidesPage from "./legacy-page";

import {
  ContentLandingComposition,
} from "@/components/content/refactor";

import {
  GuideLandingRouteCandidatePage,
} from "@/components/content/refactor/integration";

import {
  parseContentLocale,
} from "@/lib/content/integration";

import {
  loadGuideLandingRouteCandidate,
} from "@/lib/content/route-candidate";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export { metadata } from "./legacy-page";

export default async function GuidesPage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "guides",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacyGuidesPage
        {...props}
      />
    );
  }

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
    await loadGuideLandingRouteCandidate({
      locale,
      category:
        query.category,
    });

  if (
    mode ===
    "candidate"
  ) {
    return (
      <GuideLandingRouteCandidatePage
        candidate={
          candidate
        }
      />
    );
  }

  return (
    <ContentLandingComposition
      page={
        candidate.page
      }
    />
  );
}
