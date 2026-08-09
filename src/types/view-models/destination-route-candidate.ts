import type {
  DestinationPageViewModel,
} from "@/types/view-models/destination-page";

import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type DestinationRouteDataSourceMode =
  | "fixture"
  | "production";

export type DestinationRouteDiagnosticStatus =
  | "live"
  | "fixture"
  | "fallback"
  | "warning";

export interface DestinationRouteDiagnosticViewModel {
  domain:
    | "commerce"
    | "catalog"
    | "search"
    | "assets";
  label: string;
  status:
    DestinationRouteDiagnosticStatus;
  statusLabel: string;
  message: string;
  itemCount?: number;
}

export interface DestinationRouteCandidateViewModel {
  routeMode:
    ProductionRouteMode;
  routeModeLabel: string;
  sourceMode:
    DestinationRouteDataSourceMode;
  sourceModeLabel: string;
  environmentFlag: string;
  dataSourceFlag: string;
  diagnostics:
    readonly DestinationRouteDiagnosticViewModel[];
  warnings:
    readonly string[];
  page:
    DestinationPageViewModel;
}
