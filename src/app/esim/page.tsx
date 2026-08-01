/* YSIM_PACKAGE_41_ROUTE:esim-inline-quick-filter */

import type { Metadata } from "next";

import { EsimInlineQuickFilterPage } from "@/components/catalog";

import { loadCatalog } from "@/lib/storefront/integration/secondary-routes/service";

import {
  resolveEsimQuickFilterFromSearchParams,
  type EsimQuickFilterSearchParams,
} from "@/lib/storefront/catalog/esim-quick-filter";
import { localizeMetadata } from "@/i18n/runtime/runtime.server";

export const dynamic = "force-dynamic";

const baseMetadata: Metadata = {
  title: "Mua eSIM du lịch | YSim",
  description:
    "Chọn điểm đến, lọc và sắp xếp các gói eSIM du lịch ngay trên một trang.",
  alternates: {
    canonical: "/esim",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return localizeMetadata(baseMetadata);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<EsimQuickFilterSearchParams>;
}) {
  const [catalog, resolvedSearchParams] = await Promise.all([
    loadCatalog(),
    searchParams,
  ]);

  const initialSelection =
    resolveEsimQuickFilterFromSearchParams(resolvedSearchParams);

  return (
    <EsimInlineQuickFilterPage
      products={catalog.products}
      initialSelection={initialSelection}
    />
  );
}
