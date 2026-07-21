export type ProductBadgeIcon =
  | "featured"
  | "sale"
  | "popular";

export interface ProductBadgeViewModel {
  label: string;
  icon?: ProductBadgeIcon;
}

export interface ProductCardViewModel {
  id: number;
  familyCode: string;
  slug: string;
  name: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  price: number | string;
  regularPrice?: number | string;
  discountLabel?: string;
  dataLabel: string;
  durationLabel: string;
  sku?: string;
  badges: readonly ProductBadgeViewModel[];
}

export interface ProductVariationSource {
  id: number;
  sku?: string;
  price: number | string;
  regularPrice?: number | string;
  purchasable: boolean;
  inStock: boolean;
  attributes: Readonly<
    Record<string, string>
  >;
}

export interface ProductSource {
  id: number;
  familyCode: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  attributes?: Readonly<
    Record<
      string,
      string | readonly string[]
    >
  >;
  variations:
    readonly ProductVariationSource[];
}

export interface ProductCardPresentationConfig {
  familyCode: string;
  order?: number;
  featured?: boolean;
  badge?: ProductBadgeViewModel;
  dataAttributeKeys:
    readonly string[];
  durationAttributeKeys:
    readonly string[];
}
