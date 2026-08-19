import type { DestinationPresentationConfig } from "@/types/view-models/destination";

export const destinationPresentation: Readonly<
  Record<string, DestinationPresentationConfig>
> = {
  japan: {
    slug: "japan",
    imageUrl: "/assets/destinations/japan.jpg",
    imageAlt: "Minh họa điểm đến Nhật Bản",
    flagUrl: "/assets/storefront/flags/jp.svg",
    featured: true,
    order: 10,
    badge: {
      label: "Phổ biến",
      icon: "popular",
    },
  },

  korea: {
    slug: "korea",
    imageUrl: "/assets/destinations/korea.jpg",
    imageAlt: "Minh họa điểm đến Hàn Quốc",
    flagUrl: "/assets/storefront/flags/kr.svg",
    featured: true,
    order: 20,
  },

  thailand: {
    slug: "thailand",
    imageUrl: "/assets/destinations/thailand.jpg",
    imageAlt: "Minh họa điểm đến Thái Lan",
    flagUrl: "/assets/storefront/flags/th.svg",
    featured: true,
    order: 30,
    badge: {
      label: "Giá tốt",
      icon: "sparkles",
    },
  },

  singapore: {
    slug: "singapore",
    imageUrl: "/assets/destinations/singapore.jpg",
    imageAlt: "Minh họa điểm đến Singapore",
    flagUrl: "/assets/storefront/flags/sg.svg",
    featured: true,
    order: 40,
  },

  usa: {
    slug: "usa",
    imageUrl: "/assets/destinations/usa.jpg",
    imageAlt: "Minh họa điểm đến Hoa Kỳ",
    flagUrl: "/assets/storefront/flags/us.svg",
    featured: false,
    order: 50,
  },

  europe: {
    slug: "europe",
    imageUrl: "/assets/destinations/europe.jpg",
    imageAlt: "Minh họa điểm đến Châu Âu",
    flagUrl: "/assets/storefront/flags/eu.svg",
    featured: true,
    order: 60,
    badge: {
      label: "Nhiều quốc gia",
      icon: "global",
    },
  },
};

export const popularDestinationSlugs = Object.values(destinationPresentation)
  .filter((destination) => destination.featured)
  .sort((left, right) => (left.order || 0) - (right.order || 0))
  .map((destination) => destination.slug);
