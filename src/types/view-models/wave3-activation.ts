import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type Wave3ActivationRouteId =
  | "cart"
  | "checkout"
  | "order-result"
  | "payment-result";

export type Wave3ActivationReadiness =
  | "candidate-ready"
  | "source-switch-only"
  | "blocked";

export interface Wave3ActivationRouteViewModel {
  id:
    Wave3ActivationRouteId;
  order: number;
  label: string;
  productionPath: string;
  candidatePath: string;
  featureFlag: string;
  mode:
    ProductionRouteMode;
  modeLabel: string;
  risk:
    | "high"
    | "critical";
  readiness:
    Wave3ActivationReadiness;
  readinessLabel: string;
  dependencies:
    readonly string[];
  acceptanceChecks:
    readonly string[];
  activationCommand: string;
  rollbackCommand: string;
  note?: string;
}

export interface Wave3ActivationPlanViewModel {
  title: string;
  description: string;
  routes:
    readonly Wave3ActivationRouteViewModel[];
  guardrails:
    readonly string[];
}
