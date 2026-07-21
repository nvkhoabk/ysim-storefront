/* YSIM_PACKAGE_24_ACTIVATION:support */
import LegacySupportPage from "./legacy-page";

import {
  SupportPageComposition,
} from "@/components/support/refactor";

import {
  SupportRouteCandidatePage,
} from "@/components/support/refactor/integration";

import {
  createProductionSupportRouteAdapterFromEnvironment,
  loadSupportRouteCandidate,
} from "@/lib/storefront/integration/support";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export { metadata } from "./legacy-page";

export default async function SupportPage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "support",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacySupportPage
        {...props}
      />
    );
  }

  const productionAdapter =
    createProductionSupportRouteAdapterFromEnvironment();

  const candidate =
    await loadSupportRouteCandidate({
      productionAdapter,
    });

  if (
    mode ===
    "candidate"
  ) {
    return (
      <SupportRouteCandidatePage
        candidate={
          candidate
        }
      />
    );
  }

  return (
    <SupportPageComposition
      page={
        candidate.page
      }
    />
  );
}
