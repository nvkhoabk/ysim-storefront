import {
  ProductListingComposition,
} from "@/components/secondary-routes/SecondaryPageComposition";

import {
  loadCatalog,
} from "@/lib/storefront/integration/secondary-routes/service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const candidate = await loadCatalog();

  return (
    <ProductListingComposition
      title="Tất cả gói eSIM"
      description="Tìm và so sánh các gói theo điểm đến."
      products={candidate.products}
      diagnostics={candidate.diagnostics}
    />
  );
}
