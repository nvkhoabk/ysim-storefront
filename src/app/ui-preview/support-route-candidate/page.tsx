import {
  SupportRouteCandidatePage,
} from "@/components/support/refactor/integration";

import {
  createProductionSupportRouteAdapterFromEnvironment,
  loadSupportRouteCandidate,
} from "@/lib/storefront/integration/support";

export const metadata = {
  title:
    "Support Route Candidate | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default async function SupportRouteCandidatePreviewPage() {
  const productionAdapter =
    createProductionSupportRouteAdapterFromEnvironment();

  const candidate =
    await loadSupportRouteCandidate({
      productionAdapter,
    });

  return (
    <SupportRouteCandidatePage
      candidate={
        candidate
      }
    />
  );
}
