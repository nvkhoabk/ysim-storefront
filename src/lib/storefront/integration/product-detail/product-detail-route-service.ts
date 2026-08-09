import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  ProductDetailRouteCandidateViewModel,
} from "@/types/view-models/product-detail-route-candidate";

import {
  createFixtureProductDetailGateway,
} from "./fixture-product-detail-gateway";

import {
  mapProductDetailRouteProduct,
} from "./product-detail-production-mapper";

import type {
  ProductDetailRouteGateway,
} from "./product-detail-route-gateway";

import {
  createProductDetailRouteRuntime,
} from "./product-detail-route-runtime";

function errorMessage(
  error: unknown,
): string {
  return error instanceof
    Error
    ? error.message
    : String(
        error,
      );
}

export async function loadProductDetailRouteCandidate({
  slug,
  locale,
  productionGateway,
}: {
  slug: string;
  locale: string;
  productionGateway?:
    ProductDetailRouteGateway;
}): Promise<
  ProductDetailRouteCandidateViewModel | null
> {
  const runtime =
    createProductDetailRouteRuntime({
      productionGateway,
    });

  const routeMode =
    getProductionRouteMode(
      "product-detail",
    );

  let sourceMode =
    runtime.sourceMode;

  let sourceModeLabel =
    runtime.sourceModeLabel;

  let source;

  try {
    source =
      await runtime
        .gateway
        .load(
          slug,
          locale,
        );
  } catch (error) {
    const fallback =
      createFixtureProductDetailGateway();

    source =
      await fallback
        .load(
          slug,
          locale,
        );

    if (!source) {
      throw error;
    }

    sourceMode =
      "fixture";
    sourceModeLabel =
      "Fixture fallback";

    const product =
      mapProductDetailRouteProduct(
        source,
      );

    return {
      routeMode,
      routeModeLabel:
        getProductionRouteModeLabel(
          routeMode,
        ),
      sourceMode,
      sourceModeLabel,
      environmentFlag:
        getProductionRouteFlag(
          "product-detail",
        ),
      dataSourceFlag:
        "YSIM_PRODUCT_DETAIL_DATA_SOURCE",
      diagnostics: [
        {
          domain:
            "product",
          label:
            "Product source",
          status:
            "fallback",
          statusLabel:
            "Fallback",
          message:
            `Production source failed: ${errorMessage(
              error,
            )}`,
        },
        {
          domain:
            "variations",
          label:
            "Variations",
          status:
            "fixture",
          statusLabel:
            "Fixture",
          message:
            `${product.variations.length} variation fixture.`,
          itemCount:
            product.variations.length,
        },
        {
          domain:
            "gallery",
          label:
            "Gallery",
          status:
            "fixture",
          statusLabel:
            "Fixture",
          message:
            `${product.gallery.length} image fixture.`,
          itemCount:
            product.gallery.length,
        },
        {
          domain:
            "cart-bridge",
          label:
            "Cart bridge",
          status:
            "warning",
          statusLabel:
            "Candidate only",
          message:
            "Selection chỉ phát browser event và sessionStorage; chưa sửa Cart store.",
        },
      ],
      warnings: [
        "Production route /esim/[slug] is unchanged.",
        "Candidate is using fixture fallback.",
      ],
      product,
    };
  }

  if (!source) {
    return null;
  }

  const product =
    mapProductDetailRouteProduct(
      source,
    );

  const assetWarnings =
    product.gallery.filter(
      (image) =>
        image.src.startsWith(
          "/ui-preview/",
        ),
    ).length;

  return {
    routeMode,
    routeModeLabel:
      getProductionRouteModeLabel(
        routeMode,
      ),
    sourceMode,
    sourceModeLabel,
    environmentFlag:
      getProductionRouteFlag(
        "product-detail",
      ),
    dataSourceFlag:
      "YSIM_PRODUCT_DETAIL_DATA_SOURCE",
    diagnostics: [
      {
        domain:
          "product",
        label:
          "Product source",
        status:
          sourceMode ===
          "production"
            ? "live"
            : "fixture",
        statusLabel:
          sourceMode ===
          "production"
            ? "Live"
            : "Fixture",
        message:
          `${product.name} · ${product.sku || "Không có SKU"}.`,
        itemCount:
          1,
      },
      {
        domain:
          "variations",
        label:
          "Variations",
        status:
          sourceMode ===
          "production"
            ? "live"
            : "fixture",
        statusLabel:
          sourceMode ===
          "production"
            ? "Live"
            : "Fixture",
        message:
          `${product.variations.length} lựa chọn; ${
            product.variations.filter(
              (item) =>
                item.purchasable &&
                item.inStock,
            ).length
          } có thể mua.`,
        itemCount:
          product.variations.length,
      },
      {
        domain:
          "gallery",
        label:
          "Gallery",
        status:
          assetWarnings >
          0
            ? "warning"
            : sourceMode ===
                "production"
              ? "live"
              : "fixture",
        statusLabel:
          assetWarnings >
          0
            ? "Review"
            : "Ready",
        message:
          assetWarnings >
          0
            ? `${assetWarnings} ảnh vẫn dùng /ui-preview/.`
            : `${product.gallery.length} ảnh hợp lệ.`,
        itemCount:
          product.gallery.length,
      },
      {
        domain:
          "cart-bridge",
        label:
          "Cart bridge",
        status:
          "warning",
        statusLabel:
          "Candidate only",
        message:
          "Selection chỉ phát browser event và sessionStorage; Package 28 sẽ nối Cart store.",
      },
    ],
    warnings: [
      "Production route /esim/[slug] is unchanged.",
      "Cart store production is unchanged.",
      routeMode ===
      "legacy"
        ? "YSIM_UI_PRODUCT_DETAIL is still legacy."
        : "Product Detail feature flag is in candidate/refactor review mode.",
    ],
    product,
  };
}
