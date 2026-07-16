export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  region: string;
  flag: string;
  image: string;
  priceFrom: number;
  currency: "VND";
  featured?: boolean;
}

export const popularDestinations: DestinationItem[] = [
  {
    id: "jp",
    name: "Nhật Bản",
    slug: "japan",
    region: "Châu Á",
    flag: "🇯🇵",
    image: "/images/destinations/japan.jpg",
    priceFrom: 69000,
    currency: "VND",
    featured: true,
  },
  {
    id: "kr",
    name: "Hàn Quốc",
    slug: "south-korea",
    region: "Châu Á",
    flag: "🇰🇷",
    image: "/images/destinations/korea.jpg",
    priceFrom: 69000,
    currency: "VND",
    featured: true,
  },
  {
    id: "th",
    name: "Thái Lan",
    slug: "thailand",
    region: "Châu Á",
    flag: "🇹🇭",
    image: "/images/destinations/thailand.jpg",
    priceFrom: 59000,
    currency: "VND",
  },
  {
    id: "sg",
    name: "Singapore",
    slug: "singapore",
    region: "Châu Á",
    flag: "🇸🇬",
    image: "/images/destinations/singapore.jpg",
    priceFrom: 49000,
    currency: "VND",
  },
  {
    id: "cn",
    name: "Trung Quốc",
    slug: "china",
    region: "Châu Á",
    flag: "🇨🇳",
    image: "/images/destinations/china.jpg",
    priceFrom: 69000,
    currency: "VND",
  },
  {
    id: "us",
    name: "Hoa Kỳ",
    slug: "united-states",
    region: "Bắc Mỹ",
    flag: "🇺🇸",
    image: "/images/destinations/usa.jpg",
    priceFrom: 159000,
    currency: "VND",
  },
  {
    id: "eu",
    name: "Châu Âu",
    slug: "europe",
    region: "Châu Âu",
    flag: "🇪🇺",
    image: "/images/destinations/europe.jpg",
    priceFrom: 199000,
    currency: "VND",
  },
  {
    id: "global",
    name: "Toàn cầu",
    slug: "global",
    region: "Toàn cầu",
    flag: "🌐",
    image: "/images/destinations/global.jpg",
    priceFrom: 299000,
    currency: "VND",
  },
];