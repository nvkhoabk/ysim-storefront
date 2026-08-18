import { esimDestinationExplorer } from "@/config/esim-destination-explorer";
import { normalizeShellLocale } from "@/i18n/shell/shell.registry";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type {
  EsimDestinationExplorerViewModel,
  EsimRegionViewModel,
} from "@/types/view-models/esim-destination-explorer";
import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";

import { createListingTranslator } from "./listing.registry";

export type LocalizedDestinationName = Readonly<Record<ShellLocale, string>>;

const destinationAliases: Readonly<Record<string, string>> = {
  korea: "south-korea",
  usa: "united-states",
};

export const destinationLocalizedNames = {
  japan: { vi: "Nhật Bản", en: "Japan", lo: "ຍີ່ປຸ່ນ" },
  "south-korea": { vi: "Hàn Quốc", en: "South Korea", lo: "ເກົາຫຼີໃຕ້" },
  singapore: { vi: "Singapore", en: "Singapore", lo: "ສິງກະໂປ" },
  thailand: { vi: "Thái Lan", en: "Thailand", lo: "ໄທ" },
  taiwan: { vi: "Đài Loan", en: "Taiwan", lo: "ໄຕ້ຫວັນ" },
  vietnam: { vi: "Việt Nam", en: "Vietnam", lo: "ຫວຽດນາມ" },
  china: { vi: "Trung Quốc", en: "China", lo: "ຈີນ" },
  india: { vi: "Ấn Độ", en: "India", lo: "ອິນເດຍ" },
  france: { vi: "Pháp", en: "France", lo: "ຝຣັ່ງ" },
  germany: { vi: "Đức", en: "Germany", lo: "ເຢຍລະມັນ" },
  "united-kingdom": {
    vi: "Vương quốc Anh",
    en: "United Kingdom",
    lo: "ສະຫະລາຊະອານາຈັກ",
  },
  italy: { vi: "Ý", en: "Italy", lo: "ອິຕາລີ" },
  spain: { vi: "Tây Ban Nha", en: "Spain", lo: "ສະເປນ" },
  netherlands: { vi: "Hà Lan", en: "Netherlands", lo: "ເນເທີແລນ" },
  switzerland: {
    vi: "Thụy Sĩ",
    en: "Switzerland",
    lo: "ສະວິດເຊີແລນ",
  },
  turkey: { vi: "Thổ Nhĩ Kỳ", en: "Türkiye", lo: "ຕຸຣະກີ" },
  "united-states": {
    vi: "Hoa Kỳ",
    en: "United States",
    lo: "ສະຫະລັດອາເມລິກາ",
  },
  canada: { vi: "Canada", en: "Canada", lo: "ການາດາ" },
  mexico: { vi: "Mexico", en: "Mexico", lo: "ເມັກຊິໂກ" },
  greenland: { vi: "Greenland", en: "Greenland", lo: "ກຣີນແລນ" },
  brazil: { vi: "Brazil", en: "Brazil", lo: "ບຣາຊິນ" },
  argentina: { vi: "Argentina", en: "Argentina", lo: "ອາເຈນຕິນາ" },
  chile: { vi: "Chile", en: "Chile", lo: "ຊິລີ" },
  peru: { vi: "Peru", en: "Peru", lo: "ເປຣູ" },
  colombia: { vi: "Colombia", en: "Colombia", lo: "ໂຄລົມເບຍ" },
  egypt: { vi: "Ai Cập", en: "Egypt", lo: "ອີຢິບ" },
  "south-africa": {
    vi: "Nam Phi",
    en: "South Africa",
    lo: "ອາຟຣິກາໃຕ້",
  },
  morocco: { vi: "Morocco", en: "Morocco", lo: "ໂມຣັອກໂກ" },
  kenya: { vi: "Kenya", en: "Kenya", lo: "ເຄນຢາ" },
  tanzania: { vi: "Tanzania", en: "Tanzania", lo: "ແທນຊາເນຍ" },
  australia: { vi: "Úc", en: "Australia", lo: "ອົດສະຕາລີ" },
  "new-zealand": {
    vi: "New Zealand",
    en: "New Zealand",
    lo: "ນິວຊີແລນ",
  },
  fiji: { vi: "Fiji", en: "Fiji", lo: "ຟິຈິ" },
  "papua-new-guinea": {
    vi: "Papua New Guinea",
    en: "Papua New Guinea",
    lo: "ປາປົວນິວກີນີ",
  },
  antarctica: { vi: "Nam Cực", en: "Antarctica", lo: "ແອນຕາກຕິກາ" },
  cruise: { vi: "Tàu biển", en: "Cruise", lo: "ເຮືອສຳລານ" },
  global: { vi: "eSIM Toàn cầu", en: "Global eSIM", lo: "eSIM ທົ່ວໂລກ" },
  europe: { vi: "Châu Âu", en: "Europe", lo: "ເອີຣົບ" },
} as const satisfies Readonly<Record<string, LocalizedDestinationName>>;

