export interface WooCommercePrice {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WooCommerceImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WooCommercePrice;
  price_html?: string;
  images: WooCommerceImage[];
  categories?: WooCommerceProductCategory[];
  tags?: WooCommerceProductTag[];
  attributes?: WooCommerceProductAttribute[];
  is_purchasable: boolean;
  is_in_stock: boolean;
  low_stock_remaining: number | null;
  average_rating: string;
  review_count: number;
  
  add_to_cart?: {
    text: string;
    description: string;
    url: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
}

export interface WooCommerceProductCategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
}

export interface WooCommerceProductTag {
  id: number;
  name: string;
  slug: string;
  link?: string;
}

export interface WooCommerceProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
  default?: boolean;
}

export interface WooCommerceProductAttribute {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: WooCommerceProductAttributeTerm[];
}