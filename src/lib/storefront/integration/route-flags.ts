import type {
  ProductionRouteId,
  ProductionRouteMode,
} from "@/types/view-models/production-route-plan";

const environmentFlagMap:
  Readonly<
    Record<
      ProductionRouteId,
      string
    >
  > = {
    home:
      "YSIM_UI_HOME",

    destinations:
      "YSIM_UI_DESTINATIONS",

    "product-detail":
      "YSIM_UI_PRODUCT_DETAIL",

    cart:
      "YSIM_UI_CART",

    checkout:
      "YSIM_UI_CHECKOUT",

    "payment-result":
      "YSIM_UI_PAYMENT_RESULT",

    "order-result":
      "YSIM_UI_ORDER_RESULT",

    guides:
      "YSIM_UI_GUIDES",

    "guide-detail":
      "YSIM_UI_GUIDE_DETAIL",

    support:
      "YSIM_UI_SUPPORT",
  };

export function getProductionRouteFlag(
  routeId:
    ProductionRouteId,
): string {
  return environmentFlagMap[
    routeId
  ];
}

export function parseProductionRouteMode(
  value:
    | string
    | undefined,
): ProductionRouteMode {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  if (
    normalized ===
      "candidate" ||
    normalized ===
      "refactor"
  ) {
    return normalized;
  }

  return "legacy";
}

export function getProductionRouteMode(
  routeId:
    ProductionRouteId,
): ProductionRouteMode {
  const flag =
    getProductionRouteFlag(
      routeId,
    );

  return parseProductionRouteMode(
    process.env[
      flag
    ],
  );
}

export function getProductionRouteModeLabel(
  mode:
    ProductionRouteMode,
): string {
  if (
    mode ===
    "candidate"
  ) {
    return "Candidate";
  }

  if (
    mode ===
    "refactor"
  ) {
    return "Refactor";
  }

  return "Legacy";
}
