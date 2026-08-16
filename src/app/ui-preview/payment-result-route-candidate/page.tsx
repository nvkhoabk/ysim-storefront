import {
  PaymentCandidateClient,
} from "@/components/payment/refactor/integration";

import {
  createPaymentCandidateConfigViewModel,
} from "@/config/storefront-payment-route-candidate";

export const metadata = {
  title:
    "Payment Result Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function PaymentResultRouteCandidatePage() {
  return (
    <PaymentCandidateClient
      config={
        createPaymentCandidateConfigViewModel()
      }
      resultOnly
    />
  );
}
