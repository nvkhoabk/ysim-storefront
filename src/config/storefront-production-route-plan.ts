import {
  getProductionRouteFlag,
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  ProductionRouteId,
  ProductionRoutePlanItemViewModel,
  ProductionRoutePlanViewModel,
  ProductionRouteReadiness,
} from "@/types/view-models/production-route-plan";

interface RouteDefinition
  extends Omit<
    ProductionRoutePlanItemViewModel,
    | "mode"
    | "modeLabel"
    | "environmentFlag"
  > {}

const routeDefinitions:
  readonly RouteDefinition[] = [
    {
      id:
        "home",
      label:
        "Home",
      productionPath:
        "/",
      previewPath:
        "/ui-preview/home-refactor",
      risk:
        "low",
      readiness:
        "ui-ready",
      readinessLabel:
        "UI ready",
      wave:
        1,
      composition:
        "HomePageComposition",
      dataBoundary:
        "Home adapter: Hero config + Destination/Product ViewModel + CMS content",
      dependencies: [
        "Package 07",
        "Home data adapter",
        "Announcement/Header/Footer config",
      ],
      acceptanceChecks: [
        "Hero search",
        "Destination/Product rail",
        "Mobile overflow",
        "No regression navigation",
      ],
      rollback:
        "Set YSIM_UI_HOME=legacy and rebuild/restart.",
    },
    {
      id:
        "guides",
      label:
        "Guide Landing",
      productionPath:
        "/guides",
      previewPath:
        "/ui-preview/guide-integration",
      risk:
        "low",
      readiness:
        "ui-ready",
      readinessLabel:
        "UI and gateway ready",
      wave:
        1,
      composition:
        "ContentLandingComposition",
      dataBoundary:
        "ContentGateway + Guide Server Service",
      dependencies: [
        "Package 09",
        "Package 10",
        "WordPress plugin Package 11",
      ],
      acceptanceChecks: [
        "WordPress source mode",
        "Locale fallback",
        "Category filter",
        "Metadata",
      ],
      rollback:
        "Set YSIM_UI_GUIDES=legacy.",
    },
    {
      id:
        "guide-detail",
      label:
        "Guide Detail",
      productionPath:
        "/guides/[slug]",
      previewPath:
        "/ui-preview/guide-integration/cach-kiem-tra-dien-thoai-ho-tro-esim?locale=vi",
      risk:
        "low",
      readiness:
        "ui-ready",
      readinessLabel:
        "UI and gateway ready",
      wave:
        1,
      composition:
        "ArticlePageComposition",
      dataBoundary:
        "ContentGateway detail + locale fallback + metadata",
      dependencies: [
        "Package 09",
        "Package 10",
        "WordPress content record",
      ],
      acceptanceChecks: [
        "404 behavior",
        "HTML rendering",
        "Related article",
        "Canonical/noindex",
      ],
      rollback:
        "Set YSIM_UI_GUIDE_DETAIL=legacy.",
    },
    {
      id:
        "support",
      label:
        "Support",
      productionPath:
        "/support",
      previewPath:
        "/ui-preview/support-refactor",
      risk:
        "low",
      readiness:
        "ui-ready",
      readinessLabel:
        "UI ready",
      wave:
        1,
      composition:
        "SupportPageComposition",
      dataBoundary:
        "Support config + future device/FAQ adapters",
      dependencies: [
        "Package 16",
        "Support channel configuration",
      ],
      acceptanceChecks: [
        "Device checker",
        "FAQ",
        "Support links",
        "Mobile layout",
      ],
      rollback:
        "Set YSIM_UI_SUPPORT=legacy.",
      note:
        "Compatibility dataset vẫn là fixture; cần adapter chính thức sau.",
    },
    {
      id:
        "destinations",
      label:
        "Destinations",
      productionPath:
        "/destinations",
      previewPath:
        "/ui-preview/destination-refactor",
      risk:
        "medium",
      readiness:
        "adapter-required",
      readinessLabel:
        "Adapter required",
      wave:
        2,
      composition:
        "DestinationPageComposition",
      dataBoundary:
        "WooCommerce category adapter + commerce summary + presentation config",
      dependencies: [
        "Package 05",
        "Package 08",
        "WooCommerce category adapter",
      ],
      acceptanceChecks: [
        "Category hierarchy",
        "From price",
        "Filter/sort",
        "Empty state",
      ],
      rollback:
        "Set YSIM_UI_DESTINATIONS=legacy.",
    },
    {
      id:
        "product-detail",
      label:
        "Product Detail",
      productionPath:
        "/esim/[slug]",
      previewPath:
        "/ui-preview/product-detail-refactor",
      risk:
        "medium",
      readiness:
        "adapter-required",
      readinessLabel:
        "Adapter and Cart bridge required",
      wave:
        2,
      composition:
        "ProductDetailPageComposition",
      dataBoundary:
        "WooCommerce Product/Variation adapter + Cart action bridge",
      dependencies: [
        "Package 06",
        "Package 12",
        "Product detail adapter",
        "Cart bridge",
      ],
      acceptanceChecks: [
        "Variation mapping",
        "Stock/purchasable",
        "Price",
        "Add-to-cart",
      ],
      rollback:
        "Set YSIM_UI_PRODUCT_DETAIL=legacy.",
    },
    {
      id:
        "cart",
      label:
        "Cart",
      productionPath:
        "/cart",
      previewPath:
        "/ui-preview/cart-refactor",
      risk:
        "high",
      readiness:
        "adapter-required",
      readinessLabel:
        "Cart integration required",
      wave:
        3,
      composition:
        "CartPageComposition",
      dataBoundary:
        "Cart store/adapter + pricing snapshot",
      dependencies: [
        "Package 13",
        "Cart persistence",
        "Promotion integration",
      ],
      acceptanceChecks: [
        "Persistence",
        "Quantity/remove",
        "Unavailable line",
        "Totals",
      ],
      rollback:
        "Set YSIM_UI_CART=legacy; preserve cart data contract.",
    },
    {
      id:
        "checkout",
      label:
        "Checkout",
      productionPath:
        "/checkout",
      previewPath:
        "/ui-preview/checkout-refactor",
      risk:
        "high",
      readiness:
        "payment-blocked",
      readinessLabel:
        "Order and payment integration required",
      wave:
        3,
      composition:
        "CheckoutPageComposition",
      dataBoundary:
        "Cart snapshot + WooCommerce Order adapter + Payment provider adapter",
      dependencies: [
        "Package 14",
        "WooCommerce Order API",
        "GPay/OnePay adapters",
        "Validation/idempotency",
      ],
      acceptanceChecks: [
        "Order creation",
        "Recipient email",
        "Payment selection",
        "Retry/idempotency",
      ],
      rollback:
        "Set YSIM_UI_CHECKOUT=legacy; do not delete created Orders.",
    },
    {
      id:
        "payment-result",
      label:
        "Payment Result",
      productionPath:
        "/payment/return",
      previewPath:
        "/ui-preview/payment-result-refactor",
      risk:
        "high",
      readiness:
        "payment-blocked",
      readinessLabel:
        "Payment integration required",
      wave:
        3,
      composition:
        "PaymentResultPageComposition",
      dataBoundary:
        "Payment adapter result + verified callback + Order state",
      dependencies: [
        "Package 15",
        "GPay signature resolution",
        "Payment status service",
      ],
      acceptanceChecks: [
        "Success/failed/pending",
        "Verified signature",
        "No double payment",
        "Safe refresh",
      ],
      rollback:
        "Set YSIM_UI_PAYMENT_RESULT=legacy; payment processing remains server-side.",
    },
    {
      id:
        "order-result",
      label:
        "Order Result",
      productionPath:
        "/orders/[orderCode]",
      previewPath:
        "/ui-preview/order-result-refactor/YSIM-DEMO-20260721-001",
      risk:
        "high",
      readiness:
        "adapter-required",
      readinessLabel:
        "Order lookup required",
      wave:
        3,
      composition:
        "OrderResultPageComposition",
      dataBoundary:
        "WooCommerce Order lookup + payment/fulfillment timeline",
      dependencies: [
        "Package 15",
        "Secure order lookup",
        "Order access token/magic link",
      ],
      acceptanceChecks: [
        "Order authorization",
        "Payment facts",
        "Fulfillment status",
        "Sensitive data masking",
      ],
      rollback:
        "Set YSIM_UI_ORDER_RESULT=legacy.",
    },
  ];

