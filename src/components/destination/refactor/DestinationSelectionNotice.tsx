import Link from "next/link";

import {
  ArrowLeft,
  MapPinned,
} from "lucide-react";

import type {
  DestinationRouteSelectionViewModel,
} from "@/types/view-models/destination-page";

export function DestinationSelectionNotice({
  selection,
}: {
  selection:
    DestinationRouteSelectionViewModel;
}) {
  if (
    selection.kind ===
    "all"
  ) {
    return null;
  }

  return (
    <aside
      data-ysim-destination-selection={
        selection.key
      }
      className="mt-6 flex flex-col gap-4 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-white text-[var(--ysim-color-brand-700)] shadow-[var(--ysim-shadow-sm)]"
        >
          <MapPinned className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-700)]">
            Đang khám phá
          </p>

          <h2 className="mt-1 truncate text-lg font-bold text-[var(--ysim-color-text)]">
            {
              selection.label
            }
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--ysim-color-text-muted)]">
            {
              selection.description
            }
          </p>
        </div>
      </div>

      <Link
        href="/destinations"
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] bg-white px-4 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-100)]"
      >
        <ArrowLeft
          aria-hidden="true"
          className="h-4 w-4"
        />

        Xem tất cả
      </Link>
    </aside>
  );
}
