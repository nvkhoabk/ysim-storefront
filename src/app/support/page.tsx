/* YSIM_PACKAGE_24_ACTIVATION:support */
import LegacySupportPage from "./legacy-page";

import { SupportPageComposition } from "@/components/support/refactor";

import { SupportRouteCandidatePage } from "@/components/support/refactor/integration";

import {
  createProductionSupportRouteAdapterFromEnvironment,
  loadSupportRouteCandidate,
} from "@/lib/storefront/integration/support";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createSupportUiCopy } from "@/i18n/support/support.config";
import { localizeSupportPageViewModel } from "@/lib/storefront/localization";

export async function generateMetadata() {
  const request = await getStorefrontLocaleRequest();
  const copy = createSupportUiCopy(request.shell.locale);
  return withLocalizedAlternates(
    {
      title: copy.hero.eyebrow,
      description: copy.hero.description,
    },
    request,
  );
}

export default async function SupportPage() {
  const request = await getStorefrontLocaleRequest();
  const mode = getProductionRouteMode("support");

  if (mode === "legacy") {
    return <LegacySupportPage />;
  }

  const productionAdapter =
    createProductionSupportRouteAdapterFromEnvironment();

  const candidate = await loadSupportRouteCandidate({
    productionAdapter,
  });

  if (mode === "candidate") {
    return <SupportRouteCandidatePage candidate={candidate} />;
  }

  return (
    <SupportPageComposition
      page={localizeSupportPageViewModel(candidate.page, request.shell.locale)}
    />
  );
}
