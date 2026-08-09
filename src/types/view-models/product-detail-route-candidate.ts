import type {
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

export type ProductDetailDataSourceMode =
  | "fixture"
  | "production";

export type ProductDetailDiagnosticStatus =
  | "live"
  | "fixture"
  | "fallback"
  | "warning";

export interface ProductDetailImageViewModel {
  id: string;
  src: string;
  alt: string;
}

export interface ProductDetailAttributeViewModel {
  id: string;
  label: string;
  value: string;
}

export interface ProductDetailVariationViewModel {
  id: number;
  sku?: string;
  label: string;
  description?: string;
  price: number;
  regularPrice?: number;
  purchasable: boolean;
  inStock: boolean;
  imageUrl?: string;
  attributes:
    Readonly<
      Record<string, string>
    >;
  attributeLabels:
    Readonly<
      Record<string, string>
    >;
  attributeNames:
    Readonly<
      Record<string, string>
    >;
}

export interface ProductDetailRelatedItemViewModel {
  id: number;
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  price: number;
  regularPrice?: number;
  dataLabel?: string;
  durationLabel?: string;
  href: string;
}

export interface ProductDetailRouteProductViewModel {
  id: number;
  slug: string;
  sku?: string;
  name: string;
  destinationName?: string;
  shortDescription: string;
  description: string;
  gallery:
    readonly ProductDetailImageViewModel[];
  features:
    readonly ProductDetailAttributeViewModel[];
  variations:
    readonly ProductDetailVariationViewModel[];
  defaultVariationId?: number;
  purchasable: boolean;
  inStock: boolean;
  usageNotes:
    readonly string[];
  relatedProducts:
    readonly ProductDetailRelatedItemViewModel[];
}

export interface ProductDetailRouteDiagnosticViewModel {
  domain:
    | "product"
    | "variations"
    | "gallery"
    | "cart-bridge";
  label: string;
  status:
    ProductDetailDiagnosticStatus;
  statusLabel: string;
  message: string;
  itemCount?: number;
}

export interface ProductDetailRouteCandidateViewModel {
  routeMode:
    ProductionRouteMode;
  routeModeLabel: string;
  sourceMode:
    ProductDetailDataSourceMode;
  sourceModeLabel: string;
  environmentFlag: string;
  dataSourceFlag: string;
  diagnostics:
    readonly ProductDetailRouteDiagnosticViewModel[];
  warnings:
    readonly string[];
  product:
    ProductDetailRouteProductViewModel;
}

export interface ProductDetailCartSelection {
  productId: number;
  productSlug: string;
  productName: string;
  variationId: number;
  variationSku?: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
  attributes:
    Readonly<
      Record<string, string>
    >;
}
