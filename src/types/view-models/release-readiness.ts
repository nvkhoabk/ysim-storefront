export type ReadinessGateStatus =
  | "required"
  | "manual"
  | "blocked";

export interface ReadinessGateViewModel {
  id: string;
  order: number;
  title: string;
  description: string;
  status:
    ReadinessGateStatus;
  checks:
    readonly string[];
  command?: string;
}

export interface ReleaseReadinessViewModel {
  title: string;
  description: string;
  gates:
    readonly ReadinessGateViewModel[];
  safety:
    readonly string[];
}
