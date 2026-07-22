import {
  getProductBySlug,
  getProducts,
} from "@/lib/woocommerce/products";

import type {
  ProductDetailRouteGateway,
} from "./product-detail-route-gateway";

export function createLocalizedProductDetailGateway({
  relatedLimit,
}: {
  relatedLimit: number;
}):
  ProductDetailRouteGateway {
  return {
    id:
      "localized-product-detail-gateway",

    async load(
      slug,
      locale,
    ) {
      const product =
        await getProductBySlug(
          slug,
          locale,
        );

      if (!product) {
        return null;
      }

      const destination =
        product.categories?.[0]
          ?.slug;

      const related =
        await getProducts({
          page:
            1,
          perPage:
            Math.max(
              relatedLimit +
                1,
              4,
            ),
          locale,
          destination,
        });

      return {
        product,
        related:
          related
            .filter(
              (item) =>
                item.id !==
                product.id,
            )
            .slice(
              0,
              relatedLimit,
            ),
      };
    },
  };
}
