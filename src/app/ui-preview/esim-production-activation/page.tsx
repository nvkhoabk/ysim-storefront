import {
  EsimCatalogPage,
} from "@/components/catalog";

import {
  loadCatalog,
} from "@/lib/storefront/integration/secondary-routes/service";

export const dynamic =
  "force-dynamic";

export const metadata = {
  title:
    "eSIM Production Activation Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default async function Page() {
  const catalog =
    await loadCatalog();

  return (
    <EsimCatalogPage
      products={
        catalog.products
      }
    />
  );
}
