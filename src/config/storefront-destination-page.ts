import type {
  HeroViewModel,
} from "@/types/view-models/hero";

import type {
  DestinationCatalogFilterState,
  DestinationCategoryOptionViewModel,
} from "@/types/view-models/destination-page";

export const destinationPageHero:
  HeroViewModel = {
    eyebrow:
      "eSIM quốc tế",

    title:
      "Kết nối tại mọi điểm đến",

    highlightedText:
      "chỉ trong vài phút.",

    description:
      "Chọn quốc gia hoặc khu vực, so sánh các gói data và mua eSIM trước chuyến đi.",

    benefits: [
      {
        label:
          "Hơn 200 quốc gia",
        icon:
          "global",
      },
      {
        label:
          "Kích hoạt tức thì",
        icon:
          "instant",
      },
      {
        label:
          "Thanh toán an toàn",
        icon:
          "secure",
      },
      {
        label:
          "Hỗ trợ 24/7",
        icon:
          "support",
      },
    ],

    media: {
      eyebrow:
        "Choose your destination",
      alt:
        "Minh họa chọn điểm đến và kết nối eSIM",
    },

    variant:
      "brand",

    alignment:
      "left",
  };

export const destinationCategoryOptions:
  readonly DestinationCategoryOptionViewModel[] = [
    {
      key:
        "all",
      label:
        "Tất cả",
    },
    {
      key:
        "asia",
      label:
        "Châu Á",
    },
    {
      key:
        "europe",
      label:
        "Châu Âu",
    },
    {
      key:
        "north-america",
      label:
        "Bắc Mỹ",
    },
    {
      key:
        "south-america",
      label:
        "Nam Mỹ",
    },
    {
      key:
        "africa",
      label:
        "Châu Phi",
    },
    {
      key:
        "oceania",
      label:
        "Châu Đại Dương",
    },
    {
      key:
        "global",
      label:
        "Đa quốc gia",
    },
  ];

export const initialDestinationFilters:
  DestinationCatalogFilterState = {
    query:
      "",
    continent:
      "all",
    duration:
      "all",
    data:
      "all",
    sort:
      "popular",
  };

export const destinationPopularSection = {
  eyebrow:
    "Điểm đến phổ biến",

  title:
    "Lựa chọn được yêu thích",

  description:
    "Các điểm đến được khách hàng YSim lựa chọn nhiều nhất.",

  actionLabel:
    "Xem tất cả",

  actionHref:
    "#destination-catalog",
} as const;

export const destinationCatalogSection = {
  eyebrow:
    "Tất cả điểm đến",

  title:
    "Tìm eSIM cho hành trình của bạn",

  description:
    "Lọc theo khu vực, thời gian sử dụng và loại dung lượng.",
} as const;
