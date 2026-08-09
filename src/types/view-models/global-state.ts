export type GlobalStateKind =
  | "loading"
  | "error"
  | "empty"
  | "not-found"
  | "offline";

export type GlobalStateTone =
  | "neutral"
  | "brand"
  | "warning"
  | "danger";

export interface GlobalStateActionViewModel {
  label: string;
  href?: string;
  variant:
    | "primary"
    | "outline"
    | "ghost";
}

export interface GlobalStateViewModel {
  id: string;
  kind:
    GlobalStateKind;
  tone:
    GlobalStateTone;
  eyebrow?: string;
  title: string;
  description: string;
  detail?: string;
  primaryAction?:
    GlobalStateActionViewModel;
  secondaryAction?:
    GlobalStateActionViewModel;
}

export interface GlobalStatePreviewViewModel {
  title: string;
  description: string;
  states:
    readonly GlobalStateViewModel[];
  acceptance:
    readonly string[];
}
