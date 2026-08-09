import {
  CartCandidateClient,
} from "@/components/cart/refactor/integration";

import {
  createCartRouteCandidateViewModel,
} from "@/config/storefront-cart-route-candidate";

export const metadata = {
  title:
    "Cart Production Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function CartRouteCandidatePage() {
  return (
    <CartCandidateClient
      candidate={
        createCartRouteCandidateViewModel()
      }
    />
  );
}
