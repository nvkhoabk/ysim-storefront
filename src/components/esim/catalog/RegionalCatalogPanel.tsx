"use client";

import type { ReactNode } from "react";

import { ArrowRight } from "lucide-react";

import type {
  EsimCatalogCategoryKey,
  EsimCatalogEmptyState,
} from "./types";

export interface RegionalCatalogPanelProps {
  content: EsimCatalogEmptyState;

  onCategoryChange?: (
    category: EsimCatalogCategoryKey,
  ) => void;

  visual?: ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function RegionalCatalogPanel({
  content,
  onCategoryChange,
  visual,
  className,
}: RegionalCatalogPanelProps) {
  const handleAction = () => {
    if (
      content.action.targetCategory &&
      onCategoryChange
    ) {
      onCategoryChange(
        content.action.targetCategory,
      );
    }
  };

  return (
    <section
      className={joinClasses(
        "flex min-h-[520px] items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-green-50 via-white to-slate-50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="max-w-xl">
        {visual ? (
          <div
            aria-hidden="true"
            className="mx-auto mb-8 flex min-h-40 items-center justify-center"
          >
            {visual}
          </div>
        ) : null}

        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-green-700">
          {content.eyebrow}
        </p>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          {content.title}
        </h2>

        <p className="mt-5 text-base leading-7 text-slate-600">
          {content.description}
        </p>

        {content.action.targetCategory ? (
          <button
            type="button"
            onClick={handleAction}
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            {content.action.label}

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}