const continentNames = {
  asia: { vi: "Châu Á", en: "Asia", lo: "ອາຊີ" },
  europe: { vi: "Châu Âu", en: "Europe", lo: "ເອີຣົບ" },
  "north-america": {
    vi: "Bắc Mỹ",
    en: "North America",
    lo: "ອາເມລິກາເໜືອ",
  },
  "south-america": {
    vi: "Nam Mỹ",
    en: "South America",
    lo: "ອາເມລິກາໃຕ້",
  },
  africa: { vi: "Châu Phi", en: "Africa", lo: "ອາຟຣິກາ" },
  oceania: { vi: "Châu Đại Dương", en: "Oceania", lo: "ໂອເຊຍເນຍ" },
  special: {
    vi: "Điểm đến đặc biệt",
    en: "Special destinations",
    lo: "ຈຸດໝາຍພິເສດ",
  },
  global: { vi: "Đa quốc gia", en: "Multi-country", lo: "ຫຼາຍປະເທດ" },
} as const satisfies Readonly<Record<string, LocalizedDestinationName>>;

const regionCopy = {
  "southeast-asia": {
    label: {
      vi: "Đông Nam Á",
      en: "Southeast Asia",
      lo: "ອາຊີຕາເວັນອອກສ່ຽງໃຕ້",
    },
    description: {
      vi: "Một eSIM dùng cho nhiều điểm đến phổ biến trong ASEAN.",
      en: "One eSIM for popular destinations across ASEAN.",
      lo: "ໜຶ່ງ eSIM ສຳລັບຫຼາຍຈຸດໝາຍຍອດນິຍົມໃນ ASEAN.",
    },
  },
  asia: {
    label: continentNames.asia,
    description: {
      vi: "Phù hợp hành trình qua nhiều quốc gia Đông Á và Nam Á.",
      en: "Suitable for journeys across East and South Asia.",
      lo: "ເໝາະສຳລັບການເດີນທາງຜ່ານອາຊີຕາເວັນອອກ ແລະ ອາຊີໃຕ້.",
    },
  },
  europe: {
    label: continentNames.europe,
    description: {
      vi: "Di chuyển xuyên biên giới với một gói dữ liệu duy nhất.",
      en: "Cross borders with one data plan.",
      lo: "ເດີນທາງຂ້າມຊາຍແດນດ້ວຍແພັກເກດ data ດຽວ.",
    },
  },
  "north-america": {
    label: continentNames["north-america"],
    description: {
      vi: "Kết nối tại Hoa Kỳ, Canada, Mexico và các điểm đến lân cận.",
      en: "Connect in the United States, Canada, Mexico, and nearby destinations.",
      lo: "ເຊື່ອມຕໍ່ໃນສະຫະລັດ, ການາດາ, ເມັກຊິໂກ ແລະ ຈຸດໝາຍໃກ້ຄຽງ.",
    },
  },
  "latin-america": {
    label: { vi: "Mỹ Latinh", en: "Latin America", lo: "ອາເມລິກາລາຕິນ" },
    description: {
      vi: "Dành cho hành trình qua Trung Mỹ và Nam Mỹ.",
      en: "For journeys across Central and South America.",
      lo: "ສຳລັບການເດີນທາງຜ່ານອາເມລິກາກາງ ແລະ ອາເມລິກາໃຕ້.",
    },
  },
  "middle-east": {
    label: { vi: "Trung Đông", en: "Middle East", lo: "ຕາເວັນອອກກາງ" },
    description: {
      vi: "Kết nối thuận tiện tại các trung tâm du lịch và công tác.",
      en: "Convenient coverage across major travel and business hubs.",
      lo: "ຄຸ້ມຄອງສະດວກໃນສູນກາງທ່ອງທ່ຽວ ແລະ ທຸລະກິດ.",
    },
  },
  africa: {
    label: continentNames.africa,
    description: {
      vi: "Một gói dữ liệu cho nhiều điểm đến tại châu Phi.",
      en: "One data plan for multiple destinations in Africa.",
      lo: "ໜຶ່ງແພັກເກດ data ສຳລັບຫຼາຍຈຸດໝາຍໃນອາຟຣິກາ.",
    },
  },
} as const satisfies Readonly<
  Record<
    string,
    {
      readonly label: LocalizedDestinationName;
      readonly description: LocalizedDestinationName;
    }
  >
>;

const destinationNameCatalog: Readonly<
  Record<string, LocalizedDestinationName>
> = destinationLocalizedNames;
const continentNameCatalog: Readonly<Record<string, LocalizedDestinationName>> =
  continentNames;
const regionCopyCatalog: Readonly<
  Record<
    string,
    {
      readonly label: LocalizedDestinationName;
      readonly description: LocalizedDestinationName;
    }
  >
> = regionCopy;

function canonicalDestinationSlug(slug: string): string {
  return destinationAliases[slug] ?? slug;
}

function coverageLabel(source: string, locale: ShellLocale): string {
  const count = source.match(/\d+\+/u)?.[0] ?? source;
  if (locale === "en") return `${count} countries`;
  if (locale === "lo") return `${count} ປະເທດ`;
  return `${count} quốc gia`;
}

