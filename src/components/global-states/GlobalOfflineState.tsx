"use client";

import {
  RefreshCcw,
  WifiOff,
} from "lucide-react";

import {
  GlobalStateFrame,
} from "./GlobalStateFrame";

export function GlobalOfflineState({
  onRetry,
}: {
  onRetry?:
    () => void;
}) {
  return (
    <GlobalStateFrame
      tone="warning"
      icon={
        <WifiOff className="h-7 w-7" />
      }
      eyebrow="Kết nối"
      title="Kết nối đang gián đoạn"
      description="Hãy kiểm tra kết nối mạng rồi thử lại. Nếu vừa thanh toán, không gửi lại giao dịch cho tới khi kiểm tra trạng thái đơn."
      role="alert"
      ariaLive="assertive"
      secondaryAction={{
        label:
          "Xem hỗ trợ",
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
                onClick={
                  onRetry
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-white hover:bg-[var(--ysim-color-brand-800)]"
              >
                <RefreshCcw
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                Thử lại
              </button>
            )
          : undefined
      }
    />
  );
}
