import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type Wave2ActivationRouteId =
  | "destinations"
  | "product-detail";

export interface Wave2ActivationRouteViewModel {
  id:
    Wave2ActivationRouteId;
  order: number;
  label: string;
  productionPath: string;
  candidatePath: string;
  featureFlag: string;
  mode:
    ProductionRouteMode;
  modeLabel: string;
  risk:
    | "medium"
    | "high";
  dependencies:
    readonly string[];
  acceptanceChecks:
    readonly string[];
  activationCommand: string;
  rollbackCommand: string;
}

export interface Wave2ActivationPlanViewModel {
  title: string;
  description: string;
  routes:
    readonly Wave2ActivationRouteViewModel[];
  guardrails:
    readonly string[];
}
