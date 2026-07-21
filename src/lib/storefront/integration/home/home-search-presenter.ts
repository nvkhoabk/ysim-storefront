import type {
  ArticleCardViewModel,
} from "@/types/view-models/content";

import type {
  DestinationCardViewModel,
} from "@/types/view-models/destination";

import type {
  HeroSearchItemViewModel,
} from "@/types/view-models/hero";

import type {
  ProductCardViewModel,
} from "@/types/view-models/product-card";

function formatVnd(
  amount:
    | number
    | string,
): string {
  const numeric =
    typeof amount ===
      "number"
      ? amount
      : Number(
          String(
            amount,
          ).replace(
            /[^\d.-]/g,
            "",
          ),
        );

  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return "Xem giá";
  }

  return new Intl.NumberFormat(
    "vi-VN",
    {
      style:
        "currency",
      currency:
        "VND",
      maximumFractionDigits:
        0,
    },
  ).format(
    numeric,
  );
}

export function createHomeHeroSearchItems({
  destinations,
  products,
  guides,
}: {
  destinations:
    readonly DestinationCardViewModel[];
  products:
    readonly ProductCardViewModel[];
  guides:
    readonly ArticleCardViewModel[];
}): readonly HeroSearchItemViewModel[] {
  const destinationItems =
    destinations.map(
      (
        destination,
      ): HeroSearchItemViewModel => ({
        id:
          `destination-${destination.slug}`,

        type:
          "destination",

        label:
          destination.name,

        description:
          destination.description ||
          `eSIM cho ${destination.name}`,

        href:
          destination.href,

        keywords: [
          destination.slug,
          destination.name,
          destination.regionLabel ||
            "",
        ].filter(Boolean),

        meta:
          `Từ ${formatVnd(
            destination.priceFrom,
          )}`,
      }),
    );

  const productItems =
    products.map(
      (
        product,
      ): HeroSearchItemViewModel => ({
        id:
          `product-${product.id}`,

        type:
          "product",

        label:
          product.name,

        description:
          `${product.dataLabel} · ${product.durationLabel}`,

        href:
          product.href,

        keywords: [
          product.familyCode,
          product.slug,
          product.dataLabel,
          product.durationLabel,
        ],

        meta:
          formatVnd(
            product.price,
          ),
      }),
    );

  const guideItems =
    guides.map(
      (
        guide,
      ): HeroSearchItemViewModel => ({
        id:
          `guide-${guide.id}`,

        type:
          "guide",

        label:
          guide.title,

        description:
          guide.excerpt,

        href:
          guide.href,

        keywords: [
          guide.category ||
            "",
          guide.familyCode,
          guide.slug,
        ].filter(Boolean),

        meta:
          guide.category,
      }),
    );

  return [
    ...destinationItems,
    ...productItems,
    ...guideItems,
  ];
}
