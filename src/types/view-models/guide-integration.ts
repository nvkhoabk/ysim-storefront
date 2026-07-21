import type {
  ArticlePageCompositionViewModel,
  ContentLandingViewModel,
  ContentLocale,
} from "@/types/view-models/content";

export type GuideDataSourceMode =
  | "fixture"
  | "wordpress";

export interface GuideLandingIntegrationResult {
  sourceMode:
    GuideDataSourceMode;
  requestedLocale:
    ContentLocale;
  page:
    ContentLandingViewModel;
}

export interface GuideArticleIntegrationResult {
  sourceMode:
    GuideDataSourceMode;
  requestedLocale:
    ContentLocale;
  resolvedLocale:
    ContentLocale;
  usedFallback:
    boolean;
  page:
    ArticlePageCompositionViewModel;
}
