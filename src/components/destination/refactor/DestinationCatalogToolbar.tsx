import {
  Search,
} from "lucide-react";

import {
  TextInput,
} from "@/components/ui";

import type {
  DestinationCatalogFilterState,
  DestinationDataFilter,
  DestinationDurationFilter,
  DestinationSortValue,
} from "@/types/view-models/destination-page";

export interface DestinationCatalogToolbarProps {
  value:
    DestinationCatalogFilterState;
  onQueryChange:
    (value: string) => void;
  onDurationChange:
    (
      value:
        DestinationDurationFilter,
    ) => void;
  onDataChange:
    (
      value:
        DestinationDataFilter,
    ) => void;
  onSortChange:
    (
      value:
        DestinationSortValue,
    ) => void;
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
  return (
    <div className="grid gap-4 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] p-4 sm:p-5 lg:grid-cols-[minmax(16rem,1.6fr)_repeat(3,minmax(9rem,0.75fr))]">
      <TextInput
        label="Tìm điểm đến"
        value={
          value.query
        }
        onChange={(
          event,
        ) =>
          onQueryChange(
            event.target.value,
          )
        }
        placeholder="Nhật Bản, Châu Âu..."
        startAdornment={
          <Search />
        }
      />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]">
          Số ngày
        </span>

        <select
          value={
            value.duration
          }
          onChange={(
            event,
          ) =>
            onDurationChange(
              event.target
                .value as
                DestinationDurationFilter,
            )
          }
          className={
            selectClassName
          }
        >
          <option value="all">
            Tất cả
          </option>
          <option value="1-5">
            1–5 ngày
          </option>
          <option value="6-10">
            6–10 ngày
          </option>
          <option value="11-30">
            11–30 ngày
          </option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]">
          Dung lượng
        </span>

        <select
          value={
            value.data
          }
          onChange={(
            event,
          ) =>
            onDataChange(
              event.target
                .value as
                DestinationDataFilter,
            )
          }
          className={
            selectClassName
          }
        >
          <option value="all">
            Tất cả
          </option>
          <option value="daily">
            Theo ngày
          </option>
          <option value="total">
            Tổng dung lượng
          </option>
          <option value="unlimited">
            Không giới hạn
          </option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[var(--ysim-color-text)]">
          Sắp xếp
        </span>

        <select
          value={
            value.sort
          }
          onChange={(
            event,
          ) =>
            onSortChange(
              event.target
                .value as
                DestinationSortValue,
            )
          }
          className={
            selectClassName
          }
        >
          <option value="popular">
            Phổ biến
          </option>
          <option value="price-asc">
            Giá tăng dần
          </option>
          <option value="name-asc">
            Tên A–Z
          </option>
        </select>
      </label>
    </div>
  );
}
