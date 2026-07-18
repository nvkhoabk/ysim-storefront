import type { ReactNode } from "react";

export type OffersTabKey =
  | "discount-policy"
  | "sales-rewards"
  | "special-offers"
  | "settlement"
  | "terms";

export type PartnerTierKey =
  | "silver"
  | "gold"
  | "diamond";

export interface OffersHeroContent {
  title: string;

  secondTitleLine: string;

  highlightedText: string;

  description: string;

  imageSrc?: string;

  imageAlt?: string;
}

export interface OffersBenefitItem {
  id: string;

  title: string;

  description: string;

  icon?: ReactNode;
}

export interface OffersHighlightItem {
  id: string;

  title: string;

  value?: string;

  description: string;

  icon?: ReactNode;
}

export interface OffersTabItem {
  key: OffersTabKey;

  label: string;

  href: string;

  icon?: ReactNode;
}

export interface PartnerTier {
  key: PartnerTierKey;

  name: string;

  subtitle: string;

  discountLabel: string;

  salesRequirement: string;

  benefits: string[];

  href: string;
}

export interface OffersSupportBenefit {
  id: string;

  title: string;

  description: string;

  icon?: ReactNode;
}