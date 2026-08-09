import {
  ProductListingComposition,
} from "@/components/secondary-routes/SecondaryPageComposition";

import {
  loadOffers,
} from "@/lib/storefront/integration/secondary-routes/service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const candidate = await loadOffers();

  return (
    <ProductListingComposition
      title="Ưu đãi eSIM"
      description="Các sản phẩm đang có sale status từ WooCommerce."
      products={candidate.products}
      diagnostics={candidate.diagnostics}
      searchable={false}
    />
  );
}
