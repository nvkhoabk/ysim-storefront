import type {
  DestinationCardViewModel,
  DestinationCategorySource,
  DestinationCommerceSummary,
  DestinationPresentationConfig,
} from "@/types/view-models/destination";

function formatDurationLabel(
  minDays?: number,
  maxDays?: number,
): string | undefined {
  if (
    minDays === undefined &&
    maxDays === undefined
  ) {
    return undefined;
  }

  if (
    minDays !== undefined &&
    maxDays !== undefined
  ) {
    if (
      minDays === maxDays
    ) {
      return `${minDays} ngày`;
    }

    return `${minDays}–${maxDays} ngày`;
  }

  if (
    minDays !== undefined
  ) {
    return `Từ ${minDays} ngày`;
  }

  return `Đến ${maxDays} ngày`;
}

export function createDestinationCardViewModel(
  category: DestinationCategorySource,
  commerce: DestinationCommerceSummary,
  presentation: DestinationPresentationConfig,
): DestinationCardViewModel {
  if (
    category.slug !==
    commerce.destinationSlug
  ) {
    throw new Error(
      `Destination commerce mismatch: ${category.slug} != ${commerce.destinationSlug}`,
    );
  }

  if (
    category.slug !==
    presentation.slug
  ) {
    throw new Error(
      `Destination presentation mismatch: ${category.slug} != ${presentation.slug}`,
    );
  }

  return {
    id:
      category.id,

    slug:
      category.slug,

    name:
      category.name,

    href:
      `/destinations/${category.slug}`,

    regionLabel:
      category.parentName,

    description:
      category.description,

    imageUrl:
      presentation.imageUrl,

    imageAlt:
      presentation.imageAlt,

    flagUrl:
      presentation.flagUrl,

    durationLabel:
      formatDurationLabel(
        commerce.minDurationDays,
        commerce.maxDurationDays,
      ),

    priceFrom:
      commerce.minPurchasablePrice,

    productCount:
      commerce.purchasableProductCount ??
      category.productCount,

    badge:
      presentation.badge,
  };
}
