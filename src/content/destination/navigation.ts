import type {
  DestinationContinent,
  DestinationHeroContent,
} from "@/components/destination/types";

export const destinationHeroContent: DestinationHeroContent = {
  title: "Điểm đến",
  highlightedTitle: "eSIM",
  description:
    "Kết nối internet tại hơn 200 quốc gia và vùng lãnh thổ.",
  searchPlaceholder:
    "Tìm quốc gia, thành phố hoặc khu vực",
};

export const destinationContinents: DestinationContinent[] = [
  {
    key: "all",
    label: "Tất cả",
    shortLabel: "Tất cả",
  },
  {
    key: "asia",
    label: "Châu Á",
    shortLabel: "Châu Á",
    slug: "asia",
  },
  {
    key: "europe",
    label: "Châu Âu",
    shortLabel: "Châu Âu",
    slug: "europe",
  },
  {
    key: "north-america",
    label: "Bắc Mỹ",
    shortLabel: "Bắc Mỹ",
    slug: "north-america",
  },
  {
    key: "south-america",
    label: "Nam Mỹ",
    shortLabel: "Nam Mỹ",
    slug: "south-america",
  },
  {
    key: "africa",
    label: "Châu Phi",
    shortLabel: "Châu Phi",
    slug: "africa",
  },
  {
    key: "oceania",
    label: "Châu Đại Dương",
    shortLabel: "Đại Dương",
    slug: "oceania",
  },
];