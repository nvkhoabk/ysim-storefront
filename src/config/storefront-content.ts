import type {
  HeroViewModel,
} from "@/types/view-models/hero";

import type {
  ContentCategoryViewModel,
  ContentLocale,
} from "@/types/view-models/content";

export const contentLocaleFallbacks:
  Readonly<
    Record<
      ContentLocale,
      readonly ContentLocale[]
    >
  > = {
    vi: ["vi"],
    en: ["en", "vi"],
    ja: ["ja", "en", "vi"],
    ko: ["ko", "en", "vi"],
  };

export const guideLandingHero:
  HeroViewModel = {
    eyebrow: "Cẩm nang YSim",
    title: "Hiểu eSIM trước khi",
    highlightedText: "bắt đầu hành trình.",
    description:
      "Hướng dẫn cài đặt, kiểm tra thiết bị và sử dụng eSIM đơn giản, dễ hiểu.",
    benefits: [
      {
        label: "Hướng dẫn từng bước",
        icon: "instant",
      },
      {
        label: "Kiểm tra thiết bị",
        icon: "secure",
      },
      {
        label: "Nội dung đa ngôn ngữ",
        icon: "global",
      },
      {
        label: "Hỗ trợ 24/7",
        icon: "support",
      },
    ],
    media: {
      eyebrow: "Travel knowledge",
      alt: "Minh họa cẩm nang và hướng dẫn eSIM",
    },
    variant: "brand",
    alignment: "left",
  };

export const guideCategories:
  readonly ContentCategoryViewModel[] = [
    {
      id: "all",
      label: "Tất cả",
      href: "/guides",
    },
    {
      id: "installation",
      label: "Cài đặt eSIM",
      href: "/guides?category=installation",
    },
    {
      id: "device",
      label: "Kiểm tra thiết bị",
      href: "/guides?category=device",
    },
    {
      id: "usage",
      label: "Cách sử dụng",
      href: "/guides?category=usage",
    },
    {
      id: "faq",
      label: "Câu hỏi thường gặp",
      href: "/guides?category=faq",
    },
  ];
