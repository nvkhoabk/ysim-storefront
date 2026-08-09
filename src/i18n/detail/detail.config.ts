// F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4
// F07A_2C_3_NO_CURRENCY_CONVERSION
// F07A_2C_3_DYNAMIC_SOURCE_CONTENT_UNCHANGED
// F07A_2C_3_NO_CART_OR_INVENTORY_MUTATION

import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { localizeShellHref } from "@/i18n/shell/shell.href";

import { normalizeDetailLocale } from "./detail.registry";
import type {
  DestinationDetailFixture,
  LocalizedDetailBundle,
  ProductDetailFixture,
} from "./detail.types";

const PRODUCT_FIXTURE = {
  sku: "JP-5GBD-7D",
  slug: "japan-5gb-day-7-days",
  sourceTitle: "eSIM Nhật Bản – 5GB/ngày – 7 ngày",
  sourceDescription:
    "Gói eSIM dữ liệu dành cho chuyến đi Nhật Bản, sử dụng mạng Docomo hoặc SoftBank tùy vùng phủ sóng.",
  sourceDestination: "Nhật Bản",
  sourceNetwork: "Docomo / SoftBank",
  dataSummary: "5 GB/day",
  durationDays: 7,
  sourceActivationPolicy: "Kết nối mạng lần đầu",
  sourceHotspot: "Có",
  sourcePhoneNumber: "Không",
  relatedSourceTitles: [
    "eSIM Nhật Bản – 3GB/ngày – 5 ngày",
    "eSIM Nhật Bản – 10GB tổng – 15 ngày",
    "eSIM Châu Á 11 nước – 10 ngày",
  ],
} as const satisfies ProductDetailFixture;

const DESTINATION_FIXTURE = {
  code: "JP",
  slug: "japan",
  sourceTitle: "Nhật Bản",
  sourceDescription:
    "Danh mục eSIM dành cho Nhật Bản với nhiều cấu hình dữ liệu và thời hạn sử dụng từ nguồn catalog.",
  sourceRegion: "Châu Á",
  sourceHeroAlt: "Phong cảnh núi Phú Sĩ và hoa anh đào tại Nhật Bản",
  catalogCount: 12,
  productSourceTitles: [
    "eSIM Nhật Bản – 5GB/ngày – 7 ngày",
    "eSIM Nhật Bản – 3GB/ngày – 5 ngày",
    "eSIM Nhật Bản – 10GB tổng – 15 ngày",
  ],
} as const satisfies DestinationDetailFixture;

export function createLocalizedDetailBundle(
  localeInput: unknown,
): LocalizedDetailBundle {
  const locale = normalizeDetailLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);

  return {
    locale,
    marketId: shell.marketId,
    currency: shell.currency,
    htmlLang: shell.htmlLang,
    direction: shell.direction,
    product: PRODUCT_FIXTURE,
    destination: DESTINATION_FIXTURE,
    routes: {
      previewProduct: `/ui-preview/localized-details?locale=${locale}&view=product`,
      previewDestination: `/ui-preview/localized-details?locale=${locale}&view=destination`,
      productionProduct: localizeShellHref(
        `/esim/${PRODUCT_FIXTURE.slug}`,
        locale,
      ),
      productionDestination: localizeShellHref(
        `/destinations/${DESTINATION_FIXTURE.slug}`,
        locale,
      ),
      productionProductListing: localizeShellHref("/esim", locale),
      productionDestinationListing: localizeShellHref("/destinations", locale),
    },
  };
}

export function relatedProductHref(
  localeInput: unknown,
  index: number,
): string {
  const locale = normalizeDetailLocale(localeInput);
  const slugs = [
    "japan-3gb-day-5-days",
    "japan-10gb-total-15-days",
    "esim-chau-a-11-nuoc",
  ] as const;
  return localizeShellHref(
    `/esim/${slugs[index] ?? PRODUCT_FIXTURE.slug}`,
    locale,
  );
}
