/* YSIM_PACKAGE_32_ACTIVATION:order-result:created-new */
import {
  notFound,
} from "next/navigation";

import {
  OrderCandidateClient,
} from "@/components/order/refactor/integration";

import {
  createOrderRouteCandidateConfigViewModel,
} from "@/config/storefront-order-route-candidate";

import {
  getProductionRouteMode,
} from "@/lib/storefront/integration/route-flags";

export const dynamic =
  "force-dynamic";

function textValue(
  value: unknown,
): string | undefined {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    Array.isArray(
      value,
    ) &&
    typeof value[0] ===
      "string"
  ) {
    return value[0];
  }

  return undefined;
}

export default async function OrderResultPage(
  props: any,
) {
  const mode =
    getProductionRouteMode(
      "order-result",
    );

  if (
    mode ===
    "legacy"
  ) {
    notFound();
  }

  const params =
    await props.params;

  const orderCode =
    textValue(
      params?.orderCode,
    );

  return (
    <OrderCandidateClient
      config={
        createOrderRouteCandidateConfigViewModel()
      }
      orderCode={
        orderCode
      }
      showDiagnostics={
        mode ===
        "candidate"
      }
    />
  );
}
