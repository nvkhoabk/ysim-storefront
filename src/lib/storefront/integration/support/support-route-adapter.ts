import type {
  SupportPageViewModel,
} from "@/types/view-models/support";

import type {
  SupportRouteDiagnosticViewModel,
} from "@/types/view-models/support-route-candidate";

export interface SupportRouteDataAdapter {
  readonly id: string;

  load():
    Promise<
      SupportPageViewModel
    >;

  getDiagnostics?():
    readonly SupportRouteDiagnosticViewModel[];
}
