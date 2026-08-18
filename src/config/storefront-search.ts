import { esimDestinationExplorer } from "@/config/esim-destination-explorer";
import {
  destinationLocalizedNames,
  type LocalizedDestinationName,
} from "@/i18n/listing/static-destination.config";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import { normalizeStorefrontSearchText } from "#storefront-search-core";

export interface DestinationSearchDefinition {
  canonicalSlug: string;
  routeSlug: string;
  countryCode?: string;
  names: LocalizedDestinationName;
  aliases: Readonly<Partial<Record<ShellLocale, readonly string[]>>>;
  keywords: Readonly<Partial<Record<ShellLocale, readonly string[]>>>;
  priority: Readonly<Record<ShellLocale, number>>;
  flagUrl?: string;
}

const canonicalSlugAliases: Readonly<Record<string, string>> = {
  korea: "south-korea",
  usa: "united-states",
};

const prioritySlugs: Readonly<Record<ShellLocale, readonly string[]>> = {
  vi: [
    "japan",
    "south-korea",
    "thailand",
    "singapore",
    "china",
    "united-states",
    "vietnam",
    "europe",
    "global",
  ],
  en: [
    "vietnam",
    "japan",
    "south-korea",
    "thailand",
    "singapore",
    "united-states",
    "china",
    "europe",
    "global",
  ],
  lo: [
    "thailand",
    "vietnam",
    "china",
    "japan",
    "south-korea",
    "singapore",
    "united-states",
    "europe",
    "global",
  ],
};

const aliasOverrides: Readonly<
  Record<string, Readonly<Partial<Record<ShellLocale, readonly string[]>>>>
> = {
  japan: {
    vi: ["Nhật", "Nhat Ban"],
    en: ["Nippon"],
    lo: ["ຍີ່ປຸ່ນ"],
  },
  "south-korea": {
    vi: ["Hàn", "Han Quoc"],
    en: ["Korea", "Republic of Korea"],
    lo: ["ເກົາຫຼີ", "ເກົາຫຼີໃຕ້"],
  },
  vietnam: {
    vi: ["Việt Nam", "Viet Nam"],
    en: ["Viet Nam"],
    lo: ["ຫວຽດນາມ"],
  },
  china: {
    vi: ["Trung Quoc"],
    en: ["PRC", "Mainland China"],
    lo: ["ຈີນ"],
  },
  "united-states": {
    vi: ["Mỹ", "Hoa Ky"],
    en: ["USA", "US", "America"],
    lo: ["ອາເມລິກາ", "ສະຫະລັດ"],
  },
  "united-kingdom": {
    vi: ["Anh", "Vuong Quoc Anh"],
    en: ["UK", "Britain", "Great Britain"],
    lo: ["ອັງກິດ"],
  },
  europe: {
    vi: ["Chau Au"],
    en: ["EU"],
    lo: ["ເອີຣົບ"],
  },
  global: {
    vi: ["Toàn cầu", "Toan cau"],
    en: ["Worldwide", "World"],
    lo: ["ທົ່ວໂລກ"],
  },
};

const keywordOverrides: Readonly<
  Record<string, Readonly<Partial<Record<ShellLocale, readonly string[]>>>>
> = {
  japan: {
    vi: ["Tokyo", "Osaka", "Núi Phú Sĩ", "du lịch Nhật"],
    en: ["Tokyo", "Osaka", "Kyoto", "Mount Fuji", "Japan travel"],
    lo: ["ໂຕກຽວ", "ໂອຊາກາ", "ທ່ອງທ່ຽວຍີ່ປຸ່ນ"],
  },
  "south-korea": {
    vi: ["Seoul", "Busan", "du lịch Hàn Quốc"],
    en: ["Seoul", "Busan", "Korea travel"],
    lo: ["ໂຊລ", "ປູຊານ", "ທ່ອງທ່ຽວເກົາຫຼີ"],
  },
  thailand: {
    vi: ["Bangkok", "Phuket", "du lịch Thái Lan"],
    en: ["Bangkok", "Phuket", "Thailand travel"],
    lo: ["ບາງກອກ", "ພູເກັດ", "ທ່ອງທ່ຽວໄທ"],
  },
  singapore: {
    vi: ["đảo quốc", "du lịch Singapore"],
    en: ["Singapore travel", "Lion City"],
    lo: ["ທ່ອງທ່ຽວສິງກະໂປ"],
  },
  vietnam: {
    vi: ["Hà Nội", "Sài Gòn", "TP HCM", "Đà Nẵng", "du lịch Việt Nam"],
    en: ["Hanoi", "Saigon", "Ho Chi Minh City", "Da Nang", "Vietnam travel"],
    lo: ["ຮ່າໂນ້ຍ", "ໂຮຈິມິນ", "ດານັງ", "ທ່ອງທ່ຽວຫວຽດນາມ"],
  },
  china: {
    vi: ["Bắc Kinh", "Thượng Hải", "Quảng Châu", "du lịch Trung Quốc"],
    en: ["Beijing", "Shanghai", "Guangzhou", "China travel"],
    lo: ["ປັກກິ່ງ", "ຊຽງໄຮ", "ກວາງໂຈ", "ທ່ອງທ່ຽວຈີນ"],
  },
};

