import Link from "next/link";

import {
  CheckCircle2,
  CreditCard,
  ReceiptText,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  CheckoutOrderHandoff,
} from "@/types/view-models/checkout-route-candidate";

export function CheckoutCandidateSuccess({
  handoff,
}: {
  handoff:
    CheckoutOrderHandoff;
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-[var(--ysim-radius-xl)] border border-emerald-200 bg-white p-7 text-center shadow-[var(--ysim-shadow-sm)] sm:p-10">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />

      <p className="mt-5 text-sm font-bold uppercase tracking-[0.1em] text-emerald-700">
        Order created
      </p>

      <h1 className="mt-2 text-3xl font-bold text-[var(--ysim-color-text)]">
        Đơn hàng đã được tạo
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
        WooCommerce đã tạo đơn chờ thanh toán. Package 29 chưa gọi cổng thanh toán.
      </p>

      <dl className="mt-7 grid gap-4 text-left sm:grid-cols-2">
        <div className="rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Mã đơn
          </dt>
          <dd className="mt-1 font-bold text-[var(--ysim-color-text)]">
            {
              handoff.orderNumber
            }
          </dd>
        </div>

        <div className="rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Trạng thái
          </dt>
          <dd className="mt-1 font-bold text-[var(--ysim-color-text)]">
            {
              handoff.orderStatus
            }
          </dd>
        </div>

        <div className="rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Phương thức
          </dt>
          <dd className="mt-1 font-bold text-[var(--ysim-color-text)]">
            {
              handoff.provider
            }
          </dd>
        </div>

        <div className="rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Tổng tiền
          </dt>
          <dd className="mt-1">
            <Price
              amount={
                handoff.amount
              }
            />
          </dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/ui-preview/payment-route-candidate"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-white"
        >
          <CreditCard className="h-4 w-4" />
          Tiếp tục thanh toán
        </Link>

        <Link
          href={`/ui-preview/order-route-candidate/${encodeURIComponent(handoff.orderNumber)}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-[var(--ysim-color-brand-700)]"
        >
          <ReceiptText className="h-4 w-4" />
          Xem đơn hàng
        </Link>
      </div>

      <p className="mt-5 text-xs font-semibold text-[var(--ysim-color-text-soft)]">
        Payment handoff đã được lưu trong sessionStorage; order key không hiển thị trên màn hình.
      </p>
    </div>
  );
}
