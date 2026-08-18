export type StorefrontSearchLocale = "vi" | "en" | "lo";

export type StorefrontSuggestionType = "destination" | "product" | "guide";

export interface StorefrontSuggestionItem {
  id: string;
  canonicalKey: string;
  type: StorefrontSuggestionType;
  label: string;
  href: string;
  description?: string;
  meta?: string;
  localizedTerms: Readonly<
    Partial<Record<StorefrontSearchLocale, readonly string[]>>
  >;
  aliases?: Readonly<
    Partial<Record<StorefrontSearchLocale, readonly string[]>>
  >;
  keywords?: readonly string[];
  priority: Readonly<Partial<Record<StorefrontSearchLocale, number>>>;
  countryCode?: string;
  flagUrl?: string;
}

export interface RankStorefrontSuggestionsOptions {
  minResults?: number;
  maxResults?: number;
}

export function normalizeStorefrontSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/đ/giu, "d")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function uniqueStrings(
  values: readonly (string | undefined)[],
): readonly string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim()))),
  );
}

function itemPriority(
  item: StorefrontSuggestionItem,
  locale: StorefrontSearchLocale,
): number {
  return item.priority[locale] ?? 10_000;
}

function matchRank(
  item: StorefrontSuggestionItem,
  locale: StorefrontSearchLocale,
  normalizedQuery: string,
): number | undefined {
  const localeTerms = uniqueStrings([
    item.label,
    ...(item.localizedTerms[locale] ?? []),
  ]).map(normalizeStorefrontSearchText);

  if (localeTerms.some((term) => term === normalizedQuery)) return 0;

  if (
    localeTerms.some(
      (term) =>
        term.startsWith(normalizedQuery) ||
        term.split(" ").some((word) => word.startsWith(normalizedQuery)),
    )
  ) {
    return 1;
  }

  const allTerms = uniqueStrings([
    ...Object.values(item.localizedTerms).flatMap((terms) => terms ?? []),
    ...Object.values(item.aliases ?? {}).flatMap((terms) => terms ?? []),
    ...(item.keywords ?? []),
    item.description,
    item.meta,
  ]).map(normalizeStorefrontSearchText);

  if (allTerms.some((term) => term === normalizedQuery)) return 2;

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (
    allTerms.some((term) => queryTokens.every((token) => term.includes(token)))
  ) {
    return 3;
  }

  return undefined;
}

function deduplicateSuggestions(
  items: readonly StorefrontSuggestionItem[],
): readonly StorefrontSuggestionItem[] {
  const unique = new Map<string, StorefrontSuggestionItem>();
  for (const item of items) {
    if (!unique.has(item.canonicalKey)) unique.set(item.canonicalKey, item);
  }
  return [...unique.values()];
}

export function rankStorefrontSuggestions(
  items: readonly StorefrontSuggestionItem[],
  locale: StorefrontSearchLocale,
  query: string,
  { minResults = 5, maxResults = 10 }: RankStorefrontSuggestionsOptions = {},
): readonly StorefrontSuggestionItem[] {
  const upperLimit = Math.max(1, Math.min(10, maxResults));
  const targetMinimum = Math.min(Math.max(1, minResults), upperLimit);
  const uniqueItems = deduplicateSuggestions(items);
  const priorityItems = [...uniqueItems].sort(
    (left, right) =>
      itemPriority(left, locale) - itemPriority(right, locale) ||
      left.label.localeCompare(right.label, locale),
  );
  const normalizedQuery = normalizeStorefrontSearchText(query);

  if (!normalizedQuery) return priorityItems.slice(0, upperLimit);

  const ranked = uniqueItems
    .map((item) => ({ item, rank: matchRank(item, locale, normalizedQuery) }))
    .filter(
      (entry): entry is { item: StorefrontSuggestionItem; rank: number } =>
        entry.rank !== undefined,
    )
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        itemPriority(left.item, locale) - itemPriority(right.item, locale) ||
        left.item.label.localeCompare(right.item.label, locale),
    )
    .map((entry) => entry.item);

  const result = ranked.slice(0, upperLimit);
  if (result.length >= targetMinimum) return result;

  const included = new Set(result.map((item) => item.canonicalKey));
  for (const item of priorityItems) {
    if (included.has(item.canonicalKey)) continue;
    result.push(item);
    included.add(item.canonicalKey);
    if (result.length >= targetMinimum || result.length >= upperLimit) break;
  }

  return result;
}
