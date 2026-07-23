import type { Metadata } from "next";

import { PageShell } from "@/components/layout";
import { DestinationProductsFallbackPage } from "@/components/destination-products/DestinationProductsFallbackPage";
import {
  productMatchesEsimQuickFilter,
  resolveEsimQuickFilterFromSearchParams,
} from "@/lib/storefront/catalog/esim-quick-filter";
import { loadCatalog } from "@/lib/storefront/integration/secondary-routes/service";
import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";

export const dynamic = "force-dynamic";

interface DestinationDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function resolveDestinationSelection(slug: string): EsimQuickFilterSelection {
  return resolveEsimQuickFilterFromSearchParams({
    destination: slug,
  });
}

function destinationPageTitle(label: string): string {
  return /^esim\b/i.test(label) ? label : `eSIM ${label}`;
}

export async function generateMetadata({
  params,
}: DestinationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const selection = resolveDestinationSelection(slug);
  const title = destinationPageTitle(selection.label);

  return {
    title: `${title} | YSim`,
    description: `Xem các gói eSIM phù hợp cho ${selection.label}, so sánh giá và lựa chọn cấu hình phù hợp với chuyến đi.`,
    alternates: {
      canonical: `/destinations/${selection.id}`,
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: DestinationDetailPageProps) {
  const [{ slug }, catalog] = await Promise.all([params, loadCatalog()]);
  const selection = resolveDestinationSelection(slug);
  const matchingProductCount = catalog.products.filter((product) =>
    productMatchesEsimQuickFilter(product, selection),
  ).length;

  return (
    <PageShell>
      <DestinationProductsFallbackPage
        products={catalog.products}
        selection={selection}
        matchingProductCount={matchingProductCount}
      />
    </PageShell>
  );
}
