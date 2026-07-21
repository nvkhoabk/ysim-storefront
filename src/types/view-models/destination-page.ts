import type {
  HeroSearchItemViewModel,
  HeroViewModel,
} from "@/types/view-models/hero";

import type {
  DestinationCardViewModel,
} from "@/types/view-models/destination";

export type DestinationContinentKey =
  | "all"
  | "asia"
  | "europe"
  | "north-america"
  | "global";

export type DestinationDurationFilter =
  | "all"
  | "1-5"
  | "6-10"
  | "11-30";

export type DestinationDataFilter =
  | "all"
  | "daily"
  | "total"
  | "unlimited";

export type DestinationSortValue =
  | "popular"
  | "price-asc"
  | "name-asc";

export interface DestinationCatalogFilterState {
  query: string;
  continent:
    DestinationContinentKey;
  duration:
    DestinationDurationFilter;
  data:
    DestinationDataFilter;
  sort:
    DestinationSortValue;
}

export interface DestinationCategoryOptionViewModel {
  key:
    DestinationContinentKey;
  label: string;
  count?: number;
}

export interface DestinationCatalogItemViewModel
  extends DestinationCardViewModel {
  continent:
    Exclude<
      DestinationContinentKey,
      "all"
    >;
  continentLabel: string;
  popularity: number;
  minDurationDays?: number;
  maxDurationDays?: number;
  dataKinds:
    readonly Exclude<
      DestinationDataFilter,
      "all"
    >[];
}

export interface DestinationCatalogSectionViewModel {
  eyebrow?: string;
  title: string;
  description?: string;
  categories:
    readonly DestinationCategoryOptionViewModel[];
  initialFilters:
    DestinationCatalogFilterState;
  items:
    readonly DestinationCatalogItemViewModel[];
}

export interface DestinationPageViewModel {
  hero: HeroViewModel;
  heroSearchItems:
    readonly HeroSearchItemViewModel[];
  popularDestinations:
    readonly DestinationCardViewModel[];
  popularSection: {
    eyebrow?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
  };
  catalog:
    DestinationCatalogSectionViewModel;
}
