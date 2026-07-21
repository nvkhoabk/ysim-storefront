import type {
  HomePageViewModel,
} from "@/types/view-models/home";

import type {
  HomeProductionDiagnosticViewModel,
} from "@/types/view-models/home-production";

import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type HomeRouteDataSourceMode =
  | "fixture"
  | "production";

export interface HomeRouteCandidateViewModel {
  routeMode:
    ProductionRouteMode;
  routeModeLabel: string;
  sourceMode:
    HomeRouteDataSourceMode;
  sourceModeLabel: string;
  environmentFlag: string;
  dataSourceFlag: string;
  warnings:
    readonly string[];
  diagnostics:
    readonly HomeProductionDiagnosticViewModel[];
  page:
    HomePageViewModel;
}
