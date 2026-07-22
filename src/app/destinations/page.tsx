/* YSIM_PACKAGE_38_V3_ROUTE:destinations-query-bridge */

import LegacyDestinationsPage from "./legacy-page";

import {
  DestinationPageComposition,
} from "@/components/destination/refactor";

import {
  DestinationRouteCandidatePage,
} from "@/components/destination/refactor/integration";

import {
  createProductionDestinationRouteAdapterFromEnvironment,
  loadDestinationRouteCandidate,
} from "@/lib/storefront/integration/destinations";

import {
  resolveDestinationRouteSelection,
  type DestinationSearchParams,
} from "@/lib/storefront/navigation/destination-query";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export {
  metadata,
} from "./legacy-page";

export default async function DestinationsPage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "destinations",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacyDestinationsPage
        {...props}
      />
    );
  }

  const candidate =
    await loadDestinationRouteCandidate({
      productionAdapter:
        createProductionDestinationRouteAdapterFromEnvironment(),
    });

  const selection =
    resolveDestinationRouteSelection(
      await Promise.resolve(
        (
          props.searchParams ||
          {}
        ) as DestinationSearchParams,
      ),
    );

  if (
    mode ===
    "candidate"
  ) {
    return (
      <DestinationRouteCandidatePage
        candidate={
          candidate
        }
        initialSelection={
          selection
        }
      />
    );
  }

  return (
    <DestinationPageComposition
      page={
        candidate.page
      }
      cartCount={0}
      initialSelection={
        selection
      }
    />
  );
}
