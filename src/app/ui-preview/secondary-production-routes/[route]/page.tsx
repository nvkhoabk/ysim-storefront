import {
  notFound,
} from "next/navigation";

import {
  ProductionOffersComposition,
  ProductionPolicyComposition,
} from "@/components/secondary-routes/production";

import {
  loadPolicy,
} from "@/lib/storefront/integration/secondary-routes/service";

import type {
  PolicyKey,
} from "@/types/view-models/secondary-routes";

export const dynamic =
  "force-dynamic";

function policyKey(
  value: string,
): PolicyKey | undefined {
  return value ===
      "terms" ||
    value ===
      "privacy-policy" ||
    value ===
      "refund-policy"
    ? value
    : undefined;
}

export default async function Page({
  params,
}: {
  params:
    Promise<{
      route: string;
    }>;
}) {
  const {
    route,
  } =
    await params;

  if (
    route ===
    "offers"
  ) {
    return (
      <ProductionOffersComposition />
    );
  }

  const key =
    policyKey(
      route,
    );

  if (!key) {
    notFound();
  }

  const policy =
    await loadPolicy(
      key,
    );

  return (
    <ProductionPolicyComposition
      page={
        policy.page
      }
    />
  );
}
