import type {
  HeroSearchItemViewModel,
  HeroViewModel,
} from "@/types/view-models/hero";

export const homeHero:
  HeroViewModel = {
    eyebrow:
      "Kết nối toàn cầu với YSim",

    title:
      "Chọn điểm đến và mua eSIM",

    highlightedText:
      "trong vài phút.",

    description:
      "Kết nối Internet nhanh chóng tại hơn 200 quốc gia và vùng lãnh thổ, không cần đổi SIM vật lý.",

    primaryAction: {
      label:
        "Chọn gói",
      href:
        "/destinations",
      variant:
        "primary",
    },

    secondaryAction: {
      label:
        "Cách hoạt động",
      href:
        "/guides",
      variant:
        "outline",
    },

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
          "Kết nối an toàn",
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
	  imageUrl: "/assets/heroes/home-hero.png",
      eyebrow:
        "Travel connected",
      alt:
        "Minh họa du lịch và kết nối eSIM",
    },

    variant:
      "brand",

    alignment:
      "left",
  };

export const heroSearchPreviewItems:
  readonly HeroSearchItemViewModel[] = [
    {
      id:
        "destination-japan",
      type:
        "destination",
      label:
        "Nhật Bản",
      description:
        "eSIM cho Nhật Bản",
      href:
        "/destinations#japan",
      keywords: [
        "japan",
        "nhat ban",
        "tokyo",
        "osaka",
      ],
      meta:
        "Từ 169.000 đ",
    },
    {
      id:
        "destination-korea",
      type:
        "destination",
      label:
        "Hàn Quốc",
      description:
        "eSIM cho Hàn Quốc",
      href:
        "/destinations#korea",
      keywords: [
        "korea",
        "han quoc",
        "seoul",
      ],
      meta:
        "Từ 149.000 đ",
    },
    {
      id:
        "destination-thailand",
      type:
        "destination",
      label:
        "Thái Lan",
      description:
        "eSIM cho Thái Lan",
      href:
        "/destinations#thailand",
      keywords: [
        "thai lan",
        "thailand",
        "bangkok",
      ],
      meta:
        "Từ 99.000 đ",
    },
    {
      id:
        "product-japan-5gb",
      type:
        "product",
      label:
        "eSIM Nhật Bản 5GB/ngày",
      description:
        "Gói data tốc độ cao cho chuyến đi Nhật Bản",
      href:
        "/esim",
      keywords: [
        "5gb",
        "japan",
        "nhat ban",
        "data",
      ],
      meta:
        "7–30 ngày",
    },
    {
      id:
        "product-global",
      type:
        "product",
      label:
        "eSIM Toàn cầu",
      description:
        "Một eSIM cho nhiều quốc gia",
      href:
        "/esim",
      keywords: [
        "global",
        "toan cau",
        "multi country",
      ],
      meta:
        "Nhiều khu vực",
    },
    {
      id:
        "guide-install",
      type:
        "guide",
      label:
        "Nên cài eSIM trước hay sau khi đến nơi?",
      description:
        "Hướng dẫn chuẩn bị eSIM trước chuyến đi",
      href:
        "/guides/nen-cai-esim-truoc-hay-sau-khi-den-noi",
      keywords: [
        "cai esim",
        "huong dan",
        "install",
      ],
    },
    {
      id:
        "guide-device",
      type:
        "guide",
      label:
        "Cách kiểm tra điện thoại hỗ trợ eSIM",
      description:
        "Kiểm tra nhanh trước khi mua",
      href:
        "/guides/cach-kiem-tra-dien-thoai-co-ho-tro-esim",
      keywords: [
        "kiem tra",
        "dien thoai",
        "device",
        "compatible",
      ],
    },
  ];
