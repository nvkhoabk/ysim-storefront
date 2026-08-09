import Image from "next/image";

import {
  CalendarDays,
  Database,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  OrderResultPageViewModel,
} from "@/types/view-models/payment-result";

export interface OrderResultSummaryProps {
  order:
    OrderResultPageViewModel;
}

export function OrderResultSummary({
  order,
}: OrderResultSummaryProps) {
  return (
    <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
      <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
        Sản phẩm trong đơn hàng
      </h2>

      <div className="mt-5 space-y-4">
        {order.lines.map(
          (line) => (
            <article
              key={
                line.lineId
              }
              className="flex gap-4 border-b border-[var(--ysim-color-border)] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)]">
                <Image
                  src={
                    line.imageUrl
                  }
                  alt={
                    line.imageAlt
                  }
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-700)]">
                  {
                    line.destinationName
                  }
                </p>

                <h3 className="mt-1 font-bold text-[var(--ysim-color-text)]">
                  {
                    line.name
                  }
                </h3>

                <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Database className="h-3.5 w-3.5" />

                    {
                      line.dataLabel
                    }
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />

                    {
                      line.durationLabel
                    }
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-xs text-[var(--ysim-color-text-soft)]">
                    Số lượng:{" "}
                    {
                      line.quantity
                    }
                  </p>

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

      <dl className="mt-6 space-y-3 border-t border-[var(--ysim-color-border)] pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Tạm tính
          </dt>

          <dd>
            <Price
              amount={
                order.totals
                  .subtotal
              }
              size="compact"
            />
          </dd>
        </div>

        {order.totals
          .productDiscount >
        0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ysim-color-text-muted)]">
              Giảm giá sản phẩm
            </dt>

            <dd className="font-bold text-[var(--ysim-color-brand-700)]">
              -{" "}
              <Price
                amount={
                  order.totals
                    .productDiscount
                }
                size="compact"
              />
            </dd>
          </div>
        ) : null}

        {order.totals
          .couponDiscount >
        0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ysim-color-text-muted)]">
              Mã ưu đãi
            </dt>

            <dd className="font-bold text-[var(--ysim-color-brand-700)]">
              -{" "}
              <Price
                amount={
                  order.totals
                    .couponDiscount
                }
                size="compact"
              />
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--ysim-color-border)] pt-5">
        <p className="font-bold text-[var(--ysim-color-text)]">
          Tổng cộng
        </p>

        <Price
          amount={
            order.totals
              .total
          }
        />
      </div>
    </section>
  );
}
