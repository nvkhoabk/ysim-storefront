import {
  esimDestinationExplorer,
} from "@/config/esim-destination-explorer";

import type {
  EsimContinentViewModel,
  EsimDestinationLinkViewModel,
  EsimRegionViewModel,
} from "@/types/view-models/esim-destination-explorer";

import type {
  EsimQuickFilterSelection,
} from "@/types/view-models/esim-quick-filter";

import type {
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

export type EsimQuickFilterSearchParams =
  Record<
    string,
    string |
    readonly string[] |
    undefined
  >;

const destinationAliases:
  Readonly<
    Record<
      string,
      readonly string[]
    >
  > = {
    "south-korea": [
      "korea",
      "han quoc",
    ],
    "united-states": [
      "usa",
      "hoa ky",
      "my",
    ],
    "united-kingdom": [
      "uk",
      "anh quoc",
      "great britain",
    ],
    taiwan: [
      "dai loan",
    ],
    turkey: [
      "tho nhi ky",
    ],
    "south-africa": [
      "nam phi",
    ],
    "new-zealand": [
      "tan tay lan",
    ],
  };

const explicitRegionAliases:
  Readonly<
    Record<
      string,
      readonly string[]
    >
  > = {
    "southeast-asia": [
      "dong nam a",
      "southeast asia",
      "asean",
      "vietnam",
      "viet nam",
      "thailand",
      "thai lan",
      "singapore",
      "malaysia",
      "indonesia",
      "philippines",
      "cambodia",
      "laos",
      "myanmar",
      "brunei",
    ],

    "middle-east": [
      "trung dong",
      "middle east",
      "uae",
      "united arab emirates",
      "saudi arabia",
      "qatar",
      "israel",
      "jordan",
      "oman",
      "bahrain",
      "kuwait",
    ],
  };

const regionContinentMap:
  Readonly<
    Record<
      string,
      readonly string[]
    >
  > = {
    asia: [
      "asia",
    ],
    europe: [
      "europe",
    ],
    "north-america": [
      "north-america",
    ],
    "latin-america": [
      "south-america",
      "north-america",
    ],
    africa: [
      "africa",
    ],
  };

const allContinents = [
  ...esimDestinationExplorer
    .primaryContinents,
  ...esimDestinationExplorer
    .secondaryContinents,
] as const;

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
        80,
      );

  return next ||
    undefined;
}

export function normalizeEsimCatalogToken(
  value: string,
): string {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /đ/g,
      "d",
    )
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim()
    .replace(
      /\s+/g,
      " ",
    );
}

function uniqueAliases(
  values:
    readonly (
      string |
      undefined
    )[],
): readonly string[] {
  return Array.from(
    new Set(
      values
        .filter(
          (
            value,
          ): value is string =>
            Boolean(
              value
                ?.trim(),
            ),
        )
        .map(
          (
            value,
          ) =>
            normalizeEsimCatalogToken(
              value,
            ),
        )
        .filter(Boolean),
    ),
  );
}

function destinationBySlug(
  slug: string,
):
  EsimDestinationLinkViewModel |
  undefined {
  return allContinents
    .flatMap(
      (
        continent,
      ) =>
        continent
          .destinations,
    )
    .find(
      (
        destination,
      ) =>
        destination.slug ===
        slug,
    );
}

function continentById(
  id: string,
):
  EsimContinentViewModel |
  undefined {
  return allContinents
    .find(
      (
        continent,
      ) =>
        continent.id ===
        id,
    );
}

function regionById(
  id: string,
):
  EsimRegionViewModel |
  undefined {
  return esimDestinationExplorer
    .regions
    .find(
      (
        region,
      ) =>
        region.id ===
        id,
    );
}

function continentAliases(
  continent:
    EsimContinentViewModel,
): readonly string[] {
  return uniqueAliases([
    continent.id,
    continent.label,
    ...continent
      .destinations
      .flatMap(
        (
          destination,
        ) => [
          destination.slug,
          destination.label,
          ...(
            destinationAliases[
              destination.slug
            ] ||
            []
          ),
        ],
      ),
  ]);
}

function regionAliases(
  region:
    EsimRegionViewModel,
): readonly string[] {
  const mappedContinents =
    regionContinentMap[
      region.id
    ] ||
    [];

  const mappedAliases =
    allContinents
      .filter(
        (
          continent,
        ) =>
          mappedContinents.includes(
            continent.id,
          ),
      )
      .flatMap(
        (
          continent,
        ) =>
          continentAliases(
            continent,
          ),
      );

  return uniqueAliases([
    region.id,
    region.label,
    ...(
      explicitRegionAliases[
        region.id
      ] ||
      []
    ),
    ...mappedAliases,
  ]);
}

export function createAllEsimQuickFilterSelection():
EsimQuickFilterSelection {
  return {
    kind:
      "all",
    id:
      "all",
    label:
      "Tất cả gói eSIM",
    aliases:
      [],
    query:
      {},
  };
}

