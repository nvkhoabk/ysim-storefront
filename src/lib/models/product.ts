import type {
  CurrencyCode,
  ImageResource,
  LocaleCode,
} from "./common";

export interface ProductAttribute {
  name: string;
  slug: string;
  visible: boolean;
  options: string[];
}

export interface ProductCategoryReference {
  id: number;
  name: string;
  slug: string;
  parentId: number;
}

export interface LocalizedProduct {
  id: number;
  sku: string;
  slug: string;
  name: string;
  type: string;
  locale: LocaleCode;

  currency: CurrencyCode;
  currencySymbol: string;
  currencyDecimals: number;

  price: string;
  regularPrice: string;
  salePrice: string;

  onSale: boolean;
  featured: boolean;

  stockStatus: string;
  inStock: boolean;
  purchasable: boolean;

  shortDescription: string;
  description: string;

  image: ImageResource | null;
  gallery: ImageResource[];

  categories: ProductCategoryReference[];
  attributes: ProductAttribute[];
}

export interface ProductLookup {
  type: "slug";
  requestedSlug: string;
  sourceProductId: number;
  sourceLocale: LocaleCode;
}

export interface ProductResolverResponse {
  lookup?: ProductLookup;

  familyId: number;
  familyCode: string;

  requestedLocale: LocaleCode;
  resolvedLocale: LocaleCode;

  fallbackUsed: boolean;
  fallbackReason: string | null;

  product: LocalizedProduct;
}

export interface ProductPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  items: ProductResolverResponse[];
  pagination: ProductPagination;
}

export interface ProductListQuery {
  locale?: LocaleCode;
  destination?: string;
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}
