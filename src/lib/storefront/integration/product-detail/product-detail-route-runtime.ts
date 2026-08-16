import type {
  ProductDetailDataSourceMode,
} from "@/types/view-models/product-detail-route-candidate";

import {
  createFixtureProductDetailGateway,
} from "./fixture-product-detail-gateway";

import type {
  ProductDetailRouteGateway,
} from "./product-detail-route-gateway";

type ProductDetailDataSourceSetting =
  | "auto"
  | "fixture"
  | "production";

export interface ProductDetailRouteRuntime {
  sourceMode:
    ProductDetailDataSourceMode;
  sourceModeLabel: string;
  gateway:
    ProductDetailRouteGateway;
}

function setting():
  ProductDetailDataSourceSetting {
  const normalized =
    process.env
      .YSIM_PRODUCT_DETAIL_DATA_SOURCE
      ?.trim()
      .toLowerCase();

  if (
    normalized ===
      "fixture" ||
    normalized ===
      "production"
  ) {
    return normalized;
  }

  return "auto";
}

export function createProductDetailRouteRuntime({
  productionGateway,
}: {
  productionGateway?:
    ProductDetailRouteGateway;
}): ProductDetailRouteRuntime {
  const mode =
    setting();

  if (
    mode ===
    "fixture"
  ) {
    return {
      sourceMode:
        "fixture",
      sourceModeLabel:
        "Reviewed fixture",
      gateway:
        createFixtureProductDetailGateway(),
    };
  }

  if (!productionGateway) {
    if (
      mode ===
      "production"
    ) {
      throw new Error(
        "YSIM_PRODUCT_DETAIL_DATA_SOURCE=production requires a production ProductDetailRouteGateway.",
      );
    }

    return {
      sourceMode:
        "fixture",
      sourceModeLabel:
        "Reviewed fixture",
      gateway:
        createFixtureProductDetailGateway(),
    };
  }

  return {
    sourceMode:
      "production",
    sourceModeLabel:
      "Product Localization API",
    gateway:
      productionGateway,
  };
}
