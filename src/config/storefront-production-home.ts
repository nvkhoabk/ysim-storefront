import type {
  DestinationPresentationConfig,
} from "@/types/view-models/destination";

import type {
  HomeSectionHeaderViewModel,
} from "@/types/view-models/home";

export interface ProductionDestinationDefinition {
  canonicalSlug: string;
  aliases:
    readonly string[];
  regionLabel: string;
}

export const productionDestinationDefinitions:
  readonly ProductionDestinationDefinition[] = [
    {
      canonicalSlug:
        "japan",
      aliases: [
        "japan",
        "nhat-ban",
      ],
      regionLabel:
        "Châu Á",
    },
    {
      canonicalSlug:
        "korea",
      aliases: [
        "korea",
        "south-korea",
        "han-quoc",
      ],
      regionLabel:
        "Châu Á",
    },
    {
      canonicalSlug:
        "thailand",
      aliases: [
        "thailand",
        "thai-lan",
      ],
      regionLabel:
        "Châu Á",
    },
    {
      canonicalSlug:
        "singapore",
      aliases: [
        "singapore",
      ],
      regionLabel:
        "Châu Á",
    },
    {
      canonicalSlug:
        "usa",
      aliases: [
        "usa",
        "united-states",
        "hoa-ky",
        "my",
      ],
      regionLabel:
        "Bắc Mỹ",
    },
    {
      canonicalSlug:
        "europe",
      aliases: [
        "europe",
        "chau-au",
      ],
      regionLabel:
        "Châu Âu",
    },
  ];

export const productionHomeGuideSection:
  HomeSectionHeaderViewModel = {
    eyebrow:
      "Cẩm nang du lịch",

    title:
      "Chuẩn bị eSIM trước chuyến đi",

    description:
      "Hướng dẫn cài đặt, kiểm tra thiết bị và sử dụng eSIM dễ hiểu.",

    actionLabel:
      "Xem tất cả",

    actionHref:
      "/guides",
  };

export const genericProductDataAttributeKeys = [
  "dung-luong",
  "dung lượng",
  "data",
  "data-amount",
  "data_amount",
  "data allowance",
] as const;

export const genericProductDurationAttributeKeys = [
  "so-ngay",
  "số ngày",
  "duration",
  "duration-days",
  "duration_days",
  "validity",
] as const;

export function resolveDestinationDefinition(
  slug: string,
):
  ProductionDestinationDefinition | undefined {
  const normalized =
    slug
      .trim()
      .toLowerCase();

  return productionDestinationDefinitions.find(
    (definition) =>
      definition.aliases.includes(
        normalized,
      ),
  );
}

export function createCanonicalDestinationPresentation(
  canonicalSlug: string,
  source:
    DestinationPresentationConfig,
): DestinationPresentationConfig {
  return {
    ...source,
    slug:
      canonicalSlug,
  };
}
