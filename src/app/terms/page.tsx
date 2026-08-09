/* YSIM_PACKAGE_39_ROUTE:terms */

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
      "Điều khoản sử dụng | YSim",
    description:
      "Điều khoản áp dụng khi truy cập, mua và sử dụng dịch vụ eSIM tại YSim.",
    alternates: {
      canonical:
        "/terms",
    },
  };

export default async function Page() {
  const policy =
    await loadPolicy(
      "terms",
    );

  return (
    <ProductionPolicyComposition
      page={
        policy.page
      }
    />
  );
}
