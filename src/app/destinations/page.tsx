/* YSIM_PACKAGE_38_V3_ROUTE:destinations-query-bridge */

import LegacyDestinationsPage from "./legacy-page";

import { DestinationPageComposition } from "@/components/destination/refactor";

import { DestinationRouteCandidatePage } from "@/components/destination/refactor/integration";

import {
  createProductionDestinationRouteAdapterFromEnvironment,
  loadDestinationRouteCandidate,
} from "@/lib/storefront/integration/destinations";

import {
  resolveDestinationRouteSelection,
  type DestinationSearchParams,
} from "@/lib/storefront/navigation/destination-query";

import { getProductionRouteMode } from "@/lib/storefront/integration/route-flags";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createListingTranslator } from "@/i18n/listing/listing.registry";
import {
  localizeDestinationPageViewModel,
  localizeDestinationRouteSelection,
} from "@/lib/storefront/localization";
import { metadata as legacyMetadata } from "./legacy-page";

export async function generateMetadata() {
  const request = await getStorefrontLocaleRequest();
  const t = createListingTranslator(request.shell.locale);
  return withLocalizedAlternates(
    {
      ...legacyMetadata,
      title: t("destinations.title"),
      description: t("destinations.description"),
    },
    request,
  );
}

interface DestinationsPageProps {
  searchParams?: Promise<DestinationSearchParams>;
}

export default async function DestinationsPage(props: DestinationsPageProps) {
  const request = await getStorefrontLocaleRequest();
  const mode = getProductionRouteMode("destinations");

  if (mode === "legacy" && !request.localized) {
    return <LegacyDestinationsPage />;
  }

  const candidate = await loadDestinationRouteCandidate({
    productionAdapter: createProductionDestinationRouteAdapterFromEnvironment(
      request.shell.locale,
    ),
  });

  const selection = localizeDestinationRouteSelection(
    resolveDestinationRouteSelection(
      await Promise.resolve(
        (props.searchParams || {}) as DestinationSearchParams,
      ),
    ),
    request.shell.locale,
  );
  const localizedPage = request.localized
    ? localizeDestinationPageViewModel(candidate.page, request.shell.locale)
    : candidate.page;

  if (mode === "candidate") {
    return (
      <DestinationRouteCandidatePage
        candidate={{ ...candidate, page: localizedPage }}
        initialSelection={selection}
      />
    );
  }

  return (
    <DestinationPageComposition
      page={localizedPage}
      cartCount={0}
      initialSelection={selection}
    />
  );
}
