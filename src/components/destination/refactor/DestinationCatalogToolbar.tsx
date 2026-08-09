import { Search } from "lucide-react";

import { TextInput } from "@/components/ui";

import type {
  DestinationCatalogFilterState,
  DestinationDataFilter,
  DestinationDurationFilter,
  DestinationSortValue,
} from "@/types/view-models/destination-page";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createListingTranslator } from "@/i18n/listing/listing.registry";

export interface DestinationCatalogToolbarProps {
  value: DestinationCatalogFilterState;
  onQueryChange: (value: string) => void;
  onDurationChange: (value: DestinationDurationFilter) => void;
  onDataChange: (value: DestinationDataFilter) => void;
  onSortChange: (value: DestinationSortValue) => void;
}

const selectClassName =
  "min-h-11 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-3.5 text-sm font-semibold text-[var(--ysim-color-text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ysim-color-focus)_18%,transparent)]";

export function DestinationCatalogToolbar({
  value,
  onQueryChange,
  onDurationChange,
  onDataChange,
  onSortChange,
}: DestinationCatalogToolbarProps) {
  const t = createListingTranslator(useStorefrontLocale().locale);
  return (
    <div className="grid gap-4 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] p-4 sm:p-5 lg:grid-cols-[minmax(16rem,1.6fr)_repeat(3,minmax(9rem,0.75fr))]">
      <TextInput
        label={t("destinations.searchLabel")}
        value={value.query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("destinations.searchPlaceholder")}
        startAdornment={<Search />}
      />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]">
          {t("ordinary.durationLabel")}
        </span>

        <select
          value={value.duration}
          onChange={(event) =>
            onDurationChange(event.target.value as DestinationDurationFilter)
          }
          className={selectClassName}
        >
          <option value="all">{t("common.all")}</option>
          <option value="1-5">{t("common.days", { count: "1–5" })}</option>
          <option value="6-10">{t("common.days", { count: "6–10" })}</option>
          <option value="11-30">{t("common.days", { count: "11–30" })}</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]">
          {t("esim.dataFilter")}
        </span>

        <select
          value={value.data}
          onChange={(event) =>
            onDataChange(event.target.value as DestinationDataFilter)
          }
          className={selectClassName}
        >
          <option value="all">{t("common.all")}</option>
          <option value="daily">{t("filters.dataDaily")}</option>
          <option value="total">{t("filters.dataTotal")}</option>
          <option value="unlimited">{t("filters.dataUnlimited")}</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]">
          {t("destinations.sortLabel")}
        </span>

        <select
          value={value.sort}
          onChange={(event) =>
            onSortChange(event.target.value as DestinationSortValue)
          }
          className={selectClassName}
        >
          <option value="popular">{t("ordinary.sortPopular")}</option>
          <option value="price-asc">{t("ordinary.sortPriceAscShort")}</option>
          <option value="name-asc">{t("ordinary.sortName")}</option>
        </select>
      </label>
    </div>
  );
}
