/* YSIM_PACKAGE_32_ACTIVATION:cart */
import LegacyCartPage from "./legacy-page";

import {
  CartCandidateClient,
} from "@/components/cart/refactor/integration";

import {
  createCartRouteCandidateViewModel,
} from "@/config/storefront-cart-route-candidate";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export { metadata } from "./legacy-page";

export default function CartPage() {
  const mode =
    getProductionRouteMode(
      "cart",
    );

  if (
    mode ===
    "legacy"
  ) {
    return (
      <LegacyCartPage />
    );
  }

  return (
    <CartCandidateClient
      candidate={
        createCartRouteCandidateViewModel()
      }
      showDiagnostics={
        mode ===
        "candidate"
      }
    />
  );
}
