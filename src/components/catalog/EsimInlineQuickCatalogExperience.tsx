"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  createAllEsimQuickFilterSelection,
  createEsimQuickFilterUrl,
} from "@/lib/storefront/catalog/esim-quick-filter";

import type {
  EsimQuickFilterSelection,
} from "@/types/view-models/esim-quick-filter";

import type {
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

import {
  EsimChoiceGuide,
} from "./EsimChoiceGuide";

import {
  EsimInlineTypeExplorer,
} from "./EsimInlineTypeExplorer";

import {
  EsimQuickProductCatalog,
} from "./EsimQuickProductCatalog";

function updateBrowserUrl(
  selection:
    EsimQuickFilterSelection,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.history
    .replaceState(
      window.history.state,
      "",
      createEsimQuickFilterUrl(
        selection,
      ),
    );
}

function scrollToCatalog():
void {
  if (
    typeof document ===
    "undefined"
  ) {
    return;
  }

  window.requestAnimationFrame(
    () => {
      document
        .getElementById(
          "esim-quick-catalog",
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start",
        });
    },
  );
}

export function EsimInlineQuickCatalogExperience({
  products,
  initialSelection,
}: {
  products:
    readonly SecondaryProductViewModel[];
  initialSelection:
    EsimQuickFilterSelection;
}) {
  const [
    selection,
    setSelection,
  ] =
    useState<
      EsimQuickFilterSelection
    >(
      initialSelection,
    );

  const select =
    useCallback(
      (
        next:
          EsimQuickFilterSelection,
      ) => {
        setSelection(
          next,
        );

        updateBrowserUrl(
          next,
        );

        scrollToCatalog();
      },
      [],
    );

  const clearSelection =
    useCallback(
      () => {
        select(
          createAllEsimQuickFilterSelection(),
        );
      },
      [
        select,
      ],
    );

  return (
    <>
      <EsimInlineTypeExplorer
        selection={
          selection
        }
        onSelect={
          select
        }
      />

      <EsimQuickProductCatalog
        products={
          products
        }
        selection={
          selection
        }
        onClearSelection={
          clearSelection
        }
      />

      <EsimChoiceGuide />
    </>
  );
}
