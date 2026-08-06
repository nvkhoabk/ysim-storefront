/* YSIM_PACKAGE_32_ACTIVATION:cart */
import LegacyCartPage from "./legacy-page";

import { CartCandidateClient } from "@/components/cart/refactor/integration";

import { createCartRouteCandidateViewModel } from "@/config/storefront-cart-route-candidate";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createTransactionTranslator } from "@/i18n/transaction/transaction.registry";
import { metadata as legacyMetadata } from "./legacy-page";

export async function generateMetadata() {
  const request = await getStorefrontLocaleRequest();
  const t = createTransactionTranslator(request.shell.locale);
  return withLocalizedAlternates(
    {
      ...legacyMetadata,
      title: t("cart.title"),
      description: t("cart.description"),
    },
    request,
  );
}

export default async function CartPage() {
  const request = await getStorefrontLocaleRequest();
  const t = createTransactionTranslator(request.shell.locale);
  const mode = getProductionRouteMode("cart");

  if (mode === "legacy" && !request.localized) {
    return <LegacyCartPage />;
  }

  const candidate = {
    ...createCartRouteCandidateViewModel(),
    title: t("cart.title"),
    description: t("cart.description"),
    checkoutCandidatePath: "/checkout",
  };

  return (
    <CartCandidateClient
      candidate={candidate}
      showDiagnostics={mode === "candidate"}
    />
  );
}
