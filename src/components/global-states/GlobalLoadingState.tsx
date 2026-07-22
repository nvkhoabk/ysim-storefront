import {
  LoaderCircle,
} from "lucide-react";

import {
  Skeleton,
} from "@/components/ui";

export function GlobalLoadingState({
  title =
    "Đang tải nội dung",
  description =
    "YSim đang chuẩn bị dữ liệu cho bạn.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={
        title
      }
      className="mx-auto w-full max-w-5xl"
    >
      <div className="mb-7 flex items-center justify-center gap-3 text-sm font-bold text-[var(--ysim-color-text-muted)]">
        <LoaderCircle
          aria-hidden="true"
          className="h-5 w-5 animate-spin text-[var(--ysim-color-brand-700)]"
        />

        <span>
          {
            title
          }
        </span>

        <span className="sr-only">
          {
            description
          }
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {
          Array.from({
            length:
              6,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-4"
              >
                <Skeleton
                  shape="custom"
                  className="aspect-[4/3] w-full rounded-[var(--ysim-radius-lg)]"
                />

                <Skeleton
                  className="mt-5 w-1/3"
                />

                <Skeleton
                  className="mt-3 h-5 w-5/6"
                />

                <Skeleton
                  className="mt-2 h-5 w-2/3"
                />

                <Skeleton
                  className="mt-5 h-7 w-1/2"
                />
              </div>
            ),
          )
        }
      </div>
    </div>
  );
}
