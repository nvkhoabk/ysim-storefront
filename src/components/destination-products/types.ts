import type { ReactNode } from "react";

export type DestinationProductSortValue =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "data-desc";

export interface DestinationProductHeroContent {
  destinationName: string;

  destinationSlug: string;

  countryCode: string;

  continentLabel: string;

  description: string;

  packageCount: number;

  startingPrice?: number;

  currency?: string;

  imageSrc?: string;

  imageAlt?: string;

  badge?: string;
}

export interface DestinationProductSortOption {
  value: DestinationProductSortValue;

  label: string;
}

export interface DestinationProductSearchPayload {
  query: string;
}

export interface DestinationProductHeroVisual {
  visual?: ReactNode;
}