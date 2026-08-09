import type {
  ArticlePageCompositionViewModel,
  ContentLandingViewModel,
  ContentLocale,
} from "@/types/view-models/content";

import type {
  GuideDataSourceMode,
} from "@/types/view-models/guide-integration";

import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type GuideCandidateDiagnosticStatus =
  | "live"
  | "fixture"
  | "fallback";

export interface GuideCandidateMeta {
  routeMode: ProductionRouteMode;
  routeModeLabel: string;
  environmentFlag: string;
  sourceMode: GuideDataSourceMode;
  sourceModeLabel: string;
  requestedLocale: ContentLocale;
  diagnostic: {
    status: GuideCandidateDiagnosticStatus;
    statusLabel: string;
    message: string;
  };
  warnings: readonly string[];
}

export interface GuideLandingRouteCandidateViewModel
  extends GuideCandidateMeta {
  page: ContentLandingViewModel;
}

export interface GuideArticleRouteCandidateViewModel
  extends GuideCandidateMeta {
  resolvedLocale: ContentLocale;
  usedFallback: boolean;
  page: ArticlePageCompositionViewModel;
}
