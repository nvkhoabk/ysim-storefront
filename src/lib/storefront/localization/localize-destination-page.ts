import { createListingTranslator } from "@/i18n/listing/listing.registry";
import {
  createLocalizedEsimDestinationExplorer,
  localizeContinentName,
  localizeDestinationName,
  localizeDurationLabel,
} from "@/i18n/listing/static-destination.config";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type {
  DestinationContinentKey,
  DestinationPageViewModel,
  DestinationRouteSelectionViewModel,
} from "@/types/view-models/destination-page";

function hrefSlug(href: string): string {
  return (
    href.split("?")[0].split("#")[0].split("/").filter(Boolean).at(-1) || ""
  );
}

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
  const localizeCard = <
    T extends
      | DestinationPageViewModel["catalog"]["items"][number]
      | DestinationPageViewModel["popularDestinations"][number],
  >(
    item: T,
  ): T => {
    const name = localizeDestinationName(item.slug, locale, item.name);
    const continentKey = "continent" in item ? item.continent : undefined;
    return {
      ...item,
      name,
      href: localizeHref(item.href),
      regionLabel: item.regionLabel
        ? localizeContinentName(continentKey || "", locale, item.regionLabel)
        : undefined,
      description: t("ordinary.destinationDescription", { name }),
      imageAlt: t("ordinary.destinationImageAlt", { name }),
      durationLabel: localizeDurationLabel(item.durationLabel, locale),
      ...("continentLabel" in item
        ? {
            continentLabel: localizeContinentName(
              item.continent,
              locale,
              item.continentLabel,
            ),
          }
        : {}),
    } as T;
  };

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
    heroSearchItems: page.heroSearchItems.map((item) => {
      const slug = hrefSlug(item.href);
      const name =
        item.type === "destination"
          ? localizeDestinationName(slug, locale, item.label)
          : item.label;
      return {
        ...item,
        href: localizeHref(item.href),
        label: name,
        description:
          item.type === "destination"
            ? t("ordinary.destinationDescription", { name })
            : item.description,
        meta: item.meta?.replace(/^Từ\s+/u, `${t("ordinary.priceFrom")} `),
      };
    }),
    popularDestinations: page.popularDestinations.map(localizeCard),
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
      items: page.catalog.items.map(localizeCard),
    },
  };
}

export function localizeDestinationRouteSelection(
  selection: DestinationRouteSelectionViewModel,
  locale: ShellLocale,
): DestinationRouteSelectionViewModel {
  const t = createListingTranslator(locale);
  const explorer = createLocalizedEsimDestinationExplorer(locale);
  let label = selection.label;
  let description = t("ordinary.selectionAllDescription");
  let query = selection.query;

  if (selection.kind === "destination" && selection.destinationSlug) {
    label = localizeDestinationName(selection.destinationSlug, locale, label);
    description = t("ordinary.selectionDestinationDescription");
    query = label;
  } else if (selection.kind === "global") {
    label = localizeDestinationName("global", locale, label);
    description = t("ordinary.selectionGlobalDescription");
  } else if (selection.kind === "region") {
    const regionId = selection.key.replace(/^region:/u, "");
    label =
      explorer.regions.find((region) => region.id === regionId)?.label ?? label;
    description = t("ordinary.selectionRegionDescription");
    query = selection.continent === "all" ? label : undefined;
  } else if (selection.kind === "continent" && selection.continent) {
    label = localizeContinentName(selection.continent, locale, label);
    description = t("ordinary.selectionContinentDescription");
  }

  return { ...selection, label, description, query };
}
