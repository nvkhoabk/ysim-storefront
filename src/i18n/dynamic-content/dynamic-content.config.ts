// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1
// F07A_2E_1_EXPLICIT_LOCALE_RECORDS_ONLY
// F07A_2E_1_NO_MACHINE_TRANSLATION
// F07A_2E_1_SOURCE_AUTHORITY_PRESERVED
// F07A_2E_1_EXPLICIT_FALLBACK_PROVENANCE
// F07A_2E_1_NO_PRICE_CONVERSION_OR_COMMERCE_MUTATION

import { createLocalizedShellBundle } from "../shell/shell.config";
import { normalizeDynamicContentLocale } from "./dynamic-content.registry";
import type {
  CommerceAuthoritySnapshot,
  DynamicContentLocale,
  DynamicContentRecord,
  DynamicContentView,
  LocalizedContentFields,
  LocalizedDynamicContentBundle,
} from "./dynamic-content.types";

const COMMERCE_AUTHORITY = {
  productId: 2337,
  sku: "JP-5GBD-7D",
  sourceCurrency: "VND",
  sourcePriceLabel: "169.000 ₫",
  stockState: "in-stock",
  variationCount: 76,
} as const satisfies CommerceAuthoritySnapshot;

const PRODUCT_CONTENT = {
  vi: {
    title: "eSIM Nhật Bản – 5GB/ngày – 7 ngày",
    summary: "Gói dữ liệu tốc độ cao cho chuyến đi Nhật Bản.",
    description:
      "Kết nối tại Nhật Bản với cấu hình 5GB mỗi ngày trong 7 ngày, hỗ trợ hotspot theo dữ liệu catalog.",
    imageAlt: "Thẻ eSIM du lịch Nhật Bản",
  },
  en: {
    title: "Japan eSIM – 5GB/day – 7 days",
    summary: "A high-speed data package for travel in Japan.",
    description:
      "Connect in Japan with 5GB per day for 7 days, with hotspot support according to the catalog record.",
    imageAlt: "Japan travel eSIM card",
  },
  lo: {
    title: "eSIM ຍີ່ປຸ່ນ – 5GB/ມື້ – 7 ມື້",
    summary: "ແພັກເກດດາຕ້າຄວາມໄວສູງສຳລັບທ່ອງທ່ຽວຍີ່ປຸ່ນ.",
    description:
      "ເຊື່ອມຕໍ່ໃນຍີ່ປຸ່ນດ້ວຍ 5GB ຕໍ່ມື້ເປັນເວລາ 7 ມື້ ແລະ ຮອງຮັບ hotspot ຕາມ catalog.",
    imageAlt: "ບັດ eSIM ທ່ອງທ່ຽວຍີ່ປຸ່ນ",
  },
} as const satisfies Readonly<
  Record<DynamicContentLocale, LocalizedContentFields>
>;

const DESTINATION_CONTENT = {
  vi: {
    title: "Nhật Bản",
    summary: "Khám phá các gói eSIM cho Nhật Bản.",
    description:
      "So sánh gói dữ liệu theo thời hạn, dung lượng và nhu cầu sử dụng tại Nhật Bản.",
    imageAlt: "Núi Phú Sĩ và hoa anh đào tại Nhật Bản",
  },
  en: {
    title: "Japan",
    summary: "Explore eSIM packages for Japan.",
    description:
      "Compare data packages by duration, allowance, and travel needs in Japan.",
    imageAlt: "Mount Fuji and cherry blossoms in Japan",
  },
  lo: {
    title: "ຍີ່ປຸ່ນ",
    summary: "ຄົ້ນຫາແພັກເກດ eSIM ສຳລັບຍີ່ປຸ່ນ.",
    description:
      "ປຽບທຽບແພັກເກດດາຕ້າຕາມໄລຍະເວລາ, ປະລິມານ ແລະ ຄວາມຕ້ອງການໃນຍີ່ປຸ່ນ.",
    imageAlt: "ພູຟູຈິ ແລະ ດອກຊາກຸຣະໃນຍີ່ປຸ່ນ",
  },
} as const satisfies Readonly<
  Record<DynamicContentLocale, LocalizedContentFields>
>;

