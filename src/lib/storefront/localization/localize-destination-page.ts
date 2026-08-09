import { createListingTranslator } from "@/i18n/listing/listing.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type {
  DestinationContinentKey,
  DestinationPageViewModel,
} from "@/types/view-models/destination-page";

function categoryLabel(key: DestinationContinentKey, locale: ShellLocale) {
  const t = createListingTranslator(locale);
  const labels = {
    all: t("common.all"),
    asia: t("filters.regionAsia"),
    europe: t("filters.regionEurope"),
    "north-america": t("ordinary.categoryNorthAmerica"),
    "south-america": t("ordinary.categorySouthAmerica"),
    africa: t("ordinary.categoryAfrica"),
    oceania: t("ordinary.categoryOceania"),
    global: t("filters.regionGlobal"),
  } as const;
  return labels[key];
}

export function localizeDestinationPageViewModel(
  page: DestinationPageViewModel,
  locale: ShellLocale,
): DestinationPageViewModel {
  const t = createListingTranslator(locale);
  const localizeHref = (href: string) =>
    href.startsWith("/") ? localizeShellHref(href, locale) : href;

  return {
    ...page,
    hero: {
      ...page.hero,
      eyebrow: t("destinations.eyebrow"),
      title: t("destinations.title"),
      highlightedText: undefined,
      description: t("destinations.description"),
      benefits: undefined,
      media: page.hero.media
        ? { ...page.hero.media, alt: t("destinations.description") }
        : undefined,
    },
    heroSearchItems: page.heroSearchItems.map((item) => ({
      ...item,
      href: localizeHref(item.href),
    })),
    popularDestinations: page.popularDestinations.map((item) => ({
      ...item,
      href: localizeHref(item.href),
    })),
    popularSection: {
      eyebrow: t("destinations.eyebrow"),
      title: t("destinations.title"),
      description: t("destinations.description"),
      actionLabel: t("ordinary.viewAll"),
      actionHref: "#destination-catalog",
    },
    catalog: {
      ...page.catalog,
      eyebrow: t("destinations.eyebrow"),
      title: t("destinations.title"),
      description: t("destinations.description"),
      categories: page.catalog.categories.map((item) => ({
        ...item,
        label: categoryLabel(item.key, locale),
      })),
      items: page.catalog.items.map((item) => ({
        ...item,
        continentLabel: categoryLabel(item.continent, locale),
        href: localizeHref(item.href),
      })),
    },
  };
}
