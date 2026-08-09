import type {
  DestinationPageViewModel,
} from "@/types/view-models/destination-page";

import type {
  DestinationRouteDiagnosticViewModel,
} from "@/types/view-models/destination-route-candidate";

export interface DestinationRouteDataAdapter {
  readonly id: string;

  load():
    Promise<
      DestinationPageViewModel
    >;

  getDiagnostics?():
    readonly DestinationRouteDiagnosticViewModel[];
}
