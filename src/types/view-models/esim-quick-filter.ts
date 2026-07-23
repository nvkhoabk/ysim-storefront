export type EsimQuickFilterKind =
  | "all"
  | "destination"
  | "continent"
  | "region"
  | "global";

export interface EsimQuickFilterSelection {
  kind:
    EsimQuickFilterKind;
  id: string;
  label: string;
  aliases:
    readonly string[];
  query:
    Readonly<
      Record<
        string,
        string
      >
    >;
}
