import {
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  Wave2ActivationPlanViewModel,
  Wave2ActivationRouteViewModel,
} from "@/types/view-models/wave2-activation";

const projectPlaceholder =
  '"..\\ysim-storefront"';

const definitions:
  readonly Omit<
    Wave2ActivationRouteViewModel,
    | "mode"
    | "modeLabel"
    | "activationCommand"
    | "rollbackCommand"
  >[] = [
    {
      id:
        "destinations",
      order:
        1,
      label:
        "Destination Catalog",
      productionPath:
        "/destinations",
      candidatePath:
        "/ui-preview/destinations-route-candidate",
      featureFlag:
        "YSIM_UI_DESTINATIONS",
      risk:
        "medium",
      dependencies: [
        "Package 08",
        "Package 25",
      ],
      acceptanceChecks: [
        "Legacy route preserved",
        "WooCommerce categories live",
        "Filters and sorting",
        "Product links use production slug",
        "Fixture fallback",
      ],
    },
    {
      id:
        "product-detail",
      order:
        2,
      label:
        "Product Detail",
      productionPath:
        "/esim/[slug]",
      candidatePath:
        "/ui-preview/esim-route-candidate/esim-nhat-ban",
      featureFlag:
        "YSIM_UI_PRODUCT_DETAIL",
      risk:
        "high",
      dependencies: [
        "Package 12",
        "Package 26 v2",
        "Package 26 v3",
      ],
      acceptanceChecks: [
        "Legacy route preserved",
        "Known and unknown slug",
        "Capacity × duration matrix",
        "Dynamic price and SKU",
        "Candidate Cart payload",
      ],
    },
  ];

export function createWave2ActivationPlan():
  Wave2ActivationPlanViewModel {
  const routes =
    definitions.map(
      (
        definition,
      ): Wave2ActivationRouteViewModel => {
        const mode =
          getProductionRouteMode(
            definition.id,
          );

        return {
          ...definition,
          mode,
          modeLabel:
            getProductionRouteModeLabel(
              mode,
            ),
          activationCommand:
            `node .\\scripts\\activate-package-27-wave2-route.mjs --project ${projectPlaceholder} --route ${definition.id}`,
          rollbackCommand:
            `node .\\scripts\\rollback-package-27-wave2-route.mjs --project ${projectPlaceholder} --route ${definition.id}`,
        };
      },
    );

  return {
    title:
      "Wave 2 Controlled Activation",
    description:
      "Kích hoạt Catalog và Product Detail theo từng route với legacy fallback và rollback độc lập.",
    routes,
    guardrails: [
      "Chỉ activation một route trong mỗi commit.",
      "Destination phải PASS trước Product Detail.",
      "Product Detail không được ghi Cart store trong Wave 2.",
      "Không gọi Checkout, Order hoặc Payment.",
      "Giữ legacy mode cho đến khi candidate acceptance hoàn tất.",
    ],
  };
}
