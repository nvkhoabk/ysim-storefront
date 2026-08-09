import {
  DestinationRouteCandidatePage,
} from "@/components/destination/refactor/integration";

import {
  createProductionDestinationRouteAdapterFromEnvironment,
  loadDestinationRouteCandidate,
} from "@/lib/storefront/integration/destinations";

export const metadata = {
  title:
    "Destination Route Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default async function DestinationRouteCandidatePreviewPage() {
  const productionAdapter =
    createProductionDestinationRouteAdapterFromEnvironment();

  const candidate =
    await loadDestinationRouteCandidate({
      productionAdapter,
    });

  return (
    <DestinationRouteCandidatePage
      candidate={
        candidate
      }
    />
  );
}
