import {
  EsimInlineQuickFilterPage,
} from "@/components/catalog";

import {
  loadCatalog,
} from "@/lib/storefront/integration/secondary-routes/service";

import {
  resolveEsimQuickFilterFromSearchParams,
  type EsimQuickFilterSearchParams,
} from "@/lib/storefront/catalog/esim-quick-filter";

export const dynamic =
  "force-dynamic";

export const metadata = {
  title:
    "eSIM Inline Quick Filter | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams:
    Promise<
      EsimQuickFilterSearchParams
    >;
}) {
  const [
    catalog,
    resolvedSearchParams,
  ] =
    await Promise.all([
      loadCatalog(),
      searchParams,
    ]);

  const initialSelection =
    resolveEsimQuickFilterFromSearchParams(
      resolvedSearchParams,
    );

  return (
    <EsimInlineQuickFilterPage
      products={
        catalog.products
      }
      initialSelection={
        initialSelection
      }
    />
  );
}
