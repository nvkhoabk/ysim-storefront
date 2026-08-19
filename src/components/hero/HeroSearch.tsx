"use client";

import { useMemo, useState } from "react";

import { StorefrontSearchCombobox } from "@/components/search";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createShellTranslator } from "@/i18n/shell/shell.registry";
import { createHeroStorefrontSuggestions } from "@/lib/storefront/search/storefront-search";
import { cn } from "@/lib/ui/cn";
import type {
  HeroSearchItemType,
  HeroSearchItemViewModel,
} from "@/types/view-models/hero";

export interface HeroSearchProps {
  items: readonly HeroSearchItemViewModel[];
  placeholder?: string;
  label?: string;
  className?: string;
  maxResults?: number;
}

export function HeroSearch({
  items,
  placeholder,
  label,
  className,
  maxResults = 10,
}: HeroSearchProps) {
  const { locale } = useStorefrontLocale();
  const t = createShellTranslator(locale);
  const [query, setQuery] = useState("");
  const suggestions = useMemo(
    () => createHeroStorefrontSuggestions(items, locale),
    [items, locale],
  );
  const typeLabels: Record<HeroSearchItemType, string> = {
    destination: t("search.destination"),
    product: t("search.product"),
    guide: t("search.guide"),
  };

  return (
    <StorefrontSearchCombobox
      items={suggestions}
      locale={locale}
      value={query}
      onChange={setQuery}
      label={label || t("search.label")}
      placeholder={placeholder || t("search.placeholder")}
      resultsLabel={t("search.results")}
      typeLabels={typeLabels}
      flagLabel={(name) => t("search.flagLabel", { name })}
      minResults={5}
      maxResults={Math.min(10, Math.max(5, maxResults))}
      className={cn(className)}
    />
  );
}