export function createProductionRoutePlan():
  ProductionRoutePlanViewModel {
  const routes =
    routeDefinitions.map(
      (
        route,
      ): ProductionRoutePlanItemViewModel => {
        const mode =
          getProductionRouteMode(
            route.id,
          );

        return {
          ...route,

          mode,

          modeLabel:
            getProductionRouteModeLabel(
              mode,
            ),

          environmentFlag:
            getProductionRouteFlag(
              route.id,
            ),
        };
      },
    );

  return {
    title:
      "Production Route Integration Plan",

    description:
      "Kế hoạch chuyển từng route từ legacy sang refactor bằng candidate review, feature flag và rollback độc lập.",

    routes,

    waves: [
      {
        wave:
          1,
        title:
          "Wave 1 — Content & Discovery Shell",
        description:
          "Route ít ảnh hưởng đến Order và Payment.",
        routeIds: [
          "home",
          "guides",
          "guide-detail",
          "support",
        ],
      },
      {
        wave:
          2,
        title:
          "Wave 2 — Catalog Commerce",
        description:
          "Route phụ thuộc WooCommerce Product/Category adapter.",
        routeIds: [
          "destinations",
          "product-detail",
        ],
      },
      {
        wave:
          3,
        title:
          "Wave 3 — Transactional Commerce",
        description:
          "Cart, Order và Payment cần acceptance chặt chẽ nhất.",
        routeIds: [
          "cart",
          "checkout",
          "payment-result",
          "order-result",
        ],
      },
    ],

    globalChecks: [
      "npm run typecheck PASS.",
      "npm run build PASS.",
      "Human review mobile 390px, tablet 768px, desktop 1440px.",
      "Không có direct fetch trong component.",
      "Feature flag rollback đã được thử.",
      "Preview server không index.",
      "Payment route không khởi tạo giao dịch ngoài sandbox.",
    ],

    rolloutRules: [
      "Không chuyển hai transactional routes trong cùng một lần acceptance.",
      "Candidate phải chạy trên preview trước refactor mode.",
      "Không đổi data contract và UI route cùng một commit nếu có thể tách.",
      "Rollback UI không được xóa Order hoặc Payment record.",
      "Mỗi route có commit/tag candidate riêng.",
    ],
  };
}
