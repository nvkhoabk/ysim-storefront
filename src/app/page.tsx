/* YSIM_PACKAGE_24_ACTIVATION:home */
import LegacyHomePage from "./legacy-page";

import {
  HomePageComposition,
} from "@/components/home/refactor";

import {
  HomeRouteCandidatePage,
} from "@/components/home/refactor/integration";

import {
  createProductionHomeRouteAdapterFromEnvironment,
  loadHomeRouteCandidate,
} from "@/lib/storefront/integration/home";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";



export default async function HomePage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "home",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacyHomePage
        {...props}
      />
    );
  }

  const productionAdapter =
    createProductionHomeRouteAdapterFromEnvironment();

  const candidate =
    await loadHomeRouteCandidate({
      productionAdapter,
    });

  if (
    mode ===
    "candidate"
  ) {
    return (
      <HomeRouteCandidatePage
        candidate={
          candidate
        }
      />
    );
  }

  return (
    <HomePageComposition
      page={
        candidate.page
      }
    />
  );
}
