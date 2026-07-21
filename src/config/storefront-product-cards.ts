import type {
  ProductCardPresentationConfig,
} from "@/types/view-models/product-card";

const defaultDataAttributeKeys = [
  "dung-luong",
  "dung lượng",
  "data",
  "data-amount",
  "data_amount",
] as const;

const defaultDurationAttributeKeys = [
  "so-ngay",
  "số ngày",
  "duration",
  "duration-days",
  "duration_days",
] as const;

export const productCardPresentation:
  Readonly<
    Record<
      string,
      ProductCardPresentationConfig
    >
  > = {
    "GIGA-JP": {
      familyCode:
        "GIGA-JP",
      order:
        10,
      featured:
        true,
      badge: {
        label:
          "Phổ biến",
        icon:
          "popular",
      },
      dataAttributeKeys:
        defaultDataAttributeKeys,
      durationAttributeKeys:
        defaultDurationAttributeKeys,
    },

    "GIGA-KR": {
      familyCode:
        "GIGA-KR",
      order:
        20,
      featured:
        true,
      dataAttributeKeys:
        defaultDataAttributeKeys,
      durationAttributeKeys:
        defaultDurationAttributeKeys,
    },

    "GIGA-TH": {
      familyCode:
        "GIGA-TH",
      order:
        30,
      featured:
        true,
      badge: {
        label:
          "Giá tốt",
        icon:
          "featured",
      },
      dataAttributeKeys:
        defaultDataAttributeKeys,
      durationAttributeKeys:
        defaultDurationAttributeKeys,
    },

    "GIGA-GLB": {
      familyCode:
        "GIGA-GLB",
      order:
        40,
      featured:
        true,
      badge: {
        label:
          "Đa quốc gia",
        icon:
          "featured",
      },
      dataAttributeKeys:
        defaultDataAttributeKeys,
      durationAttributeKeys:
        defaultDurationAttributeKeys,
    },
  };

export const featuredProductFamilyCodes =
  Object.values(
    productCardPresentation,
  )
    .filter(
      (product) =>
        product.featured,
    )
    .sort(
      (left, right) =>
        (left.order || 0) -
        (right.order || 0),
    )
    .map(
      (product) =>
        product.familyCode,
    );
