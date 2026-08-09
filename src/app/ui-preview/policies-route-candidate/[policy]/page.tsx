import {
  notFound,
} from "next/navigation";

import {
  PolicyComposition,
} from "@/components/secondary-routes/SecondaryPageComposition";

import {
  loadPolicy,
} from "@/lib/storefront/integration/secondary-routes/service";

import type {
  PolicyKey,
} from "@/types/view-models/secondary-routes";

export const dynamic = "force-dynamic";

function parsePolicy(value: string): PolicyKey | undefined {
  return value === "terms" ||
    value === "privacy-policy" ||
    value === "refund-policy"
      ? value
      : undefined;
}

export default async function Page({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const key = parsePolicy(policy);

  if (!key) {
    notFound();
  }

  const candidate = await loadPolicy(key);

  return (
    <PolicyComposition
      page={candidate.page}
      diagnostics={candidate.diagnostics}
    />
  );
}
