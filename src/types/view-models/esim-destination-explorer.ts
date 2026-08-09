export type EsimExplorerType =
  | "country"
  | "region"
  | "global";

export interface EsimDestinationLinkViewModel {
  label: string;
  slug: string;
  countryCode?: string;
}

export interface EsimContinentViewModel {
  id: string;
  label: string;
  countLabel: string;
  destinations:
    readonly EsimDestinationLinkViewModel[];
}

export interface EsimRegionViewModel {
  id: string;
  label: string;
  description: string;
  coverage: string;
}

export interface EsimExplorerTypeViewModel {
  id:
    EsimExplorerType;
  label: string;
  description: string;
}

export interface EsimDestinationExplorerViewModel {
  types:
    readonly EsimExplorerTypeViewModel[];
  primaryContinents:
    readonly EsimContinentViewModel[];
  secondaryContinents:
    readonly EsimContinentViewModel[];
  regions:
    readonly EsimRegionViewModel[];
  globalBenefits:
    readonly string[];
  discoverBenefits:
    readonly string[];
}
