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

interface PageProps {
  params: Promise<{
    orderCode: string;
  }>;
}

export default async function OrderRouteCandidateByCodePage({
  params,
}: PageProps) {
  const {
    orderCode,
  } =
    await params;

  return (
    <OrderCandidateClient
      config={
        createOrderRouteCandidateConfigViewModel()
      }
      orderCode={
        orderCode
      }
    />
  );
}
