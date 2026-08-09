export type PreviewPackagePhase =
  | "foundation"
  | "navigation"
  | "discovery"
  | "content"
  | "commerce"
  | "support";

export type PreviewPackageStatus =
  | "ready"
  | "hotfix"
  | "external";

export interface PreviewRouteViewModel {
  label: string;
  href: string;
  description?: string;
}

export interface PreviewPackageViewModel {
  packageNumber: number;
  title: string;
  description: string;
  phase:
    PreviewPackagePhase;
  status:
    PreviewPackageStatus;
  statusLabel: string;
  routes:
    readonly PreviewRouteViewModel[];
  checks:
    readonly string[];
  note?: string;
}

export interface PreviewPhaseOptionViewModel {
  id:
    | "all"
    | PreviewPackagePhase;
  label: string;
}

export interface PreviewViewportViewModel {
  id: string;
  label: string;
  width: string;
  description: string;
  checks:
    readonly string[];
}

export interface PreviewReviewChecklistViewModel {
  title: string;
  items:
    readonly string[];
}

export interface PreviewHubViewModel {
  title: string;
  description: string;
  packages:
    readonly PreviewPackageViewModel[];
  phases:
    readonly PreviewPhaseOptionViewModel[];
  viewports:
    readonly PreviewViewportViewModel[];
  checklist:
    PreviewReviewChecklistViewModel;
}