const internalFlagUrls: Readonly<Record<string, string>> = {
  cn: "/assets/storefront/flags/cn.svg",
  eu: "/assets/storefront/flags/eu.svg",
  jp: "/assets/storefront/flags/jp.svg",
  kr: "/assets/storefront/flags/kr.svg",
  sg: "/assets/storefront/flags/sg.svg",
  th: "/assets/storefront/flags/th.svg",
  us: "/assets/storefront/flags/us.svg",
  vn: "/assets/storefront/flags/vn.svg",
};

const explorerCountryCodes = new Map(
  [
    ...esimDestinationExplorer.primaryContinents,
    ...esimDestinationExplorer.secondaryContinents,
  ]
    .flatMap((continent) => continent.destinations)
    .map((destination) => [destination.slug, destination.countryCode] as const),
);

function priorityFor(slug: string, locale: ShellLocale): number {
  const index = prioritySlugs[locale].indexOf(slug);
  return index < 0
    ? 100 + Object.keys(destinationLocalizedNames).indexOf(slug)
    : index;
}

export const destinationSearchDefinitions: readonly DestinationSearchDefinition[] =
  Object.entries(destinationLocalizedNames).map(([routeSlug, names]) => {
    const canonicalSlug = canonicalSlugAliases[routeSlug] ?? routeSlug;
    const countryCode = explorerCountryCodes.get(routeSlug);
    const flagCode = routeSlug === "europe" ? "eu" : countryCode;

    return {
      canonicalSlug,
      routeSlug,
      countryCode,
      names,
      aliases: aliasOverrides[routeSlug] ?? {},
      keywords: keywordOverrides[routeSlug] ?? {},
      priority: {
        vi: priorityFor(routeSlug, "vi"),
        en: priorityFor(routeSlug, "en"),
        lo: priorityFor(routeSlug, "lo"),
      },
      flagUrl: flagCode ? internalFlagUrls[flagCode] : undefined,
    };
  });

const destinationDefinitionBySlug = new Map<
  string,
  DestinationSearchDefinition
>();

for (const definition of destinationSearchDefinitions) {
  destinationDefinitionBySlug.set(definition.routeSlug, definition);
  destinationDefinitionBySlug.set(definition.canonicalSlug, definition);
}

for (const [alias, canonicalSlug] of Object.entries(canonicalSlugAliases)) {
  const definition = destinationDefinitionBySlug.get(canonicalSlug);
  if (definition) destinationDefinitionBySlug.set(alias, definition);
}

export function destinationSearchDefinition(
  slug: string,
): DestinationSearchDefinition | undefined {
  return destinationDefinitionBySlug.get(slug.trim().toLowerCase());
}

export function resolveDestinationSearchDefinition(
  values: readonly (string | undefined)[],
): DestinationSearchDefinition | undefined {
  const haystack = ` ${normalizeStorefrontSearchText(values.filter(Boolean).join(" "))} `;
  const candidates = destinationSearchDefinitions.flatMap((definition) => {
    const terms = [
      definition.routeSlug,
      definition.canonicalSlug,
      definition.countryCode,
      ...Object.values(definition.names),
      ...Object.values(definition.aliases).flatMap((aliases) => aliases ?? []),
    ];
    return terms.map((term) => ({
      definition,
      term: normalizeStorefrontSearchText(term ?? ""),
    }));
  });

  return candidates
    .filter(({ term }) => term.length >= 2 && haystack.includes(` ${term} `))
    .sort((left, right) => right.term.length - left.term.length)[0]?.definition;
}
