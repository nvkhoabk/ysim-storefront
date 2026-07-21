import type {
  DestinationPresentationConfig,
} from "@/types/view-models/destination";

export const destinationPresentation:
  Readonly<
    Record<
      string,
      DestinationPresentationConfig
    >
  > = {
    japan: {
      slug:
        "japan",
      imageUrl:
        "/ui-preview/destinations/japan.svg",
      imageAlt:
        "Minh họa điểm đến Nhật Bản",
      flagUrl:
        "/ui-preview/flags/jp.svg",
      featured:
        true,
      order:
        10,
      badge: {
        label:
          "Phổ biến",
        icon:
          "popular",
      },
    },

    korea: {
      slug:
        "korea",
      imageUrl:
        "/ui-preview/destinations/korea.svg",
      imageAlt:
        "Minh họa điểm đến Hàn Quốc",
      flagUrl:
        "/ui-preview/flags/kr.svg",
      featured:
        true,
      order:
        20,
    },

    thailand: {
      slug:
        "thailand",
      imageUrl:
        "/ui-preview/destinations/thailand.svg",
      imageAlt:
        "Minh họa điểm đến Thái Lan",
      flagUrl:
        "/ui-preview/flags/th.svg",
      featured:
        true,
      order:
        30,
      badge: {
        label:
          "Giá tốt",
        icon:
          "sparkles",
      },
    },

    singapore: {
      slug:
        "singapore",
      imageUrl:
        "/ui-preview/destinations/singapore.svg",
      imageAlt:
        "Minh họa điểm đến Singapore",
      flagUrl:
        "/ui-preview/flags/sg.svg",
      featured:
        true,
      order:
        40,
    },

    usa: {
      slug:
        "usa",
      imageUrl:
        "/ui-preview/destinations/usa.svg",
      imageAlt:
        "Minh họa điểm đến Hoa Kỳ",
      flagUrl:
        "/ui-preview/flags/us.svg",
      featured:
        false,
      order:
        50,
    },

    europe: {
      slug:
        "europe",
      imageUrl:
        "/ui-preview/destinations/europe.svg",
      imageAlt:
        "Minh họa điểm đến Châu Âu",
      flagUrl:
        "/ui-preview/flags/eu.svg",
      featured:
        true,
      order:
        60,
      badge: {
        label:
          "Nhiều quốc gia",
        icon:
          "global",
      },
    },
  };

export const popularDestinationSlugs =
  Object.values(
    destinationPresentation,
  )
    .filter(
      (destination) =>
        destination.featured,
    )
    .sort(
      (left, right) =>
        (left.order || 0) -
        (right.order || 0),
    )
    .map(
      (destination) =>
        destination.slug,
    );
