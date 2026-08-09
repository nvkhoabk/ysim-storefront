import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type Wave1ActivationRouteId =
  | "support"
  | "guides"
  | "guide-detail"
  | "home";

export type Wave1ActivationRisk =
  | "low"
  | "medium";

export interface Wave1ActivationRouteViewModel {
  id:
    Wave1ActivationRouteId;
  order: number;
  label: string;
  productionPath: string;
  candidatePath: string;
  featureFlag: string;
  mode:
    ProductionRouteMode;
  modeLabel: string;
  risk:
    Wave1ActivationRisk;
  sourceDependencies:
    readonly string[];
  acceptanceChecks:
    readonly string[];
  activationCommand: string;
  rollbackCommand: string;
}

export interface Wave1ActivationPlanViewModel {
  title: string;
  description: string;
  routes:
    readonly Wave1ActivationRouteViewModel[];
  rules:
    readonly string[];
}
