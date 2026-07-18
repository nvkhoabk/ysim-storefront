import type {
  DestinationProductHeroContent,
  DestinationProductSortOption,
} from "@/components/destination-products/types";

export const japanDestinationProductHeroContent: DestinationProductHeroContent =
  {
    destinationName: "Nhật Bản",
    destinationSlug: "japan",
    countryCode: "JP",
    continentLabel: "Châu Á",
    description:
      "Khám phá các gói eSIM Nhật Bản với nhiều lựa chọn dung lượng và thời hạn, phù hợp cho chuyến công tác, du lịch ngắn ngày hoặc hành trình dài.",
    packageCount: 12,
    startingPrice: 69000,
    currency: "VND",
    imageSrc:
      "/images/destination-products/japan-hero.webp",
    imageAlt:
      "Cảnh quan Nhật Bản với núi Phú Sĩ và kiến trúc truyền thống",
    badge: "Điểm đến phổ biến",
  };

export const destinationProductSortOptions: DestinationProductSortOption[] =
  [
    {
      value: "popular",
      label: "Phổ biến nhất",
    },
    {
      value: "price-asc",
      label: "Giá thấp đến cao",
    },
    {
      value: "price-desc",
      label: "Giá cao đến thấp",
    },
    {
      value: "duration-asc",
      label: "Thời hạn ngắn nhất",
    },
    {
      value: "data-desc",
      label: "Dung lượng cao nhất",
    },
  ];