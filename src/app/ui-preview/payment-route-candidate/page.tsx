import {
  PaymentCandidateClient,
} from "@/components/payment/refactor/integration";

import {
  createPaymentCandidateConfigViewModel,
} from "@/config/storefront-payment-route-candidate";

export const metadata = {
  title:
    "Verified Payment Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function PaymentRouteCandidatePage() {
  return (
    <PaymentCandidateClient
      config={
        createPaymentCandidateConfigViewModel()
      }
    />
  );
}
