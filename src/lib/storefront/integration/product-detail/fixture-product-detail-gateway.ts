import {
  productDetailCandidateFixture,
} from "@/config/storefront-product-detail-candidate-fixture";

import type {
  ProductDetailRouteGateway,
} from "./product-detail-route-gateway";

export function createFixtureProductDetailGateway():
  ProductDetailRouteGateway {
  return {
    id:
      "fixture-product-detail-gateway",

    async load(
      slug,
    ) {
      if (
        slug !==
        productDetailCandidateFixture
          .slug
      ) {
        return null;
      }

      return {
        product:
          productDetailCandidateFixture,
        related:
          [],
      };
    },
  };
}
