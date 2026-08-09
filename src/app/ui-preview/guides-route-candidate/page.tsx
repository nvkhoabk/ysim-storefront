import {
  GuideLandingRouteCandidatePage,
} from "@/components/content/refactor/integration";

import {
  loadGuideLandingRouteCandidate,
} from "@/lib/content/route-candidate";

import {
  parseContentLocale,
} from "@/lib/content/integration";

export const metadata = {
  title: "Guide Landing Route Candidate | YSim",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    locale?: string;
    category?: string;
  }>;
}

export default async function GuideLandingCandidatePage({
  searchParams,
}: PageProps) {
  const query = await searchParams;
  const locale = parseContentLocale(query.locale);

  const candidate = await loadGuideLandingRouteCandidate({
    locale,
    category: query.category,
  });

  return (
    <GuideLandingRouteCandidatePage
      candidate={candidate}
    />
  );
}
