import type { ReactNode } from "react";

export type DestinationContinentKey =
  | "all"
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "africa"
  | "oceania";

export interface DestinationContinent {
  key: DestinationContinentKey;

  label: string;

  shortLabel?: string;

  /**
   * Dùng để đồng bộ URL:
   * /destinations?continent=asia
   */
  slug?: string;

  /**
   * Icon chính thức có thể được truyền từ ngoài
   * thông qua renderIcon().
   */
  icon?: ReactNode;
}

export interface DestinationSearchSubmitPayload {
  query: string;
}

export interface DestinationHeroContent {
  eyebrow?: string;

  title: string;

  highlightedTitle?: string;

  description: string;

  searchPlaceholder: string;
}

export interface PopularDestination {
  id: string;

  name: string;

  slug: string;

  href: string;

  countryCode?: string;

  continent: DestinationContinentKey;

  imageSrc?: string;

  imageAlt: string;

  badge?: string;

  durationLabel: string;

  priceFrom: number;

  currency: string;

  networkLabel?: string;

  popular?: boolean;
}