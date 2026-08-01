/* YSIM_PACKAGE_41_ROUTE:esim-inline-quick-filter */

import type { Metadata } from "next";

import { EsimInlineQuickFilterPage } from "@/components/catalog";

import { loadCatalog } from "@/lib/storefront/integration/secondary-routes/service";

import {
  resolveEsimQuickFilterFromSearchParams,
  type EsimQuickFilterSearchParams,
} from "@/lib/storefront/catalog/esim-quick-filter";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createListingTranslator } from "@/i18n/listing/listing.registry";

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
  const request = await getStorefrontLocaleRequest();
  const t = createListingTranslator(request.shell.locale);
  return withLocalizedAlternates(
    {
      ...baseMetadata,
      title: `${t("esim.title")} | YSim`,
      description: t("esim.description"),
    },
    request,
  );
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
