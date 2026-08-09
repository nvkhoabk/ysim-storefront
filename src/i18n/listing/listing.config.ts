// F07A-2C-2_LOCALIZED_LISTING_CANDIDATE_R1
// F07A_2C_2_NO_CURRENCY_CONVERSION
// F07A_2C_2_DYNAMIC_SOURCE_CONTENT_UNCHANGED

import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import { normalizeListingLocale } from "./listing.registry";
import type {
  ListingDestinationFixture,
  ListingProductFixture,
  LocalizedListingBundle,
} from "./listing.types";

const PRODUCT_FIXTURES = [
  {
    sku: "JP-5GBD-7D",
    sourceTitle: "eSIM Nhật Bản – 5GB/ngày – 7 ngày",
    sourceDestination: "Nhật Bản",
    destinationCode: "JP",
    dataCode: "daily",
    dataSummary: "5 GB/day",
    durationDays: 7,
    slug: "japan-5gb-day-7-days",
  },
  {
    sku: "ASIA-11-10D",
    sourceTitle: "eSIM Châu Á 11 nước – 10 ngày",
    sourceDestination: "Châu Á",
    destinationCode: "ASIA",
    dataCode: "total",
    dataSummary: "10 GB total",
    durationDays: 10,
    slug: "esim-chau-a-11-nuoc",
  },
  {
    sku: "TH-UNL-5D",
    sourceTitle: "eSIM Thái Lan – Không giới hạn – 5 ngày",
    sourceDestination: "Thái Lan",
    destinationCode: "TH",
    dataCode: "unlimited",
    dataSummary: "Unlimited",
    durationDays: 5,
    slug: "esim-thailand-unlimited-5-days",
  },
] as const satisfies readonly ListingProductFixture[];

const DESTINATION_FIXTURES = [
  {
    code: "JP",
    sourceTitle: "Nhật Bản",
    regionCode: "asia",
    catalogCount: 12,
    slug: "japan",
  },
  {
    code: "KR",
    sourceTitle: "Hàn Quốc",
    regionCode: "asia",
    catalogCount: 9,
    slug: "korea",
  },
  {
    code: "TH",
    sourceTitle: "Thái Lan",
    regionCode: "asia",
    catalogCount: 8,
    slug: "thailand",
  },
  {
    code: "SG",
    sourceTitle: "Singapore",
    regionCode: "asia",
    catalogCount: 6,
    slug: "singapore",
  },
  {
    code: "EU",
    sourceTitle: "Châu Âu",
    regionCode: "europe",
    catalogCount: 18,
    slug: "europe",
  },
  {
    code: "GL",
    sourceTitle: "Toàn cầu",
    regionCode: "global",
    catalogCount: 4,
    slug: "global",
  },
] as const satisfies readonly ListingDestinationFixture[];

export function createLocalizedListingBundle(
  localeInput: unknown,
): LocalizedListingBundle {
  const locale = normalizeListingLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);

  return {
    locale,
    marketId: shell.marketId,
    currency: shell.currency,
    htmlLang: shell.htmlLang,
    direction: shell.direction,
    routes: {
      previewEsim: `/ui-preview/localized-listings?locale=${locale}&view=esim`,
      previewDestinations: `/ui-preview/localized-listings?locale=${locale}&view=destinations`,
      productionEsim: localizeShellHref("/esim", locale),
      productionDestinations: localizeShellHref("/destinations", locale),
    },
    products: PRODUCT_FIXTURES,
    destinations: DESTINATION_FIXTURES,
  };
}

export function productHref(localeInput: unknown, slug: string): string {
  return localizeShellHref(
    `/esim/${slug}`,
    normalizeListingLocale(localeInput),
  );
}

export function destinationHref(localeInput: unknown, slug: string): string {
  return localizeShellHref(
    `/destinations/${slug}`,
    normalizeListingLocale(localeInput),
  );
}
