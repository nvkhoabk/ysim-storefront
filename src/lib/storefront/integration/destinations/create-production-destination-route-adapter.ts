import {
  createHomeWooCommerceGateway,
} from "@/lib/storefront/integration/home";

import type {
  DestinationRouteDataAdapter,
} from "./destination-route-adapter";

import {
  createProductionDestinationRouteAdapter,
} from "./production-destination-route-adapter";

function positiveInteger(
  value:
    | string
    | undefined,
  fallback: number,
  max: number,
): number {
  const parsed =
    Number(
      value,
    );

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

export function createProductionDestinationRouteAdapterFromEnvironment():
  DestinationRouteDataAdapter | undefined {
  const baseUrl =
    process.env
      .NEXT_PUBLIC_WOOCOMMERCE_URL
      ?.trim();

  if (!baseUrl) {
    return undefined;
  }

  const productFetchLimit =
    positiveInteger(
      process.env
        .YSIM_DESTINATIONS_PRODUCT_FETCH_LIMIT,
      100,
      100,
    );

  const categoryFetchLimit =
    positiveInteger(
      process.env
        .YSIM_DESTINATIONS_CATEGORY_FETCH_LIMIT,
      100,
      100,
    );

  return createProductionDestinationRouteAdapter({
    commerceGateway:
      createHomeWooCommerceGateway({
        baseUrl,
        productFetchLimit,
        categoryFetchLimit,
        revalidateSeconds:
          60,
      }),
    popularLimit:
      positiveInteger(
        process.env
          .YSIM_DESTINATIONS_POPULAR_LIMIT,
        6,
        12,
      ),
    searchProductLimit:
      positiveInteger(
        process.env
          .YSIM_DESTINATIONS_SEARCH_PRODUCT_LIMIT,
        20,
        50,
      ),
  });
}
