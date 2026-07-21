import {
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  Wave1ActivationPlanViewModel,
  Wave1ActivationRouteId,
  Wave1ActivationRouteViewModel,
} from "@/types/view-models/wave1-activation";

const projectPlaceholder =
  '"..\\ysim-storefront"';

const definitions:
  readonly Omit<
    Wave1ActivationRouteViewModel,
    | "mode"
    | "modeLabel"
    | "activationCommand"
    | "rollbackCommand"
  >[] = [
    {
      id:
        "support",
      order:
        1,
      label:
        "Support",
      productionPath:
        "/support",
      candidatePath:
        "/ui-preview/support-route-candidate",
      featureFlag:
        "YSIM_UI_SUPPORT",
      risk:
        "low",
      sourceDependencies: [
        "Package 16",
        "Package 22",
        "Package 23",
      ],
      acceptanceChecks: [
        "Legacy mode renders old route",
        "FAQ/device/contact diagnostics",
        "External support links",
        "No personal data persistence",
      ],
    },
    {
      id:
        "guides",
      order:
        2,
      label:
        "Guide Landing",
      productionPath:
        "/guides",
      candidatePath:
        "/ui-preview/guides-route-candidate?locale=vi",
      featureFlag:
        "YSIM_UI_GUIDES",
      risk:
        "low",
      sourceDependencies: [
        "Package 09",
        "Package 10",
        "Package 11",
        "Package 21",
      ],
      acceptanceChecks: [
        "Legacy mode",
        "WordPress content source",
        "Category filtering",
        "Candidate detail links",
      ],
    },
    {
      id:
        "guide-detail",
      order:
        3,
      label:
        "Guide Detail",
      productionPath:
        "/guides/[slug]",
      candidatePath:
        "/ui-preview/guides-route-candidate/cach-kiem-tra-dien-thoai-ho-tro-esim?locale=vi",
      featureFlag:
        "YSIM_UI_GUIDE_DETAIL",
      risk:
        "low",
      sourceDependencies: [
        "Package 09",
        "Package 10",
        "Package 11",
        "Package 21",
      ],
      acceptanceChecks: [
        "Legacy mode",
        "Known slug",
        "Unknown slug 404",
        "Metadata preserved",
      ],
    },
    {
      id:
        "home",
      order:
        4,
      label:
        "Home",
      productionPath:
        "/",
      candidatePath:
        "/ui-preview/home-route-candidate",
      featureFlag:
        "YSIM_UI_HOME",
      risk:
        "medium",
      sourceDependencies: [
        "Package 07",
        "Package 19",
        "Package 20",
      ],
      acceptanceChecks: [
        "Legacy mode",
        "WooCommerce live",
        "WordPress live",
        "Hero search and rails",
      ],
    },
  ];

function routeModeId(
  id:
    Wave1ActivationRouteId,
) {
  if (
    id ===
    "guide-detail"
  ) {
    return "guide-detail" as const;
  }

  return id;
}

export function createWave1ActivationPlan():
  Wave1ActivationPlanViewModel {
  const routes =
    definitions.map(
      (
        definition,
      ): Wave1ActivationRouteViewModel => {
        const mode =
          getProductionRouteMode(
            routeModeId(
              definition.id,
            ),
          );

        return {
          ...definition,
          mode,
          modeLabel:
            getProductionRouteModeLabel(
              mode,
            ),
          activationCommand:
            `node .\\scripts\\activate-package-24-wave1-route.mjs --project ${projectPlaceholder} --route ${definition.id}`,
          rollbackCommand:
            `node .\\scripts\\rollback-package-24-wave1-route.mjs --project ${projectPlaceholder} --route ${definition.id}`,
        };
      },
    );

  return {
    title:
      "Wave 1 Controlled Activation",
    description:
      "Kích hoạt từng route độc lập, giữ legacy source cùng thư mục và rollback bằng một lệnh.",
    routes,
    rules: [
      "Chỉ activation một route trong mỗi commit.",
      "Support được kích hoạt trước Home.",
      "Mỗi route phải PASS legacy, candidate và rollback.",
      "Không chuyển Wave 2/3 trong Package 24.",
      "Production mặc định giữ legacy cho đến human acceptance.",
    ],
  };
}