const GUIDE_CONTENT = {
  vi: {
    title: "Nên cài eSIM trước hay sau khi đến nơi?",
    summary: "Chuẩn bị eSIM đúng thời điểm để chuyến đi thuận lợi.",
    description:
      "Hướng dẫn thời điểm cài đặt, kiểm tra thiết bị và lưu QR trước khi khởi hành.",
    imageAlt: "Điện thoại hiển thị quy trình cài đặt eSIM",
  },
  en: {
    title: "Should you install an eSIM before or after arrival?",
    summary: "Prepare your eSIM at the right time for a smoother trip.",
    description:
      "A guide to installation timing, device checks, and safely storing the QR before departure.",
    imageAlt: "A phone showing the eSIM installation flow",
  },
  lo: {
    title: "ຄວນຕິດຕັ້ງ eSIM ກ່ອນ ຫຼື ຫຼັງເດີນທາງຮອດ?",
    summary: "ກຽມ eSIM ໃນເວລາທີ່ເໝາະສົມເພື່ອໃຫ້ການເດີນທາງສະດວກ.",
    description:
      "ຄູ່ມືເວລາຕິດຕັ້ງ, ກວດອຸປະກອນ ແລະ ເກັບ QR ຢ່າງປອດໄພກ່ອນເດີນທາງ.",
    imageAlt: "ໂທລະສັບສະແດງຂັ້ນຕອນຕິດຕັ້ງ eSIM",
  },
} as const satisfies Readonly<
  Record<DynamicContentLocale, LocalizedContentFields>
>;

const FALLBACK_CONTENT = {
  vi: {
    title: "Cách kiểm tra điện thoại có hỗ trợ eSIM",
    summary: "Kiểm tra khả năng tương thích trước khi mua gói.",
    description:
      "Đối chiếu model, mục cài đặt SIM và tình trạng khóa mạng trước khi thanh toán.",
    imageAlt: "Màn hình kiểm tra khả năng hỗ trợ eSIM",
  },
} as const satisfies Readonly<
  Partial<Record<DynamicContentLocale, LocalizedContentFields>>
>;

function resolveRecord(
  kind: "product" | "destination" | "guide",
  sourceSystem: "woocommerce" | "wordpress",
  entityId: string,
  slug: string,
  requestedLocale: DynamicContentLocale,
  catalog: Readonly<
    Partial<Record<DynamicContentLocale, LocalizedContentFields>>
  >,
  commerceAuthority: CommerceAuthoritySnapshot | null,
): DynamicContentRecord {
  const direct = catalog[requestedLocale];
  const resolvedLocale: DynamicContentLocale = direct ? requestedLocale : "vi";
  const fields = direct ?? catalog.vi;
  if (!fields)
    throw new Error(`DYNAMIC_CONTENT_FALLBACK_MISSING:${kind}:${slug}`);
  return {
    entityId,
    kind,
    sourceSystem,
    slug,
    requestedLocale,
    resolvedLocale,
    status: direct ? "localized" : "fallback",
    fallbackReason: direct ? null : "missing-locale-record",
    fields,
    commerceAuthority,
  };
}

const VIEWS = [
  "product",
  "destination",
  "guide",
  "fallback",
] as const satisfies readonly DynamicContentView[];

export function createLocalizedDynamicContentBundle(
  localeInput: unknown,
): LocalizedDynamicContentBundle {
  const locale = normalizeDynamicContentLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);
  const preview = Object.fromEntries(
    VIEWS.map((view) => [
      view,
      `/ui-preview/localized-dynamic-content?locale=${locale}&view=${view}`,
    ]),
  ) as Readonly<Record<DynamicContentView, string>>;
  return {
    locale,
    marketId: shell.marketId,
    currency: shell.currency,
    htmlLang: shell.htmlLang,
    direction: shell.direction,
    routes: { preview },
    records: {
      product: resolveRecord(
        "product",
        "woocommerce",
        "product:2337",
        "japan-5gb-day-7-days",
        locale,
        PRODUCT_CONTENT,
        COMMERCE_AUTHORITY,
      ),
      destination: resolveRecord(
        "destination",
        "woocommerce",
        "category:jp",
        "japan",
        locale,
        DESTINATION_CONTENT,
        null,
      ),
      guide: resolveRecord(
        "guide",
        "wordpress",
        "post:esim-install-timing",
        "nen-cai-esim-truoc-hay-sau-khi-den-noi",
        locale,
        GUIDE_CONTENT,
        null,
      ),
      fallback: resolveRecord(
        "guide",
        "wordpress",
        "post:device-esim-check",
        "cach-kiem-tra-dien-thoai-co-ho-tro-esim",
        locale,
        FALLBACK_CONTENT,
        null,
      ),
    },
  };
}
