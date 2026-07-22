export type GlobalBoundaryId =
  | "loading"
  | "not-found"
  | "route-error"
  | "global-error";

export interface GlobalBoundaryActivationItemViewModel {
  id:
    GlobalBoundaryId;
  order: number;
  label: string;
  target: string;
  testPath?: string;
  risk:
    | "medium"
    | "high";
  notes:
    readonly string[];
  activateCommand: string;
  verifyCommand: string;
  rollbackCommand: string;
}

export interface GlobalBoundaryActivationPlanViewModel {
  title: string;
  description: string;
  boundaries:
    readonly GlobalBoundaryActivationItemViewModel[];
  guardrails:
    readonly string[];
}
