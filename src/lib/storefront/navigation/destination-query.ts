import type {
  DestinationCatalogFilterState,
  DestinationContinentKey,
  DestinationRouteSelectionViewModel,
} from "@/types/view-models/destination-page";

export type DestinationSearchParams =
  Record<
    string,
    string |
    readonly string[] |
    undefined
  >;

const maxQueryLength =
  80;

const destinationAliases:
  Readonly<
    Record<
      string,
      string
    >
  > = {
    "south-korea":
      "korea",
    "united-states":
      "usa",
    "united-kingdom":
      "united-kingdom",
  };

const destinationLabels:
  Readonly<
    Record<
      string,
      string
    >
  > = {
    japan:
      "Nhật Bản",
    korea:
      "Hàn Quốc",
    singapore:
      "Singapore",
    thailand:
      "Thái Lan",
    taiwan:
      "Đài Loan",
    vietnam:
      "Việt Nam",
    china:
      "Trung Quốc",
    india:
      "Ấn Độ",
    france:
      "Pháp",
    germany:
      "Đức",
    "united-kingdom":
      "Anh",
    italy:
      "Ý",
    spain:
      "Tây Ban Nha",
    netherlands:
      "Hà Lan",
    switzerland:
      "Thụy Sĩ",
    turkey:
      "Thổ Nhĩ Kỳ",
    usa:
      "Mỹ",
    canada:
      "Canada",
    mexico:
      "Mexico",
    greenland:
      "Greenland",
    brazil:
      "Brazil",
    argentina:
      "Argentina",
    chile:
      "Chile",
    peru:
      "Peru",
    colombia:
      "Colombia",
    egypt:
      "Ai Cập",
    "south-africa":
      "Nam Phi",
    morocco:
      "Morocco",
    kenya:
      "Kenya",
    tanzania:
      "Tanzania",
    australia:
      "Úc",
    "new-zealand":
      "New Zealand",
    fiji:
      "Fiji",
    "papua-new-guinea":
      "Papua New Guinea",
    antarctica:
      "Nam Cực",
    cruise:
      "Tàu biển (Cruise)",
    global:
      "eSIM Toàn cầu",
    europe:
      "Châu Âu",
  };

const continentLabels:
  Readonly<
    Record<
      Exclude<
        DestinationContinentKey,
        "all"
      >,
      string
    >
  > = {
    asia:
      "Châu Á",
    europe:
      "Châu Âu",
    "north-america":
      "Bắc Mỹ",
    "south-america":
      "Nam Mỹ",
    africa:
      "Châu Phi",
    oceania:
      "Châu Đại Dương",
    global:
      "Đa quốc gia",
  };

const regionConfig:
  Readonly<
    Record<
      string,
      {
        label: string;
        continent:
          DestinationContinentKey;
        query?: string;
      }
    >
  > = {
    "southeast-asia": {
      label:
        "Đông Nam Á",
      continent:
        "asia",
      query:
        "Đông Nam Á",
    },
    asia: {
      label:
        "Châu Á",
      continent:
        "asia",
    },
    europe: {
      label:
        "Châu Âu",
      continent:
        "europe",
    },
    "north-america": {
      label:
        "Bắc Mỹ",
      continent:
        "north-america",
    },
    "latin-america": {
      label:
        "Mỹ Latinh",
      continent:
        "south-america",
    },
    "middle-east": {
      label:
        "Trung Đông",
      continent:
        "all",
      query:
        "Trung Đông",
    },
    africa: {
      label:
        "Châu Phi",
      continent:
        "africa",
    },
  };

function firstValue(
  value:
    string |
    readonly string[] |
    undefined,
): string | undefined {
  const raw =
    Array.isArray(
      value,
    )
      ? value[0]
      : value;

  if (
    typeof raw !==
    "string"
  ) {
    return undefined;
  }

  const next =
    raw
      .trim()
      .slice(
        0,
        maxQueryLength,
      );

  return next ||
    undefined;
}

function slugValue(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const slug =
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9-]/g,
        "",
      )
      .replace(
        /-+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      );

  return slug ||
    undefined;
}

function knownContinent(
  value: string | undefined,
): DestinationContinentKey | undefined {
  if (
    value &&
    value in
      continentLabels
  ) {
    return value as
      Exclude<
        DestinationContinentKey,
        "all"
      >;
  }

  return undefined;
}

export function resolveDestinationRouteSelection(
  params:
    DestinationSearchParams,
): DestinationRouteSelectionViewModel {
  const source = {
    destination:
      firstValue(
        params.destination,
      ),
    continent:
      firstValue(
        params.continent,
      ),
    type:
      firstValue(
        params.type,
      ),
    region:
      firstValue(
        params.region,
      ),
  };

  const requestedDestination =
    slugValue(
      source.destination,
    );

  if (
    requestedDestination
  ) {
    const canonicalSlug =
      destinationAliases[
        requestedDestination
      ] ||
      requestedDestination;

    const label =
      destinationLabels[
        canonicalSlug
      ] ||
      source.destination ||
      canonicalSlug;

    return {
      key:
        `destination:${canonicalSlug}`,
      kind:
        "destination",
      label,
      description:
        "Danh mục được lọc theo đúng điểm đến bạn vừa chọn từ trang Mua eSIM.",
      destinationSlug:
        canonicalSlug,
      query:
        label,
      source,
    };
  }

  if (
    source.type ===
    "global"
  ) {
    return {
      key:
        "global",
      kind:
        "global",
      label:
        "eSIM Toàn cầu",
      description:
        "Các lựa chọn phù hợp hành trình qua nhiều quốc gia hoặc châu lục.",
      continent:
        "global",
      source,
    };
  }

  if (
    source.type ===
      "region" &&
    source.region
  ) {
    const regionSlug =
      slugValue(
        source.region,
      );

    const region =
      regionSlug
        ? regionConfig[
            regionSlug
          ]
        : undefined;

    return {
      key:
        `region:${regionSlug || "unknown"}`,
      kind:
        "region",
      label:
        region
          ?.label ||
        source.region,
      description:
        "Danh mục đang ưu tiên các gói dùng tại nhiều quốc gia trong cùng khu vực.",
      continent:
        region
          ?.continent ||
        "all",
      query:
        region
          ?.query,
      source,
    };
  }

  const continent =
    knownContinent(
      slugValue(
        source.continent,
      ),
    );

  if (continent) {
    return {
      key:
        `continent:${continent}`,
      kind:
        "continent",
      label:
        continentLabels[
          continent as
            Exclude<
              DestinationContinentKey,
              "all"
            >
        ],
      description:
        "Danh mục được lọc theo châu lục bạn vừa chọn từ trang Mua eSIM.",
      continent,
      source,
    };
  }

  return {
    key:
      "all",
    kind:
      "all",
    label:
      "Tất cả điểm đến",
    description:
      "Khám phá toàn bộ điểm đến và gói eSIM hiện có.",
    continent:
      "all",
    source,
  };
}

export function createDestinationInitialFilters(
  base:
    DestinationCatalogFilterState,
  selection:
    DestinationRouteSelectionViewModel | undefined,
): DestinationCatalogFilterState {
  if (!selection) {
    return base;
  }

  return {
    ...base,
    query:
      selection.kind ===
      "destination"
        ? ""
        : (
            selection.query ||
            ""
          ),
    continent:
      selection.continent ||
      "all",
  };
}
