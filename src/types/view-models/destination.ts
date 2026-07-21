export interface DestinationBadgeViewModel {
  label: string;
  icon?: "sparkles" | "popular" | "global";
}

export interface DestinationCardViewModel {
  id: number;
  slug: string;
  name: string;
  href: string;
  regionLabel?: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  flagUrl: string;
  durationLabel?: string;
  priceFrom: number | string;
  productCount?: number;
  badge?: DestinationBadgeViewModel;
}

export interface DestinationCategorySource {
  id: number;
  slug: string;
  name: string;
  description?: string;
  parentSlug?: string;
  parentName?: string;
  productCount?: number;
}

export interface DestinationCommerceSummary {
  destinationSlug: string;
  minPurchasablePrice: number | string;
  minDurationDays?: number;
  maxDurationDays?: number;
  purchasableProductCount?: number;
}

export interface DestinationPresentationConfig {
  slug: string;
  imageUrl: string;
  imageAlt: string;
  flagUrl: string;
  featured?: boolean;
  order?: number;
  badge?: DestinationBadgeViewModel;
}