export function createDestinationQuickFilterSelection(
  destination:
    EsimDestinationLinkViewModel,
): EsimQuickFilterSelection {
  return {
    kind:
      destination.slug ===
        "global"
        ? "global"
        : "destination",

    id:
      destination.slug,

    label:
      destination.label,

    aliases:
      uniqueAliases([
        destination.slug,
        destination.label,
        destination.countryCode,
        ...(
          destinationAliases[
            destination.slug
          ] ||
          []
        ),
      ]),

    query:
      destination.slug ===
        "global"
        ? {
            type:
              "global",
          }
        : {
            destination:
              destination.slug,
          },
  };
}

export function createContinentQuickFilterSelection(
  continent:
    EsimContinentViewModel,
): EsimQuickFilterSelection {
  return {
    kind:
      "continent",
    id:
      continent.id,
    label:
      continent.label,
    aliases:
      continentAliases(
        continent,
      ),
    query: {
      continent:
        continent.id,
    },
  };
}

export function createRegionQuickFilterSelection(
  region:
    EsimRegionViewModel,
): EsimQuickFilterSelection {
  return {
    kind:
      "region",
    id:
      region.id,
    label:
      region.label,
    aliases:
      regionAliases(
        region,
      ),
    query: {
      type:
        "region",
      region:
        region.id,
    },
  };
}

export function createGlobalQuickFilterSelection():
EsimQuickFilterSelection {
  return {
    kind:
      "global",
    id:
      "global",
    label:
      "eSIM Toàn cầu",
    aliases:
      uniqueAliases([
        "global",
        "toan cau",
        "world",
        "worldwide",
        "multi country",
        "multiple countries",
        "da quoc gia",
      ]),
    query: {
      type:
        "global",
    },
  };
}

export function resolveEsimQuickFilterFromSearchParams(
  searchParams:
    EsimQuickFilterSearchParams,
): EsimQuickFilterSelection {
  const destinationSlug =
    normalizeEsimCatalogToken(
      firstValue(
        searchParams
          .destination,
      ) ||
      "",
    )
      .replace(
        / /g,
        "-",
      );

  if (
    destinationSlug
  ) {
    const destination =
      destinationBySlug(
        destinationSlug,
      );

    if (
      destination
    ) {
      return createDestinationQuickFilterSelection(
        destination,
      );
    }

    return {
      kind:
        "destination",
      id:
        destinationSlug,
      label:
        firstValue(
          searchParams
            .destination,
        ) ||
        destinationSlug,
      aliases:
        uniqueAliases([
          destinationSlug,
        ]),
      query: {
        destination:
          destinationSlug,
      },
    };
  }

  if (
    firstValue(
      searchParams.type,
    ) ===
    "global"
  ) {
    return createGlobalQuickFilterSelection();
  }

  if (
    firstValue(
      searchParams.type,
    ) ===
    "region"
  ) {
    const regionId =
      normalizeEsimCatalogToken(
        firstValue(
          searchParams.region,
        ) ||
        "",
      )
        .replace(
          / /g,
          "-",
        );

    const region =
      regionById(
        regionId,
      );

    if (
      region
    ) {
      return createRegionQuickFilterSelection(
        region,
      );
    }
  }

  const continentId =
    normalizeEsimCatalogToken(
      firstValue(
        searchParams
          .continent,
      ) ||
      "",
    )
      .replace(
        / /g,
        "-",
      );

  const continent =
    continentById(
      continentId,
    );

  if (
    continent
  ) {
    return createContinentQuickFilterSelection(
      continent,
    );
  }

  return createAllEsimQuickFilterSelection();
}

function aliasMatches(
  haystack: string,
  alias: string,
): boolean {
  if (
    !alias
  ) {
    return false;
  }

  if (
    alias.length <=
    3
  ) {
    return (
      ` ${haystack} `
        .includes(
          ` ${alias} `,
        )
    );
  }

  return haystack
    .includes(
      alias,
    );
}

export function productMatchesEsimQuickFilter(
  product:
    SecondaryProductViewModel,
  selection:
    EsimQuickFilterSelection,
): boolean {
  if (
    selection.kind ===
    "all"
  ) {
    return true;
  }

  const haystack =
    normalizeEsimCatalogToken(
      [
        product.name,
        product.slug,
        product.destination ||
          "",
        ...(
          product.filterTerms ||
          []
        ),
      ]
        .join(
          " ",
        ),
    );

  return selection
    .aliases
    .some(
      (
        alias,
      ) =>
        aliasMatches(
          haystack,
          alias,
        ),
    );
}

export function createEsimQuickFilterUrl(
  selection:
    EsimQuickFilterSelection,
): string {
  const params =
    new URLSearchParams(
      selection.query,
    );

  const query =
    params.toString();

  return query
    ? `/esim?${query}`
    : "/esim";
}
