import {
  createHomeWooCommerceGateway,
} from "./home-woocommerce-gateway";

import {
  createHomeWordPressContentGateway,
} from "./home-wordpress-content-gateway";

import {
  createProductionHomeRouteAdapter,
} from "./production-home-route-adapter";

import type {
  ContentLocale,
} from "@/types/view-models/content";

import type {
  HomeRouteDataAdapter,
} from "./home-route-adapter";

function positiveInteger(
  value:
    | string
    | undefined,
  fallback: number,
  max: number,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return fallback;
  }

  return Math.max(
    1,
    Math.min(
      max,
      Math.floor(
        parsed,
      ),
    ),
  );
}

function contentLocale(
  value:
    | string
    | undefined,
): ContentLocale {
  if (
    value ===
      "en" ||
    value ===
      "ja" ||
    value ===
      "ko"
  ) {
    return value;
  }

  return "vi";
}

export function createProductionHomeRouteAdapterFromEnvironment():
  HomeRouteDataAdapter | undefined {
  const commerceBaseUrl =
    process.env
      .NEXT_PUBLIC_WOOCOMMERCE_URL
      ?.trim();

  if (!commerceBaseUrl) {
    return undefined;
  }

  const contentBaseUrl =
    process.env
      .YSIM_WORDPRESS_CONTENT_BASE_URL
      ?.trim() ||
    commerceBaseUrl;

  const namespace =
    process.env
      .YSIM_WORDPRESS_CONTENT_NAMESPACE
      ?.trim() ||
    "ysim/v1/content";

  const productLimit =
    positiveInteger(
      process.env
        .YSIM_HOME_PRODUCT_LIMIT,
      8,
      24,
    );

  const destinationLimit =
    positiveInteger(
      process.env
        .YSIM_HOME_DESTINATION_LIMIT,
      6,
      12,
    );

  const guideLimit =
    positiveInteger(
      process.env
        .YSIM_HOME_GUIDE_LIMIT,
      3,
      9,
    );

  return createProductionHomeRouteAdapter({
    commerceGateway:
      createHomeWooCommerceGateway({
        baseUrl:
          commerceBaseUrl,

        productFetchLimit:
          Math.max(
            productLimit *
              6,
            24,
          ),

        categoryFetchLimit:
          100,

        revalidateSeconds:
          60,
      }),

    contentGateway:
      createHomeWordPressContentGateway({
        baseUrl:
          contentBaseUrl,

        namespace,

        revalidateSeconds:
          300,
      }),

    locale:
      contentLocale(
        process.env
          .YSIM_HOME_LOCALE,
      ),

    productLimit,

    destinationLimit,

    guideLimit,
  });
}
