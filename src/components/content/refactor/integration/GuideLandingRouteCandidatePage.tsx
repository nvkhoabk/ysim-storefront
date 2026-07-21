import {
  ContentLandingComposition,
} from "@/components/content/refactor";

import type {
  GuideLandingRouteCandidateViewModel,
} from "@/types/view-models/guide-route-candidate";

import {
  GuideRouteCandidateNotice,
} from "./GuideRouteCandidateNotice";

export function GuideLandingRouteCandidatePage({
  candidate,
}: {
  candidate: GuideLandingRouteCandidateViewModel;
}) {
  return (
    <>
      <ContentLandingComposition
        page={candidate.page}
        cartCount={2}
      />

      <GuideRouteCandidateNotice
        title="Guide Landing"
        routeModeLabel={candidate.routeModeLabel}
        sourceModeLabel={candidate.sourceModeLabel}
        diagnosticStatus={candidate.diagnostic.status}
        diagnosticLabel={candidate.diagnostic.statusLabel}
        diagnosticMessage={candidate.diagnostic.message}
        localeLabel={candidate.requestedLocale.toUpperCase()}
        warnings={candidate.warnings}
      />
    </>
  );
}
