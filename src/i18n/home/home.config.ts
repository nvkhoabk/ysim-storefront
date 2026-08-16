// F07A-2C-1_LOCALIZED_HOME_CANDIDATE_R1
// F07A_2C_1_NO_CURRENCY_CONVERSION

import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import { normalizeHomeLocale } from "./home.registry";
import type { CatalogProductFixture, LocalizedHomeBundle } from "./home.types";

const CATALOG_PRODUCT_FIXTURES = [
  {
    sku: "JP-5GBD-7D",
    sourceTitle: "eSIM Nhật Bản – 5GB/ngày – 7 ngày",
  },
  {
    sku: "ASIA-REGIONAL",
    sourceTitle: "eSIM Châu Á – nhiều quốc gia",
  },
] as const satisfies readonly CatalogProductFixture[];

export function createLocalizedHomeBundle(
  localeInput: unknown,
): LocalizedHomeBundle {
  const locale = normalizeHomeLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);

  return {
    locale,
    marketId: shell.marketId,
    currency: shell.currency,
    htmlLang: shell.htmlLang,
    direction: shell.direction,
    routes: {
      browseEsim: localizeShellHref("/esim", locale),
      destinations: localizeShellHref("/destinations", locale),
      packageAssistant: localizeShellHref("/package-assistant", locale),
      deviceCheck: localizeShellHref("/device-check", locale),
      guides: localizeShellHref("/guides", locale),
      support: localizeShellHref("/support", locale),
    },
    catalogProducts: CATALOG_PRODUCT_FIXTURES,
  };
}
