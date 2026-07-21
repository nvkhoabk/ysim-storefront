import {
  CheckCircle2,
} from "lucide-react";

import type {
  PreviewReviewChecklistViewModel,
} from "@/types/view-models/ui-preview-registry";

export function PreviewReviewChecklist({
  checklist,
}: {
  checklist:
    PreviewReviewChecklistViewModel;
}) {
  return (
    <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
      <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
        {checklist.title}
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {checklist.items.map(
          (item) => (
            <p
              key={
                item
              }
              className="flex items-start gap-3 rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] px-4 py-3 text-sm font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

              {item}
            </p>
          ),
        )}
      </div>
    </div>
  );
}
