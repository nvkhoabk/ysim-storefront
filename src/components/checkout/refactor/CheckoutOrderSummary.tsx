import Image from "next/image";

import {
  CalendarDays,
  Database,
  PackageCheck,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  CheckoutPageViewModel,
} from "@/types/view-models/checkout-refactor";

export interface CheckoutOrderSummaryProps {
  page:
    CheckoutPageViewModel;
  submitting: boolean;
  onSubmit:
    () => void;
}

export function CheckoutOrderSummary({
  page,
  submitting,
  onSubmit,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-md)] lg:sticky lg:top-28 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
        Đơn hàng của bạn
      </h2>

      <div className="mt-5 space-y-4">
        {page.lines.map(
          (line) => (
            <article
              key={
                line.lineId
              }
              className="flex gap-3 border-b border-[var(--ysim-color-border)] pb-4 last:border-b-0"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)]">
                <Image
                  src={
                    line.imageUrl
                  }
                  alt={
                    line.imageAlt
                  }
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-[var(--ysim-color-text)]">
                  {
                    line.name
                  }
                </h3>

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-[var(--ysim-color-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Database className="h-3 w-3" />

                    {
                      line.dataLabel
                    }
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />

                    {
                      line.durationLabel
                    }
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--ysim-color-text-soft)]">
                    SL:{" "}
                    {
                      line.quantity
                    }
                  </span>

                  <Price
                    amount={
                      line.lineTotal
                    }
                    size="compact"
                  />
                </div>
              </div>
            </article>
          ),
        )}
      </div>

      <dl className="mt-5 space-y-3 border-t border-[var(--ysim-color-border)] pt-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Tạm tính
          </dt>

          <dd>
            <Price
              amount={
                page.totals
                  .subtotal
              }
              size="compact"
            />
          </dd>
        </div>

        {page.totals
          .productDiscount >
        0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--ysim-color-text-muted)]">
              Giảm giá sản phẩm
            </dt>

            <dd className="font-bold text-[var(--ysim-color-brand-700)]">
              -{" "}
              <Price
                amount={
                  page.totals
                    .productDiscount
                }
                size="compact"
              />
            </dd>
          </div>
        ) : null}

        {page.totals
          .couponDiscount >
        0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--ysim-color-text-muted)]">
              Mã ưu đãi
            </dt>

            <dd className="font-bold text-[var(--ysim-color-brand-700)]">
              -{" "}
              <Price
                amount={
                  page.totals
                    .couponDiscount
                }
                size="compact"
              />
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--ysim-color-border)] pt-5">
        <div>
          <p className="text-sm font-bold text-[var(--ysim-color-text)]">
            Tổng thanh toán
          </p>

          <p className="mt-1 text-xs text-[var(--ysim-color-text-soft)]">
            Đã bao gồm ưu đãi
          </p>
        </div>

        <Price
          amount={
            page.totals
              .total
          }
        />
      </div>

      <button
        type="button"
        disabled={
          submitting
        }
        onClick={
          onSubmit
        }
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 py-3 text-base font-bold text-white transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-800)] hover:shadow-[var(--ysim-shadow-md)] disabled:cursor-wait disabled:opacity-60"
      >
        <PackageCheck className="h-5 w-5" />

        {submitting
          ? "Đang kiểm tra..."
          : "Đặt hàng và thanh toán"}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-[var(--ysim-color-text-soft)]">
        Preview không tạo đơn WooCommerce và không khởi tạo GPay.
      </p>
    </aside>
  );
}
