import {
  contentLocaleFallbacks,
} from "@/config/storefront-content";

import type {
  ContentLocale,
  WordPressContentSource,
} from "@/types/view-models/content";

export interface LocalizedContentResolution {
  content:
    WordPressContentSource | null;
  requestedLocale:
    ContentLocale;
  resolvedLocale:
    ContentLocale | null;
  usedFallback:
    boolean;
}

export function resolveLocalizedContent(
  items:
    readonly WordPressContentSource[],
  familyCode: string,
  requestedLocale:
    ContentLocale,
): LocalizedContentResolution {
  const familyItems =
    items.filter(
      (item) =>
        item.contentFamilyCode ===
        familyCode,
    );

  const fallbackChain =
    contentLocaleFallbacks[
      requestedLocale
    ];

  for (
    const locale
    of fallbackChain
  ) {
    const content =
      familyItems.find(
        (item) =>
          item.locale ===
          locale,
      );

    if (content) {
      return {
        content,
        requestedLocale,
        resolvedLocale:
          locale,
        usedFallback:
          locale !==
          requestedLocale,
      };
    }
  }

  return {
    content:
      null,
    requestedLocale,
    resolvedLocale:
      null,
    usedFallback:
      false,
  };
}
