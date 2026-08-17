/* YSIM_PACKAGE_24_ACTIVATION:home */
import LegacyHomePage from "./legacy-page";

import { HomePageComposition } from "@/components/home/refactor";

import { HomeRouteCandidatePage } from "@/components/home/refactor/integration";

import {
  createProductionHomeRouteAdapterFromEnvironment,
  loadHomeRouteCandidate,
} from "@/lib/storefront/integration/home";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";
import { getStorefrontLocaleRequest } from "@/i18n/runtime/runtime.server";
import { localizeHomePageViewModel } from "@/lib/storefront/localization";

export default async function HomePage() {
  const request = await getStorefrontLocaleRequest();
  const mode = getProductionRouteMode("home");

  if (mode === "legacy" && !request.localized) {
    return <LegacyHomePage />;
  }

  const productionAdapter = createProductionHomeRouteAdapterFromEnvironment(
    request.shell.locale,
  );

  const candidate = await loadHomeRouteCandidate({
    productionAdapter,
  });

  const localizedPage = request.localized
    ? localizeHomePageViewModel(candidate.page, request.shell.locale)
    : candidate.page;

  if (mode === "candidate") {
    return (
      <HomeRouteCandidatePage
        candidate={{ ...candidate, page: localizedPage }}
      />
    );
  }

  return <HomePageComposition page={localizedPage} />;
}
