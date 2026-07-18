export type DestinationFilterId =
  | "continent"
  | "duration"
  | "data"
  | "sort";

export type DestinationSortValue =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export interface DestinationFilterOption {
  value: string;

  label: string;

  count?: number;

  disabled?: boolean;
}

export interface DestinationFilterDefinition {
  id: DestinationFilterId;

  label: string;

  placeholder: string;

  options: DestinationFilterOption[];
}

export interface DestinationCatalogFilterState {
  continent: string;

  duration: string;

  data: string;

  sort: DestinationSortValue;
}

export interface DestinationFilterChangePayload {
  id: DestinationFilterId;

  value: string;
}

export interface DestinationCatalogItem {
  id: string;

  name: string;

  countryCode: string;

  continentLabel: string;

  durationLabel: string;

  dataLabel: string;

  priceFrom: number;

  currency: string;

  href: string;
}