"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAllEsimQuickFilterSelection,
  createEsimQuickFilterUrl,
} from "@/lib/storefront/catalog/esim-quick-filter";

import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";

import type { SecondaryProductViewModel } from "@/types/view-models/secondary-routes";

import { EsimChoiceGuide } from "./EsimChoiceGuide";

import { EsimInlineTypeExplorer } from "./EsimInlineTypeExplorer";

import { EsimQuickProductCatalog } from "./EsimQuickProductCatalog";
import { useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import { localizeEsimQuickFilterSelection } from "@/i18n/listing/static-destination.config";

function scrollToCatalog(): void {
  if (typeof document === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    document.getElementById("esim-quick-catalog")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

export function EsimInlineQuickCatalogExperience({
  products,
  initialSelection,
  selectionApplied = false,
}: {
  products: readonly SecondaryProductViewModel[];
  initialSelection: EsimQuickFilterSelection;
  selectionApplied?: boolean;
}) {
  const { locale } = useStorefrontLocale();
  const router = useRouter();
  const [selection, setSelection] = useState<EsimQuickFilterSelection>(() =>
    localizeEsimQuickFilterSelection(initialSelection, locale),
  );

  const select = useCallback(
    (next: EsimQuickFilterSelection) => {
      const localized = localizeEsimQuickFilterSelection(next, locale);
      setSelection(localized);

      router.push(
        localizeShellHref(createEsimQuickFilterUrl(localized), locale),
      );

      scrollToCatalog();
    },
    [locale, router],
  );

  const clearSelection = useCallback(() => {
    select(createAllEsimQuickFilterSelection());
  }, [select]);

  return (
    <>
      <EsimInlineTypeExplorer selection={selection} onSelect={select} />

      <EsimQuickProductCatalog
        products={products}
        selection={selection}
        selectionApplied={selectionApplied}
        onClearSelection={clearSelection}
      />

      <EsimChoiceGuide />
    </>
  );
}
