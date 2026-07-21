import {
  HomeRouteCandidatePage,
} from "@/components/home/refactor/integration";

import {
  loadHomeRouteCandidate,
} from "@/lib/storefront/integration/home";

export const metadata = {
  title:
    "Home Route Candidate | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default async function HomeRouteCandidatePreviewPage() {
  const candidate =
    await loadHomeRouteCandidate();

  return (
    <HomeRouteCandidatePage
      candidate={
        candidate
      }
    />
  );
}
