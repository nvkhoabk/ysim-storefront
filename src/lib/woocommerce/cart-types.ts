import type {
  WooCommerceImage,
  WooCommercePrice,
} from "./types";

export interface WooCommerceCartItemQuantityLimits {
  minimum: number;
  maximum: number;
  multiple_of: number;
  editable: boolean;
}

export interface WooCommerceCartItemVariation {
  attribute: string;
  value: string;
}

export interface WooCommerceCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  description?: string;
  sku?: string;
  type?: string;

  /**
   * Thuộc tính của variation mà khách đã chọn.
   *
   * Ví dụ:
   * [
   *   {
   *     attribute: "dung-luong",
   *     value: "3GB/ ngày"
   *   },
   *   {
   *     attribute: "so-ngay",
   *     value: "15"
   *   }
   * ]
   */
  variation?: WooCommerceCartItemVariation[];

  quantity_limits: WooCommerceCartItemQuantityLimits;

  images: WooCommerceImage[];

  prices: WooCommercePrice & {
    price_range?: {
      min_amount: string;
      max_amount: string;
    } | null;

    raw_prices?: {
      precision: number;
      price: string;
      regular_price: string;
      sale_price: string;
    };
  };

  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;

    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
}

export interface WooCommerceCartTotals {
  total_items: string;
  total_items_tax: string;
  total_fees: string;
  total_fees_tax: string;
  total_discount: string;
  total_discount_tax: string;
  total_shipping: string;
  total_shipping_tax: string;
  total_price: string;
  total_tax: string;

  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WooCommerceCart {
  items: WooCommerceCartItem[];
  items_count: number;
  items_weight: number;

  coupons: Array<{
    code: string;

    totals: {
      total_discount: string;
      total_discount_tax: string;
    };
  }>;

  fees: unknown[];

  totals: WooCommerceCartTotals;

  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;

  needs_payment: boolean;
  needs_shipping: boolean;

  payment_requirements: string[];

  has_calculated_shipping: boolean;

  shipping_rates: unknown[];
  cross_sells: unknown[];
  errors: unknown[];
}
