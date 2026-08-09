// F07A-2C-4_LOCALIZED_SECONDARY_CANDIDATE_R1
// F07A_2C_4_NO_CURRENCY_CONVERSION
// F07A_2C_4_DYNAMIC_SOURCE_CONTENT_UNCHANGED
// F07A_2C_4_NO_SUBMISSION_OR_COMMERCE_MUTATION

import { createLocalizedShellBundle } from "../shell/shell.config";
import { localizeShellHref } from "../shell/shell.href";
import { normalizeSecondaryLocale } from "./secondary.registry";
import type {
  GuideSourceFixture,
  LocalizedSecondaryBundle,
  OfferFixture,
  SecondaryView,
} from "./secondary.types";

const GUIDE_SOURCES = [
  {
    slug: "nen-cai-esim-truoc-hay-sau-khi-den-noi",
    sourceTitle: "Nên cài eSIM trước hay sau khi đến nơi?",
    sourceSummary:
      "Hướng dẫn thời điểm cài đặt và kích hoạt eSIM trước chuyến đi.",
  },
  {
    slug: "esim-khac-roaming-quoc-te-nhu-the-nao",
    sourceTitle: "eSIM khác roaming quốc tế như thế nào?",
    sourceSummary: "So sánh cách sử dụng, chi phí và phạm vi áp dụng.",
  },
  {
    slug: "cach-kiem-tra-dien-thoai-ho-tro-esim",
    sourceTitle: "Cách kiểm tra điện thoại có hỗ trợ eSIM",
    sourceSummary: "Các bước kiểm tra nhanh trên iOS và Android.",
  },
] as const satisfies readonly GuideSourceFixture[];

const OFFER_FIXTURES = [
  { code: "WELCOME-UI", badge: "NEW" },
  { code: "GROUP-UI", badge: "GROUP" },
  { code: "RETURN-UI", badge: "LOYALTY" },
] as const satisfies readonly OfferFixture[];

const PRODUCTION_PATHS: Readonly<Record<SecondaryView, string>> = {
  offers: "/offers",
  guides: "/guides",
  support: "/support",
  "device-check": "/device-check",
  "package-assistant": "/package-assistant",
};

export function createLocalizedSecondaryBundle(
  localeInput: unknown,
): LocalizedSecondaryBundle {
  const locale = normalizeSecondaryLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);
  const views = Object.keys(PRODUCTION_PATHS) as SecondaryView[];

  return {
    locale,
    marketId: shell.marketId,
    currency: shell.currency,
    htmlLang: shell.htmlLang,
    direction: shell.direction,
    guideSources: GUIDE_SOURCES,
    offers: OFFER_FIXTURES,
    routes: {
      preview: Object.fromEntries(
        views.map((view) => [
          view,
          `/ui-preview/localized-secondary?locale=${locale}&view=${view}`,
        ]),
      ) as Record<SecondaryView, string>,
      production: Object.fromEntries(
        views.map((view) => [
          view,
          localizeShellHref(PRODUCTION_PATHS[view], locale),
        ]),
      ) as Record<SecondaryView, string>,
    },
  };
}

export function guideSourceHref(localeInput: unknown, slug: string): string {
  const locale = normalizeSecondaryLocale(localeInput);
  return localizeShellHref(`/guides/${slug}`, locale);
}