export function localizeDestinationName(
  slug: string,
  localeInput: unknown,
  fallback: string,
): string {
  const locale = normalizeShellLocale(localeInput);
  return (
    destinationNameCatalog[canonicalDestinationSlug(slug)]?.[locale] ?? fallback
  );
}

export function localizeContinentName(
  key: string,
  localeInput: unknown,
  fallback: string,
): string {
  const locale = normalizeShellLocale(localeInput);
  return continentNameCatalog[key]?.[locale] ?? fallback;
}

export function localizeRegion(
  region: EsimRegionViewModel,
  localeInput: unknown,
): EsimRegionViewModel {
  const locale = normalizeShellLocale(localeInput);
  const copy = regionCopyCatalog[region.id];
  return {
    ...region,
    label: copy?.label[locale] ?? region.label,
    description: copy?.description[locale] ?? region.description,
    coverage: coverageLabel(region.coverage, locale),
  };
}

export function createLocalizedEsimDestinationExplorer(
  localeInput: unknown,
): EsimDestinationExplorerViewModel {
  const locale = normalizeShellLocale(localeInput);
  const t = createListingTranslator(locale);
  const localizeContinent = (
    group: EsimDestinationExplorerViewModel["primaryContinents"][number],
  ) => ({
    ...group,
    label: localizeContinentName(group.id, locale, group.label),
    countLabel:
      group.id === "special" ? t("ordinary.exploring") : group.countLabel,
    destinations: group.destinations.map((destination) => ({
      ...destination,
      label: localizeDestinationName(
        destination.slug,
        locale,
        destination.label,
      ),
    })),
  });

  return {
    ...esimDestinationExplorer,
    types: [
      {
        id: "country",
        label: t("ordinary.typeCountry"),
        description: t("ordinary.typeCountryDescription"),
      },
      {
        id: "region",
        label: t("ordinary.typeRegion"),
        description: t("ordinary.typeRegionDescription"),
      },
      {
        id: "global",
        label: t("ordinary.typeGlobal"),
        description: t("ordinary.typeGlobalDescription"),
      },
    ],
    primaryContinents:
      esimDestinationExplorer.primaryContinents.map(localizeContinent),
    secondaryContinents:
      esimDestinationExplorer.secondaryContinents.map(localizeContinent),
    regions: esimDestinationExplorer.regions.map((region) =>
      localizeRegion(region, locale),
    ),
    globalBenefits: [
      t("ordinary.globalDescription"),
      t("ordinary.benefitNoPhysicalSim"),
      t("ordinary.benefitKeepNumber"),
      t("ordinary.benefitSupport"),
    ],
    discoverBenefits: [
      t("ordinary.benefitActivation"),
      t("ordinary.benefitNoPhysicalSim"),
      t("ordinary.benefitKeepNumber"),
      t("ordinary.benefitSupport"),
    ],
  };
}

export function localizeEsimQuickFilterSelection(
  selection: EsimQuickFilterSelection,
  localeInput: unknown,
): EsimQuickFilterSelection {
  const locale = normalizeShellLocale(localeInput);
  const t = createListingTranslator(locale);
  const explorer = createLocalizedEsimDestinationExplorer(locale);
  let label = selection.label;

  if (selection.kind === "all") {
    label = t("ordinary.discoverAction");
  } else if (selection.kind === "destination" || selection.kind === "global") {
    label = localizeDestinationName(selection.id, locale, selection.label);
  } else if (selection.kind === "continent") {
    label = localizeContinentName(selection.id, locale, selection.label);
  } else if (selection.kind === "region") {
    label =
      explorer.regions.find((region) => region.id === selection.id)?.label ??
      label;
  }

  return { ...selection, label };
}

export function localizeDurationLabel(
  value: string | undefined,
  localeInput: unknown,
): string | undefined {
  if (!value) return value;
  const t = createListingTranslator(localeInput);
  const normalized = value.trim().toLocaleLowerCase("vi");
  if (normalized === "nhiều thời hạn") return t("ordinary.manyDurations");

  const range = value.match(/^(\d+)\s*[–-]\s*(\d+)\s*(?:ngày|days?)$/iu);
  if (range)
    return t("ordinary.durationRange", { min: range[1], max: range[2] });

  const from = value.match(/^(?:từ|from)\s+(\d+)\s*(?:ngày|days?)$/iu);
  if (from) return t("ordinary.durationFrom", { count: from[1] });

  const until = value.match(/^(?:đến|up to)\s+(\d+)\s*(?:ngày|days?)$/iu);
  if (until) return t("ordinary.durationUntil", { count: until[1] });

  const days = value.match(/^(\d+)\s*(?:ngày|days?)$/iu);
  if (days) return t("ordinary.durationDays", { count: days[1] });

  return value;
}

export function localizeDataLabel(value: string, localeInput: unknown): string {
  return value.trim().toLocaleLowerCase("vi") === "nhiều mức dung lượng"
    ? createListingTranslator(localeInput)("ordinary.manyDataAllowances")
    : value;
}
