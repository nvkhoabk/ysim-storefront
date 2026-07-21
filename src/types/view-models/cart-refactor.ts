import type {
  ProductCardViewModel,
} from "@/types/view-models/product-card";

export interface CartLineSource {
  lineId: string;
  productId: number;
  variationId: number;
  slug: string;
  name: string;
  destinationName: string;
  imageUrl: string;
  imageAlt?: string;
  sku?: string;
  dataLabel: string;
  durationLabel: string;
  quantity: number;
  unitPrice: number | string;
  regularUnitPrice?: number | string;
  purchasable: boolean;
  inStock: boolean;
}

export interface CartLineItemViewModel {
  lineId: string;
  productId: number;
  variationId: number;
  href: string;
  name: string;
  destinationName: string;
  imageUrl: string;
  imageAlt: string;
  sku?: string;
  dataLabel: string;
  durationLabel: string;
  quantity: number;
  unitPrice: number;
  regularUnitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
  purchasable: boolean;
  inStock: boolean;
}

export interface CartCouponRule {
  code: string;
  label: string;
  percent: number;
  maxDiscount?: number;
  minOrderValue?: number;
}

export interface AppliedCartCouponViewModel {
  code: string;
  label: string;
  discount: number;
}

export interface CartTotalsViewModel {
  itemCount: number;
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  total: number;
}

export interface CartPageViewModel {
  lines: readonly CartLineItemViewModel[];
  totals: CartTotalsViewModel;
  appliedCoupon?: AppliedCartCouponViewModel;
  canCheckout: boolean;
  unavailableLineCount: number;
  relatedProducts: readonly ProductCardViewModel[];
}
