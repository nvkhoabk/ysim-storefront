/* YSIM_PACKAGE_39_ROUTE:privacy-policy */

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
      "Chính sách quyền riêng tư | YSim",
    description:
      "Thông tin về việc thu thập, sử dụng và bảo vệ dữ liệu cá nhân tại YSim.",
    alternates: {
      canonical:
        "/privacy-policy",
    },
  };

export default async function Page() {
  const policy =
    await loadPolicy(
      "privacy-policy",
    );

  return (
    <ProductionPolicyComposition
      page={
        policy.page
      }
    />
  );
}
