export type ProductionRouteId =
  | "home"
  | "destinations"
  | "product-detail"
  | "cart"
  | "checkout"
  | "payment-result"
  | "order-result"
  | "guides"
  | "guide-detail"
  | "support";

export type ProductionRouteMode =
  | "legacy"
  | "candidate"
  | "refactor";

export type ProductionRouteRisk =
  | "low"
  | "medium"
  | "high";

export type ProductionRouteReadiness =
  | "planned"
  | "ui-ready"
  | "adapter-required"
  | "payment-blocked";

export interface ProductionRoutePlanItemViewModel {
  id:
    ProductionRouteId;
  label: string;
  productionPath: string;
  previewPath: string;
  mode:
    ProductionRouteMode;
  modeLabel: string;
  environmentFlag: string;
  risk:
    ProductionRouteRisk;
  readiness:
    ProductionRouteReadiness;
  readinessLabel: string;
  wave: 1 | 2 | 3;
  composition: string;
  dataBoundary: string;
  dependencies:
    readonly string[];
  acceptanceChecks:
    readonly string[];
  rollback: string;
  note?: string;
}

export interface ProductionRouteWaveViewModel {
  wave: 1 | 2 | 3;
  title: string;
  description: string;
  routeIds:
    readonly ProductionRouteId[];
}

export interface ProductionRoutePlanViewModel {
  title: string;
  description: string;
  routes:
    readonly ProductionRoutePlanItemViewModel[];
  waves:
    readonly ProductionRouteWaveViewModel[];
  globalChecks:
    readonly string[];
  rolloutRules:
    readonly string[];
}
