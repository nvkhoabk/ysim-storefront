/* YSIM_PACKAGE_39_ROUTE:refund-policy */

import type {
  Metadata,
} from "next";

import {
  ProductionPolicyComposition,
} from "@/components/secondary-routes/production";

import {
  loadPolicy,
} from "@/lib/storefront/integration/secondary-routes/service";

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
    title:
      "Chính sách hoàn tiền | YSim",
    description:
      "Điều kiện và quy trình xử lý yêu cầu hoàn tiền đối với đơn hàng eSIM tại YSim.",
    alternates: {
      canonical:
        "/refund-policy",
    },
  };

export default async function Page() {
  const policy =
    await loadPolicy(
      "refund-policy",
    );

  return (
    <ProductionPolicyComposition
      page={
        policy.page
      }
    />
  );
}
