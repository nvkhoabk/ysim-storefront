import {
  ArticlePageComposition,
} from "@/components/content/refactor";

import type {
  GuideArticleRouteCandidateViewModel,
} from "@/types/view-models/guide-route-candidate";

import {
  GuideRouteCandidateNotice,
} from "./GuideRouteCandidateNotice";

export function GuideArticleRouteCandidatePage({
  candidate,
}: {
  candidate: GuideArticleRouteCandidateViewModel;
}) {
  const localeLabel = candidate.usedFallback
    ? `${candidate.requestedLocale.toUpperCase()} → ${candidate.resolvedLocale.toUpperCase()}`
    : candidate.resolvedLocale.toUpperCase();

  return (
    <>
      <ArticlePageComposition
        page={candidate.page}
        cartCount={2}
      />

      <GuideRouteCandidateNotice
        title="Guide Detail"
        routeModeLabel={candidate.routeModeLabel}
        sourceModeLabel={candidate.sourceModeLabel}
        diagnosticStatus={candidate.diagnostic.status}
        diagnosticLabel={candidate.diagnostic.statusLabel}
        diagnosticMessage={candidate.diagnostic.message}
        localeLabel={localeLabel}
        warnings={candidate.warnings}
      />
    </>
  );
}
