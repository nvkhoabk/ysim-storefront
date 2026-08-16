import type {
  ProductBadgeViewModel,
  ProductCardViewModel,
  ProductSource,
} from "@/types/view-models/product-card";

export type ProductFeatureIcon =
  | "network"
  | "hotspot"
  | "activation"
  | "support";

export interface ProductDetailVariationViewModel {
  id: number;
  sku?: string;
  price: number | string;
  regularPrice?: number | string;
  discountLabel?: string;
  purchasable: boolean;
  inStock: boolean;
  dataValue: string;
  durationValue: string;
}

export interface ProductDetailViewModel {
  id: number;
  familyCode: string;
  slug: string;
  name: string;
  destinationName: string;
  shortDescription: string;
  gallery: readonly {
    id: string;
    url: string;
    alt: string;
  }[];
  badges: readonly ProductBadgeViewModel[];
  dataOptions: readonly string[];
  durationOptions: readonly string[];
  variations: readonly ProductDetailVariationViewModel[];
  initialVariationId: number;
  features: readonly {
    title: string;
    description: string;
    icon: ProductFeatureIcon;
  }[];
  usageNotes: readonly {
    title: string;
    description: string;
  }[];
}

export interface ProductDetailPageViewModel {
  product: ProductDetailViewModel;
  relatedProducts: readonly ProductCardViewModel[];
}

export interface ProductDetailSource extends ProductSource {
  destinationName: string;
  shortDescription: string;
  gallery?: readonly {
    id?: string;
    url: string;
    alt?: string;
  }[];
}

export interface ProductDetailPresentationConfig {
  familyCode: string;
  badges?: readonly ProductBadgeViewModel[];
  dataAttributeKeys: readonly string[];
  durationAttributeKeys: readonly string[];
  features: ProductDetailViewModel["features"];
  usageNotes: ProductDetailViewModel["usageNotes"];
}
