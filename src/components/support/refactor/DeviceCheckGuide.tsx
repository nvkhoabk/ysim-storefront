import {
  Check,
} from "lucide-react";

import type {
  DeviceManualCheckViewModel,
} from "@/types/view-models/support";

export interface DeviceCheckGuideProps {
  steps:
    readonly DeviceManualCheckViewModel[];
}

export function DeviceCheckGuide({
  steps,
}: DeviceCheckGuideProps) {
  return (
    <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 sm:p-6">
      <h3 className="text-xl font-bold text-[var(--ysim-color-text)]">
        Tự kiểm tra trên điện thoại
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
        Dùng các bước dưới đây khi thiết bị chưa có trong danh sách preview.
      </p>

      <ol className="mt-5 space-y-4">
        {steps.map(
          (step) => (
            <li
              key={
                step.step
              }
              className="flex items-start gap-4"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ysim-color-brand-50)] text-sm font-bold text-[var(--ysim-color-brand-800)]">
                {
                  step.step
                }
              </span>

              <div>
                <h4 className="flex items-center gap-2 font-bold text-[var(--ysim-color-text)]">
                  <Check className="h-4 w-4 text-[var(--ysim-color-brand-700)]" />

                  {
                    step.title
                  }
                </h4>

                <p className="mt-1 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                  {
                    step.description
                  }
                </p>
              </div>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}
