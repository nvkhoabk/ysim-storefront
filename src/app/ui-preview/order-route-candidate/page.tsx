import {
  OrderCandidateClient,
} from "@/components/order/refactor/integration";

import {
  createOrderRouteCandidateConfigViewModel,
} from "@/config/storefront-order-route-candidate";

export const metadata = {
  title:
    "Secure Order Result Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function OrderRouteCandidatePage() {
  return (
    <OrderCandidateClient
      config={
        createOrderRouteCandidateConfigViewModel()
      }
    />
  );
}
