"use client";

import {
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import {
  GlobalStateFrame,
} from "./GlobalStateFrame";

export function GlobalErrorState({
  title =
    "Chưa thể tải nội dung",
  description =
    "Đã xảy ra sự cố tạm thời. Bạn có thể thử lại mà không cần nhập lại thông tin.",
  detail,
  onRetry,
  retrying =
    false,
}: {
  title?: string;
  description?: string;
  detail?: string;
  onRetry?:
    () => void;
  retrying?: boolean;
}) {
  return (
    <GlobalStateFrame
      tone="danger"
      icon={
        <AlertTriangle className="h-7 w-7" />
      }
      eyebrow="Đã xảy ra sự cố"
      title={
        title
      }
      description={
        description
      }
      detail={
        detail
      }
      role="alert"
      ariaLive="assertive"
      secondaryAction={{
        label:
          "Liên hệ hỗ trợ",
        href:
          "/support",
        variant:
          "outline",
      }}
      customPrimaryAction={
        onRetry
          ? (
              <button
                type="button"
                disabled={
                  retrying
                }
                onClick={
                  onRetry
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-white hover:bg-[var(--ysim-color-brand-800)] disabled:cursor-wait disabled:opacity-55"
              >
                <RefreshCcw
                  aria-hidden="true"
                  className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
                />

                {
                  retrying
                    ? "Đang thử lại..."
                    : "Thử lại"
                }
              </button>
            )
          : undefined
      }
    />
  );
}
