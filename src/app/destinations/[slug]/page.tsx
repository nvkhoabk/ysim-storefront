import type { Metadata } from "next";

import { PageShell } from "@/components/layout";
import { DestinationProductsFallbackPage } from "@/components/destination-products/DestinationProductsFallbackPage";
import { resolveEsimQuickFilterFromSearchParams } from "@/lib/storefront/catalog/esim-quick-filter";
import { loadCatalog } from "@/lib/storefront/integration/secondary-routes/service";
import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import { localizeEsimQuickFilterSelection } from "@/i18n/listing/static-destination.config";
import { StorefrontLocaleProvider } from "@/i18n/runtime";
import { resolveStorefrontDestinationHero } from "@/config/storefront-destination-heroes";

export const dynamic = "force-dynamic";

interface DestinationDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function resolveDestinationSelection(slug: string): EsimQuickFilterSelection {
  if (slug === "global") {
    return resolveEsimQuickFilterFromSearchParams({ type: "global" });
  }

  const continentSelection = resolveEsimQuickFilterFromSearchParams({
    continent: slug,
  });
  if (continentSelection.kind === "continent") return continentSelection;

  const regionSelection = resolveEsimQuickFilterFromSearchParams({
    type: "region",
    region: slug,
  });
  if (regionSelection.kind === "region") return regionSelection;

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
  const request = await getStorefrontLocaleRequest();
  const selection = localizeEsimQuickFilterSelection(
    resolveDestinationSelection(slug),
    request.shell.locale,
  );
  const title = destinationPageTitle(selection.label);
  const t = createListingTranslator(request.shell.locale);

  return withLocalizedAlternates(
    {
      title,
      description: t("ordinary.destinationPlansDescription"),
      alternates: {
        canonical: `/destinations/${selection.id}`,
      },
    },
    request,
  );
}

export default async function DestinationDetailPage({
  params,
}: DestinationDetailPageProps) {
  const request = await getStorefrontLocaleRequest();
  const { slug } = await params;
  const resolvedSelection = resolveDestinationSelection(slug);
  const catalog = await loadCatalog(request.shell.locale, resolvedSelection);
  const selection = localizeEsimQuickFilterSelection(
    resolvedSelection,
    request.shell.locale,
  );
  const matchingProductCount = catalog.products.length;
  const heroAsset = resolveStorefrontDestinationHero(selection.id);

  return (
    <StorefrontLocaleProvider shell={request.shell}>
      <PageShell>
        <DestinationProductsFallbackPage
          products={catalog.products}
          selection={selection}
          matchingProductCount={matchingProductCount}
          heroAsset={heroAsset}
        />
      </PageShell>
    </StorefrontLocaleProvider>
  );
}
