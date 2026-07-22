import {
  getProductionRouteMode,
  getProductionRouteModeLabel,
} from "@/lib/storefront/integration/route-flags";

import type {
  Wave3ActivationPlanViewModel,
  Wave3ActivationRouteViewModel,
} from "@/types/view-models/wave3-activation";

const projectPlaceholder =
  '"..\\ysim-storefront"';

const definitions:
  readonly Omit<
    Wave3ActivationRouteViewModel,
    | "mode"
    | "modeLabel"
    | "activationCommand"
    | "rollbackCommand"
  >[] = [
    {
      id:
        "cart",
      order:
        1,
      label:
        "Cart",
      productionPath:
        "/cart",
      candidatePath:
        "/ui-preview/cart-route-candidate",
      featureFlag:
        "YSIM_UI_CART",
      risk:
        "high",
      readiness:
        "candidate-ready",
      readinessLabel:
        "Candidate ready",
      dependencies: [
        "Package 13",
        "Package 28",
      ],
      acceptanceChecks: [
        "Variation add and persistence",
        "Quantity/remove",
        "Coupon",
        "WooCommerce totals",
        "Header badge",
      ],
    },
    {
      id:
        "checkout",
      order:
        2,
      label:
        "Checkout",
      productionPath:
        "/checkout",
      candidatePath:
        "/ui-preview/checkout-route-candidate",
      featureFlag:
        "YSIM_UI_CHECKOUT",
      risk:
        "critical",
      readiness:
        "candidate-ready",
      readinessLabel:
        "Order candidate ready",
      dependencies: [
        "Package 14",
        "Package 29 v2",
      ],
      acceptanceChecks: [
        "Guest validation",
        "WooCommerce Order creation",
        "Recipient details",
        "Duplicate-click guard",
        "No automatic Payment call",
      ],
      note:
        "Server-side durable idempotency is still required before public production.",
    },
    {
      id:
        "order-result",
      order:
        3,
      label:
        "Secure Order Result",
      productionPath:
        "/orders/[orderCode]",
      candidatePath:
        "/ui-preview/order-route-candidate",
      featureFlag:
        "YSIM_UI_ORDER_RESULT",
      risk:
        "high",
      readiness:
        "candidate-ready",
      readinessLabel:
        "Secure lookup ready",
      dependencies: [
        "Package 15",
        "Package 31",
      ],
      acceptanceChecks: [
        "Order ID + key proof",
        "Wrong proof rejection",
        "No order key response",
        "Order/payment/fulfillment timeline",
        "No Order mutation",
      ],
    },
    {
      id:
        "payment-result",
      order:
        4,
      label:
        "Payment Return",
      productionPath:
        "/payment/return",
      candidatePath:
        "/ui-preview/payment-result-route-candidate",
      featureFlag:
        "YSIM_UI_PAYMENT_RESULT",
      risk:
        "critical",
      readiness:
        "source-switch-only",
      readinessLabel:
        "Keep legacy",
      dependencies: [
        "Package 15",
        "Package 30 v2",
        "Package 30 v3",
        "GPay callback contract",
      ],
      acceptanceChecks: [
        "Source switch and rollback",
        "Pending/success/failed UI",
        "No client/server bundle leak",
        "Callback/query status pending",
        "Order paid update pending",
      ],
      note:
        "Activate source switch if needed, but keep YSIM_UI_PAYMENT_RESULT=legacy until payment lifecycle acceptance.",
    },
  ];

export function createWave3ActivationPlan():
  Wave3ActivationPlanViewModel {
  const routes =
    definitions.map(
      (
        definition,
      ): Wave3ActivationRouteViewModel => {
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
            `node .\\scripts\\activate-package-32-wave3-route.mjs --project ${projectPlaceholder} --route ${definition.id}`,
          rollbackCommand:
            `node .\\scripts\\rollback-package-32-wave3-route.mjs --project ${projectPlaceholder} --route ${definition.id}`,
        };
      },
    );

  return {
    title:
      "Wave 3 Controlled Activation",
    description:
      "Kích hoạt Cart, Checkout, Secure Order Result và Payment Return theo từng route với legacy fallback.",
    routes,
    guardrails: [
      "Chỉ activation một transactional route trong mỗi commit.",
      "Cart phải PASS trước Checkout.",
      "Checkout phải tạo Order đúng trước Order Result.",
      "Payment Return giữ legacy cho tới callback và reconciliation acceptance.",
      "Rollback UI không được xóa Order, Cart hoặc Payment record.",
      "Không deploy Preview trước khi typecheck/build và rollback test đều PASS.",
    ],
  };
}
