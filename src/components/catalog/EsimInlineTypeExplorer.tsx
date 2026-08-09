"use client";

import { useState } from "react";

import Image from "next/image";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  Layers3,
  MapPinned,
} from "lucide-react";

import { esimDestinationExplorer } from "@/config/esim-destination-explorer";

import {
  createAllEsimQuickFilterSelection,
  createContinentQuickFilterSelection,
  createDestinationQuickFilterSelection,
  createGlobalQuickFilterSelection,
  createRegionQuickFilterSelection,
} from "@/lib/storefront/catalog/esim-quick-filter";

import type {
  EsimContinentViewModel,
  EsimExplorerType,
} from "@/types/view-models/esim-destination-explorer";

import type { EsimQuickFilterSelection } from "@/types/view-models/esim-quick-filter";

import styles from "./EsimInlineQuickFilter.module.css";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";

const flagAssetVersion = "7.5.0";

function countryFlagSource(countryCode: string): string {
  return (
    "https://cdn.jsdelivr.net/gh/lipis/flag-icons@" +
    `${flagAssetVersion}/flags/4x3/${countryCode.toLowerCase()}.svg`
  );
}

function typeFromSelection(
  selection: EsimQuickFilterSelection,
): EsimExplorerType {
  if (selection.kind === "region") {
    return "region";
  }

  if (selection.kind === "global") {
    return "global";
  }

  return "country";
}

