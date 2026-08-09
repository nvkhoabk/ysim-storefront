import {
  DestinationPageComposition,
} from "@/components/destination/refactor";

import {
  createProductionDestinationRouteAdapterFromEnvironment,
  loadDestinationRouteCandidate,
} from "@/lib/storefront/integration/destinations";

import {
  resolveDestinationRouteSelection,
  type DestinationSearchParams,
} from "@/lib/storefront/navigation/destination-query";

export const dynamic =
  "force-dynamic";

export const metadata = {
  title:
    "Destination Query Bridge | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams:
    Promise<
      DestinationSearchParams
    >;
}) {
  const candidate =
    await loadDestinationRouteCandidate({
      productionAdapter:
        createProductionDestinationRouteAdapterFromEnvironment(),
    });

  const selection =
    resolveDestinationRouteSelection(
      await searchParams,
    );

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
