import {
  destinationSearchDefinition,
  destinationSearchDefinitions,
  resolveDestinationSearchDefinition,
} from "@/config/storefront-search";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { ShellLocale } from "@/i18n/shell/shell.types";
import type { HeroSearchItemViewModel } from "@/types/view-models/hero";
import type { SecondaryProductViewModel } from "@/types/view-models/secondary-routes";
import type { StorefrontSuggestionItem } from "#storefront-search-core";
import { normalizeStorefrontSearchText } from "#storefront-search-core";

export {
  normalizeStorefrontSearchText,
  rankStorefrontSuggestions,
} from "#storefront-search-core";
export type {
  RankStorefrontSuggestionsOptions,
  StorefrontSearchLocale,
  StorefrontSuggestionItem,
  StorefrontSuggestionType,
} from "#storefront-search-core";

function uniqueStrings(
  values: readonly (string | undefined)[],
): readonly string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim()))),
  );
}

function hrefSlug(href: string): string {
  const cleanHref = href.split("#")[0] ?? href;
  const [pathname, query = ""] = cleanHref.split("?");
  const destination = new URLSearchParams(query).get("destination");
  return (
    destination ||
    pathname?.split("/").filter(Boolean).at(-1) ||
    ""
  ).toLowerCase();
}

function staticDestinationSuggestions(
  locale: ShellLocale,
): readonly StorefrontSuggestionItem[] {
  return destinationSearchDefinitions.map((definition) => ({
    id: `destination-${definition.canonicalSlug}`,
    canonicalKey: `destination:${definition.canonicalSlug}`,
    type: "destination",
    label: definition.names[locale],
    href: localizeShellHref(
      `/esim?destination=${encodeURIComponent(definition.routeSlug)}`,
      locale,
    ),
    localizedTerms: {
      vi: [definition.names.vi],
      en: [definition.names.en],
      lo: [definition.names.lo],
    },
    aliases: definition.aliases,
    keywords: [
      definition.routeSlug,
      definition.canonicalSlug,
      definition.countryCode ?? "",
      ...Object.values(definition.keywords).flatMap((terms) => terms ?? []),
    ],
    priority: definition.priority,
    countryCode: definition.countryCode,
    flagUrl: definition.flagUrl,
  }));
}

export function createHeroStorefrontSuggestions(
  items: readonly HeroSearchItemViewModel[],
  locale: ShellLocale,
): readonly StorefrontSuggestionItem[] {
  const staticDestinations = staticDestinationSuggestions(locale);
  const staticByCanonical = new Map(
    staticDestinations.map((item) => [item.canonicalKey, item]),
  );
  const dynamicItems: StorefrontSuggestionItem[] = [];

  for (const item of items) {
    const slug = hrefSlug(item.href);
    const definition =
      item.type === "destination"
        ? destinationSearchDefinition(slug)
        : undefined;
    const canonicalId = item.canonicalId?.trim() || slug || item.id;
    const normalizedCanonicalId = normalizeStorefrontSearchText(
      definition?.canonicalSlug ?? canonicalId,
    ).replace(/\s+/gu, "-");
    const canonicalKey = `${item.type}:${normalizedCanonicalId}`;
    const staticItem = staticByCanonical.get(canonicalKey);
    const productDefinition =
      item.type === "product"
        ? resolveDestinationSearchDefinition([
            item.canonicalId,
            item.label,
            ...(item.keywords ?? []),
          ])
        : undefined;

    if (staticItem) {
      staticByCanonical.set(canonicalKey, {
        ...staticItem,
        href: item.href,
        description: item.description,
        meta: item.meta,
        keywords: uniqueStrings([
          ...(staticItem.keywords ?? []),
          ...(item.keywords ?? []),
        ]),
      });
      continue;
    }

    dynamicItems.push({
      id: item.id,
      canonicalKey,
      type: item.type,
      label: item.label,
      href: item.href,
      description: item.description,
      meta: item.meta,
      localizedTerms: productDefinition
        ? {
            vi: [productDefinition.names.vi, item.label],
            en: [productDefinition.names.en, item.label],
            lo: [productDefinition.names.lo, item.label],
          }
        : { [locale]: [item.label] },
      aliases: productDefinition?.aliases,
      keywords: uniqueStrings([
        ...(item.keywords ?? []),
        ...(productDefinition
          ? Object.values(productDefinition.keywords).flatMap(
              (terms) => terms ?? [],
            )
          : []),
      ]),
      priority: { [locale]: item.type === "product" ? 500 : 800 },
    });
  }

  return [...staticByCanonical.values(), ...dynamicItems];
}

export function createProductStorefrontSuggestions(
  products: readonly SecondaryProductViewModel[],
  locale: ShellLocale,
): readonly StorefrontSuggestionItem[] {
  return products.map((product, index) => {
    const definition = resolveDestinationSearchDefinition([
      product.slug,
      product.name,
      product.destination,
      ...(product.filterTerms ?? []),
    ]);
    return {
      id: `product-${product.id}`,
      canonicalKey: `product:${normalizeStorefrontSearchText(product.slug).replace(/\s+/gu, "-")}`,
      type: "product",
      label: product.name,
      href: localizeShellHref(product.href, locale),
      description: product.destination,
      localizedTerms: definition
        ? {
            vi: [definition.names.vi, product.name],
            en: [definition.names.en, product.name],
            lo: [definition.names.lo, product.name],
          }
        : { [locale]: [product.name] },
      aliases: definition?.aliases,
      keywords: uniqueStrings([
        product.slug,
        product.destination,
        ...(product.filterTerms ?? []),
        ...(definition
          ? Object.values(definition.keywords).flatMap((terms) => terms ?? [])
          : []),
      ]),
      priority: { [locale]: index },
    } satisfies StorefrontSuggestionItem;
  });
}