function ContinentGroup({
  group,
  selection,
  onSelect,
}: {
  group: EsimContinentViewModel;
  selection: EsimQuickFilterSelection;
  onSelect: (selection: EsimQuickFilterSelection) => void;
}) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  const continentActive =
    selection.kind === "continent" && selection.id === group.id;

  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{group.label}</h3>

      <ul className={styles.destinationList}>
        {group.destinations.map((destination) => {
          const active =
            (selection.kind === "destination" || selection.kind === "global") &&
            selection.id === destination.slug;

          return (
            <li key={destination.slug}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onSelect(createDestinationQuickFilterSelection(destination))
                }
                className={`${styles.destinationLink} ${active ? styles.destinationLinkActive : ""}`}
              >
                <span
                  aria-hidden="true"
                  data-flag-code={destination.countryCode || "special"}
                  className={styles.destinationFlag}
                >
                  {destination.countryCode ? (
                    <>
                      <span className={styles.flagFallbackCode}>
                        {destination.countryCode.toUpperCase()}
                      </span>

                      <Image
                        src={countryFlagSource(destination.countryCode)}
                        alt=""
                        width={28}
                        height={21}
                        unoptimized
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={styles.flagImage}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </>
                  ) : (
                    <MapPinned className={styles.destinationSpecialIcon} />
                  )}
                </span>

                <span className={styles.destinationName}>
                  {destination.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        aria-pressed={continentActive}
        onClick={() => onSelect(createContinentQuickFilterSelection(group))}
        className={`${styles.viewAll} ${continentActive ? styles.viewAllActive : ""}`}
      >
        {t("ordinary.viewAll")} ({group.countLabel})
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </section>
  );
}

function CountryPanel({
  selection,
  onSelect,
}: {
  selection: EsimQuickFilterSelection;
  onSelect: (selection: EsimQuickFilterSelection) => void;
}) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  return (
    <>
      <h2 className={styles.panelTitle}>{t("ordinary.explorerCountry")}</h2>

      <div className={styles.primaryGrid}>
        {esimDestinationExplorer.primaryContinents.map((group) => (
          <ContinentGroup
            key={group.id}
            group={group}
            selection={selection}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className={styles.secondaryGrid}>
        {esimDestinationExplorer.secondaryContinents.map((group) => (
          <ContinentGroup
            key={group.id}
            group={group}
            selection={selection}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

function RegionPanel({
  selection,
  onSelect,
}: {
  selection: EsimQuickFilterSelection;
  onSelect: (selection: EsimQuickFilterSelection) => void;
}) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  return (
    <>
      <h2 className={styles.panelTitle}>{t("ordinary.explorerRegion")}</h2>

      <div className={styles.regionGrid}>
        {esimDestinationExplorer.regions.map((region) => {
          const active =
            selection.kind === "region" && selection.id === region.id;

          return (
            <button
              key={region.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(createRegionQuickFilterSelection(region))}
              className={`${styles.regionCard} ${active ? styles.regionCardActive : ""}`}
            >
              <span className={styles.regionCoverage}>{region.coverage}</span>

              <span className={styles.regionName}>{region.label}</span>

              <span className={styles.regionDescription}>
                {region.description}
              </span>

              <span className={styles.regionAction}>
                {t("ordinary.regionAction")}

                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function GlobalPanel({
  selection,
  onSelect,
}: {
  selection: EsimQuickFilterSelection;
  onSelect: (selection: EsimQuickFilterSelection) => void;
}) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  const active = selection.kind === "global";

  return (
    <div className={styles.globalPanel}>
      <div className={styles.globalInner}>
        <span aria-hidden="true" className={styles.globalIcon}>
          <Globe2 className="h-10 w-10" />
        </span>

        <h2 className={styles.globalTitle}>{t("ordinary.globalTitle")}</h2>

        <p className={styles.globalDescription}>
          {t("ordinary.globalDescription")}
        </p>

        <div className={styles.globalBenefits}>
          {[
            t("ordinary.benefitActivation"),
            t("ordinary.benefitNoPhysicalSim"),
            t("ordinary.benefitSupport"),
          ].map((benefit) => (
            <p key={benefit} className={styles.globalBenefit}>
              <Check
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
              />

              {benefit}
            </p>
          ))}
        </div>

        <button
          type="button"
          aria-pressed={active}
          onClick={() => onSelect(createGlobalQuickFilterSelection())}
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-0 bg-emerald-700 px-6 text-sm font-extrabold text-white hover:bg-emerald-800"
        >
          {t("ordinary.globalAction")}

          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const typeIcons = {
  country: MapPinned,
  region: Layers3,
  global: Globe2,
} as const;

export function EsimInlineTypeExplorer({
  selection,
  onSelect,
}: {
  selection: EsimQuickFilterSelection;
  onSelect: (selection: EsimQuickFilterSelection) => void;
}) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  const localizedTypes = {
    country: {
      label: t("ordinary.typeCountry"),
      description: t("ordinary.typeCountryDescription"),
    },
    region: {
      label: t("ordinary.typeRegion"),
      description: t("ordinary.typeRegionDescription"),
    },
    global: {
      label: t("ordinary.typeGlobal"),
      description: t("ordinary.typeGlobalDescription"),
    },
  } as const;
  const [activeType, setActiveType] = useState<EsimExplorerType>(
    typeFromSelection(selection),
  );

  const selectionType = typeFromSelection(selection);

  const [previousSelectionType, setPreviousSelectionType] =
    useState(selectionType);

  if (previousSelectionType !== selectionType) {
    setPreviousSelectionType(selectionType);
    if (activeType !== selectionType) {
      setActiveType(selectionType);
    }
  }

  return (
    <section
      aria-label={t("ordinary.explorerLabel")}
      className={styles.explorer}
    >
      <aside className={styles.typeColumn}>
        <h2 className={styles.typeTitle}>{t("ordinary.typeTitle")}</h2>

        <div
          role="tablist"
          aria-label={t("ordinary.typeTitle")}
          className={styles.typeTabs}
        >
          {esimDestinationExplorer.types.map((type) => {
            const active = activeType === type.id;

            const Icon = typeIcons[type.id];

            return (
              <button
                key={type.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`esim-inline-panel-${type.id}`}
                onClick={() => setActiveType(type.id)}
                className={`${styles.typeTab} ${active ? styles.typeTabActive : ""}`}
              >
                <span className={styles.typeTabLabel}>
                  <span className="flex items-center gap-2">
                    <Icon aria-hidden="true" className="h-4 w-4" />

                    {localizedTypes[type.id].label}
                  </span>

                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </span>

                <span className={styles.typeTabDescription}>
                  {localizedTypes[type.id].description}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.typeBenefits}>
          <p className={styles.typeBenefit}>
            {t("ordinary.benefitActivation")}
          </p>

          <p className={styles.typeBenefit}>
            {t("ordinary.benefitNoPhysicalSim")}
          </p>

          <p className={styles.typeBenefit}>
            {t("ordinary.benefitKeepNumber")}
          </p>

          <p className={styles.typeBenefit}>{t("ordinary.benefitSupport")}</p>
        </div>
      </aside>

      <div
        id={`esim-inline-panel-${activeType}`}
        role="tabpanel"
        className={styles.mainPanel}
      >
        {activeType === "country" ? (
          <CountryPanel selection={selection} onSelect={onSelect} />
        ) : null}

        {activeType === "region" ? (
          <RegionPanel selection={selection} onSelect={onSelect} />
        ) : null}

        {activeType === "global" ? (
          <GlobalPanel selection={selection} onSelect={onSelect} />
        ) : null}
      </div>

      <aside className={styles.discoverPanel}>
        <p className={styles.discoverEyebrow}>
          {t("ordinary.discoverEyebrow")}
        </p>

        <div className={styles.discoverNumber}>200+</div>

        <div className={styles.discoverTitle}>
          {t("ordinary.discoverTitle")}
        </div>

        <div className={styles.discoverBenefits}>
          {[
            t("ordinary.benefitActivation"),
            t("ordinary.benefitNoPhysicalSim"),
            t("ordinary.benefitKeepNumber"),
          ].map((benefit) => (
            <p key={benefit} className={styles.discoverBenefit}>
              {benefit}
            </p>
          ))}
        </div>

        <div aria-hidden="true" className={styles.globeStage}>
          <Globe2 className="h-24 w-24" strokeWidth={1.25} />
        </div>

        <button
          type="button"
          onClick={() => onSelect(createAllEsimQuickFilterSelection())}
          className={styles.discoverCta}
        >
          {t("ordinary.discoverAction")}

          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </aside>
    </section>
  );
}
