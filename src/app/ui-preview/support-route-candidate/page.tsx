import {
  SupportRouteCandidatePage,
} from "@/components/support/refactor/integration";

import {
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
  const candidate =
    await loadSupportRouteCandidate();

  return (
    <SupportRouteCandidatePage
      candidate={
        candidate
      }
    />
  );
}
