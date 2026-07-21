import {
  createConfiguredSupportDeviceGateway,
} from "./configured-support-device-gateway";

import {
  createEnvironmentSupportContactGateway,
} from "./environment-support-contact-gateway";

import {
  createProductionSupportRouteAdapter,
} from "./production-support-route-adapter";

import {
  createSupportWordPressFaqGateway,
} from "./support-wordpress-faq-gateway";

import type {
  SupportRouteDataAdapter,
} from "./support-route-adapter";

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

export function createProductionSupportRouteAdapterFromEnvironment():
  SupportRouteDataAdapter | undefined {
  const baseUrl =
    process.env
      .YSIM_WORDPRESS_CONTENT_BASE_URL
      ?.trim() ||
    process.env
      .NEXT_PUBLIC_WOOCOMMERCE_URL
      ?.trim();

  if (!baseUrl) {
    return undefined;
  }

  return createProductionSupportRouteAdapter({
    faqGateway:
      createSupportWordPressFaqGateway({
        baseUrl,
        namespace:
          process.env
            .YSIM_WORDPRESS_CONTENT_NAMESPACE
            ?.trim() ||
          "ysim/v1/content",
        locale:
          process.env
            .YSIM_SUPPORT_LOCALE
            ?.trim() ||
          "vi",
        limit:
          positiveInteger(
            process.env
              .YSIM_SUPPORT_FAQ_LIMIT,
            20,
            100,
          ),
        revalidateSeconds:
          300,
      }),

    deviceGateway:
      createConfiguredSupportDeviceGateway(),

    contactGateway:
      createEnvironmentSupportContactGateway(),
  });
}
