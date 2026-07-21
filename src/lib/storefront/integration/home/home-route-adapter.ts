import type {
  HomePageViewModel,
} from "@/types/view-models/home";

import type {
  HomeProductionDiagnosticViewModel,
} from "@/types/view-models/home-production";

export interface HomeRouteDataAdapter {
  readonly id: string;

  load():
    Promise<
      HomePageViewModel
    >;

  getDiagnostics?():
    readonly HomeProductionDiagnosticViewModel[];
}
