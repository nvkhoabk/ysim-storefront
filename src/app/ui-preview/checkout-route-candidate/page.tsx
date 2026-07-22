import {
  CheckoutCandidateClient,
} from "@/components/checkout/refactor/integration";

import {
  createCheckoutRouteCandidateViewModel,
} from "@/config/storefront-checkout-route-candidate";

export const metadata = {
  title:
    "Checkout Production Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function CheckoutRouteCandidatePage() {
  return (
    <CheckoutCandidateClient
      candidate={
        createCheckoutRouteCandidateViewModel()
      }
    />
  );
}
