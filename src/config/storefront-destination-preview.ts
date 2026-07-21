import {
  destinationPresentation,
  popularDestinationSlugs,
} from "@/config/storefront-destinations";

import {
  createDestinationCardViewModel,
} from "@/features/destination/destination-presenter";

import type {
  DestinationCategorySource,
  DestinationCommerceSummary,
} from "@/types/view-models/destination";

import type {
  DestinationCatalogItemViewModel,
} from "@/types/view-models/destination-page";

const categorySources:
  readonly DestinationCategorySource[] = [
    {
      id:
        501,
      slug:
        "japan",
      name:
        "Nhật Bản",
      description:
        "Kết nối ổn định tại Tokyo, Osaka, Kyoto và nhiều thành phố khác.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        12,
    },
    {
      id:
        502,
      slug:
        "korea",
      name:
        "Hàn Quốc",
      description:
        "Data tốc độ cao cho Seoul, Busan và toàn Hàn Quốc.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        9,
    },
    {
      id:
        503,
      slug:
        "thailand",
      name:
        "Thái Lan",
      description:
        "Online thuận tiện tại Bangkok, Phuket và Chiang Mai.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        8,
    },
    {
      id:
        504,
      slug:
        "singapore",
      name:
        "Singapore",
      description:
        "Kết nối nhanh ngay khi hạ cánh tại Singapore.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        6,
    },
    {
      id:
        505,
      slug:
        "usa",
      name:
        "Hoa Kỳ",
      description:
        "Phủ sóng cho các hành trình công tác và du lịch tại Hoa Kỳ.",
      parentSlug:
        "north-america",
      parentName:
        "Bắc Mỹ",
      productCount:
        10,
    },
    {
      id:
        506,
      slug:
        "europe",
      name:
        "Châu Âu",
      description:
        "Một eSIM cho nhiều quốc gia trong hành trình Châu Âu.",
      parentSlug:
        "coverage",
      parentName:
        "Đa quốc gia",
      productCount:
        15,
    },
  ];

const commerceSources:
  readonly DestinationCommerceSummary[] = [
    {
      destinationSlug:
        "japan",
      minPurchasablePrice:
        169000,
      minDurationDays:
        3,
      maxDurationDays:
        30,
      purchasableProductCount:
        12,
    },
    {
      destinationSlug:
        "korea",
      minPurchasablePrice:
        149000,
      minDurationDays:
        3,
      maxDurationDays:
        30,
      purchasableProductCount:
        9,
    },
    {
      destinationSlug:
        "thailand",
      minPurchasablePrice:
        99000,
      minDurationDays:
        3,
      maxDurationDays:
        15,
      purchasableProductCount:
        8,
    },
    {
      destinationSlug:
        "singapore",
      minPurchasablePrice:
        109000,
      minDurationDays:
        3,
      maxDurationDays:
        15,
      purchasableProductCount:
        6,
    },
    {
      destinationSlug:
        "usa",
      minPurchasablePrice:
        199000,
      minDurationDays:
        5,
      maxDurationDays:
        30,
      purchasableProductCount:
        10,
    },
    {
      destinationSlug:
        "europe",
      minPurchasablePrice:
        249000,
      minDurationDays:
        7,
      maxDurationDays:
        30,
      purchasableProductCount:
        15,
    },
  ];

const catalogMetadata:
  Readonly<
    Record<
      string,
      Pick<
        DestinationCatalogItemViewModel,
        | "continent"
        | "continentLabel"
        | "popularity"
        | "dataKinds"
      >
    >
  > = {
    japan: {
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularity:
        100,
      dataKinds: [
        "daily",
        "total",
      ],
    },
    korea: {
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularity:
        92,
      dataKinds: [
        "daily",
        "unlimited",
      ],
    },
    thailand: {
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularity:
        88,
      dataKinds: [
        "daily",
        "total",
      ],
    },
    singapore: {
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularity:
        80,
      dataKinds: [
        "total",
        "unlimited",
      ],
    },
    usa: {
      continent:
        "north-america",
      continentLabel:
        "Bắc Mỹ",
      popularity:
        75,
      dataKinds: [
        "daily",
        "total",
      ],
    },
    europe: {
      continent:
        "global",
      continentLabel:
        "Đa quốc gia",
      popularity:
        85,
      dataKinds: [
        "total",
        "unlimited",
      ],
    },
  };

export const destinationCatalogPreviewItems:
  readonly DestinationCatalogItemViewModel[] =
    categorySources.map(
      (category) => {
        const commerce =
          commerceSources.find(
            (item) =>
              item.destinationSlug ===
              category.slug,
          );

        const presentation =
          destinationPresentation[
            category.slug
          ];

        const metadata =
          catalogMetadata[
            category.slug
          ];

        if (
          !commerce ||
          !presentation ||
          !metadata
        ) {
          throw new Error(
            `Missing Destination preview fixture: ${category.slug}`,
          );
        }

        const card =
          createDestinationCardViewModel(
            category,
            commerce,
            presentation,
          );

        return {
          ...card,
          ...metadata,
          minDurationDays:
            commerce.minDurationDays,
          maxDurationDays:
            commerce.maxDurationDays,
        };
      },
    );

export const popularDestinationPreviewItems =
  popularDestinationSlugs
    .map(
      (slug) =>
        destinationCatalogPreviewItems.find(
          (item) =>
            item.slug ===
            slug,
        ),
    )
    .filter(
      (
        item,
      ): item is
        DestinationCatalogItemViewModel =>
        Boolean(item),
    );
