import type {
  SupportPageViewModel,
} from "@/types/view-models/support";

import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type SupportRouteDataSourceMode =
  | "fixture"
  | "production";

export type SupportRouteDiagnosticStatus =
  | "live"
  | "fixture"
  | "fallback";

export interface SupportRouteDiagnosticViewModel {
  domain:
    | "topics"
    | "devices"
    | "faq"
    | "contacts";
  label: string;
  status:
    SupportRouteDiagnosticStatus;
  statusLabel: string;
  message: string;
  itemCount?: number;
}

export interface SupportRouteCandidateViewModel {
  routeMode:
    ProductionRouteMode;
  routeModeLabel: string;
  sourceMode:
    SupportRouteDataSourceMode;
  sourceModeLabel: string;
  environmentFlag: string;
  dataSourceFlag: string;
  diagnostics:
    readonly SupportRouteDiagnosticViewModel[];
  warnings:
    readonly string[];
  page:
    SupportPageViewModel;
}
