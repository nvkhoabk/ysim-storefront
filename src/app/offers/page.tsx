/* YSIM_PACKAGE_39_V2_ROUTE:offers-partner-program */

import { ProductionOffersComposition } from "@/components/secondary-routes/production";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createOffersPartnerCopy } from "@/i18n/offers/offers-partner.config";

export async function generateMetadata() {
  const request = await getStorefrontLocaleRequest();
  const copy = createOffersPartnerCopy(request.shell.locale);
  return withLocalizedAlternates(
    {
      title: copy.labels.offers,
      description: copy.labels.heroDescription,
    },
    request,
  );
}

export default function Page() {
  return <ProductionOffersComposition />;
}
