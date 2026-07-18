"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import {
  esimCatalogBenefits,
  esimCatalogCategories,
  esimContinents,
  esimSpecialDestinations,
  globalCatalogEmptyState,
  regionalCatalogEmptyState,
} from "@/content/esim/catalog";

import {
  CountryCatalogPanel,
  EsimCatalogBenefits,
  EsimCategorySelector,
  GlobalCatalogPanel,
  RegionalCatalogPanel,
} from "./index";

import type {
  EsimCatalogBenefit,
  EsimCatalogCategory,
  EsimCatalogCategoryKey,
  EsimContinent,
  EsimSpecialDestination,
} from "./types";

import {
  EsimPromotionAside,
} from "./EsimPromotionAside";

export interface EsimCatalogShellProps {
  promotionVisual?: ReactNode;

  regionVisual?: ReactNode;

  globalVisual?: ReactNode;

  renderCategoryIcon?: (
    category: EsimCatalogCategory,
  ) => ReactNode;

  renderBenefitIcon?: (
    benefit: EsimCatalogBenefit,
  ) => ReactNode;

  renderContinentIcon?: (
    continent: EsimContinent,
  ) => ReactNode;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  renderSpecialIcon?: (
    destination: EsimSpecialDestination,
  ) => ReactNode;

  initialCategory?: EsimCatalogCategoryKey;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function EsimCatalogShell({
  promotionVisual,
  regionVisual,
  globalVisual,
  renderCategoryIcon,
  renderBenefitIcon,
  renderContinentIcon,
  renderFlag,
  renderSpecialIcon,
  initialCategory = "country",
  className,
}: EsimCatalogShellProps) {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<EsimCatalogCategoryKey>(
    initialCategory,
  );

  return (
    <section
      aria-label="Danh mục eSIM"
      className={joinClasses(
        "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7",
        className,
      )}
    >
      <div className="grid items-stretch gap-8 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col">
          <EsimCategorySelector
            categories={esimCatalogCategories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            renderIcon={renderCategoryIcon}
          />

          <EsimCatalogBenefits
            benefits={esimCatalogBenefits}
            renderIcon={renderBenefitIcon}
            className="mt-8 xl:mt-auto"
          />
        </div>

        <div className="min-w-0 border-slate-200 xl:border-l xl:pl-8">
          {activeCategory === "country" ? (
            <CountryCatalogPanel
              continents={esimContinents}
              specialDestinations={
                esimSpecialDestinations
              }
              renderContinentIcon={
                renderContinentIcon
              }
              renderFlag={renderFlag}
              renderSpecialIcon={
                renderSpecialIcon
              }
            />
          ) : null}

          {activeCategory === "region" ? (
            <RegionalCatalogPanel
              content={
                regionalCatalogEmptyState
              }
              onCategoryChange={
                setActiveCategory
              }
              visual={regionVisual}
            />
          ) : null}

          {activeCategory === "global" ? (
            <GlobalCatalogPanel
              content={
                globalCatalogEmptyState
              }
              visual={globalVisual}
            />
          ) : null}
        </div>

        <EsimPromotionAside
          visual={promotionVisual}
        />
      </div>
    </section>
  );
}