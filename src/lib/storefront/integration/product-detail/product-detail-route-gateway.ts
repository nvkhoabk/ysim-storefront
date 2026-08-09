import type {
  WooCommerceProduct,
} from "@/lib/woocommerce/types";

export interface ProductDetailRouteSource {
  product:
    WooCommerceProduct;
  related:
    readonly WooCommerceProduct[];
}

export interface ProductDetailRouteGateway {
  readonly id: string;

  load(
    slug: string,
    locale: string,
  ):
    Promise<
      ProductDetailRouteSource | null
    >;
}
