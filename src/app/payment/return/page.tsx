/* YSIM_PACKAGE_32_ACTIVATION:payment-result:created-new */
import {
  notFound,
} from "next/navigation";

import {
  PaymentCandidateClient,
} from "@/components/payment/refactor/integration";

import {
  createPaymentCandidateConfigViewModel,
} from "@/config/storefront-payment-route-candidate";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export const dynamic =
  "force-dynamic";

export default function PaymentResultPage() {
  const mode =
    getProductionRouteMode(
      "payment-result",
    );

  if (
    mode ===
    "legacy"
  ) {
    notFound();
  }

  return (
    <PaymentCandidateClient
      config={
        createPaymentCandidateConfigViewModel()
      }
      resultOnly
      showDiagnostics={
        mode ===
        "candidate"
      }
    />
  );
}
