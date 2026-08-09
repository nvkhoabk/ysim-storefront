"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  createPaymentResultPreview,
} from "@/config/storefront-payment-result-preview";

import type {
  PaymentResultStatus,
} from "@/types/view-models/payment-result";

import {
  cn,
} from "@/lib/ui/cn";

import {
  PaymentResultPageComposition,
} from "./PaymentResultPageComposition";

const statuses:
  readonly {
    id:
      PaymentResultStatus;
    label: string;
  }[] = [
    {
      id:
        "processing",
      label:
        "Đang xử lý",
    },
    {
      id:
        "success",
      label:
        "Thành công",
    },
    {
      id:
        "failed",
      label:
        "Thất bại",
    },
    {
      id:
        "pending",
      label:
        "Chờ xác nhận",
    },
  ];

export function PaymentResultPreview() {
  const [
    status,
    setStatus,
  ] =
    useState<PaymentResultStatus>(
      "success",
    );

  const page =
    useMemo(
      () =>
        createPaymentResultPreview(
          status,
        ),
      [
        status,
      ],
    );

  const controls = (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
        Preview controls
      </p>

      <h2 className="mt-2 text-xl font-bold text-[var(--ysim-color-text)]">
        Chuyển trạng thái thanh toán
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.map(
          (item) => (
            <button
              key={
                item.id
              }
              type="button"
              aria-pressed={
                status ===
                item.id
              }
              onClick={() =>
                setStatus(
                  item.id,
                )
              }
              className={cn(
                "min-h-10 rounded-[var(--ysim-radius-pill)] border px-4 py-2 text-sm font-bold",
                status ===
                item.id
                  ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white"
                  : "border-[var(--ysim-color-border-strong)] bg-white text-[var(--ysim-color-text-muted)] hover:border-[var(--ysim-color-brand-300)]",
              )}
            >
              {
                item.label
              }
            </button>
          ),
        )}
      </div>
    </div>
  );

  return (
    <PaymentResultPageComposition
      page={
        page
      }
      previewControls={
        controls
      }
    />
  );
}
