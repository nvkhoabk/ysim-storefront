import Image from "next/image";

import {
  CalendarDays,
  Database,
  ShieldCheck,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  WooCommerceCart,
  WooCommerceCartItem,
} from "@/lib/woocommerce/cart-types";

function amount(
  value:
    | string
    | undefined,
  minorUnit: number,
): number {
  const raw =
    Number(
      value ||
      0,
    );

  return Number.isFinite(
    raw,
  )
    ? raw /
        Math.pow(
          10,
          minorUnit,
        )
    : 0;
}

function itemLabels(
  item:
    WooCommerceCartItem,
): readonly string[] {
  return [
    ...(
      item.variation ||
      []
    ).map(
      (entry) =>
        `${entry.attribute}: ${entry.value}`,
    ),
    ...(
      item.item_data ||
      []
    ).map(
      (entry) =>
        `${entry.key}: ${entry.display || entry.value}`,
    ),
  ];
}

export function CheckoutCandidateOrderSummary({
  cart,
  submitting,
  onSubmit,
}: {
  cart:
    WooCommerceCart;
  submitting: boolean;
  onSubmit:
    () => void;
}) {
  const minorUnit =
    cart.totals
      .currency_minor_unit;

  return (
    <aside className="h-fit rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] lg:sticky lg:top-28">
      <h2 className="text-lg font-bold text-[var(--ysim-color-text)]">
        Tóm tắt đơn hàng
      </h2>

      <div className="mt-5 space-y-5">
        {
          cart.items.map(
            (item) => {
              const image =
                item.images?.[0];

              const labels =
                itemLabels(
                  item,
                );

              return (
                <article
                  key={
                    item.key
                  }
                  className="flex gap-4"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)]">
                    {
                      image
                        ? (
                            <Image
                              src={
                                image.src
                              }
                              alt={
                                image.alt ||
                                item.name
                              }
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          )
                        : null
                    }
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold text-[var(--ysim-color-text)]">
                      {
                        item.name
                      }
                    </h3>

                    <p className="mt-1 text-xs text-[var(--ysim-color-text-soft)]">
                      Số lượng:{" "}
                      {
                        item.quantity
                      }
                    </p>

                    {
                      labels.length >
                      0
                        ? (
                            <div className="mt-2 space-y-1">
                              {
                                labels.slice(
                                  0,
                                  2,
                                ).map(
                                  (
                                    label,
                                    index,
                                  ) => (
                                    <p
                                      key={
                                        `${label}-${index}`
                                      }
                                      className="flex items-center gap-1 text-[11px] font-semibold text-[var(--ysim-color-text-muted)]"
                                    >
                                      {
                                        index ===
                                        0
                                          ? (
                                              <Database className="h-3 w-3" />
                                            )
                                          : (
                                              <CalendarDays className="h-3 w-3" />
                                            )
                                      }
                                      {label}
                                    </p>
                                  ),
                                )
                              }
                            </div>
                          )
                        : null
                    }

                    <div className="mt-2">
                      <Price
                        amount={
                          amount(
                            item.totals
                              .line_total,
                            item.totals
                              .currency_minor_unit,
                          )
                        }
                        size="compact"
                      />
                    </div>
                  </div>
                </article>
              );
            },
          )
        }
      </div>

      <dl className="mt-6 space-y-3 border-t border-[var(--ysim-color-border)] pt-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Tạm tính
          </dt>

          <dd>
            <Price
              amount={
                amount(
                  cart.totals
                    .total_items,
                  minorUnit,
                )
              }
              size="compact"
            />
          </dd>
        </div>

        {
          amount(
            cart.totals
              .total_discount,
            minorUnit,
          ) >
          0
            ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[var(--ysim-color-text-muted)]">
                    Giảm giá
                  </dt>

                  <dd className="font-bold text-[var(--ysim-color-brand-700)]">
                    -
                    {
                      amount(
                        cart.totals
                          .total_discount,
                        minorUnit,
                      ).toLocaleString(
                        "vi-VN",
                      )
                    }{" "}
                    đ
                  </dd>
                </div>
              )
            : null
        }
      </dl>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--ysim-color-border)] pt-5">
        <div>
          <p className="font-bold text-[var(--ysim-color-text)]">
            Tổng thanh toán
          </p>

          <p className="mt-1 text-xs text-[var(--ysim-color-text-soft)]">
            WooCommerce server total
          </p>
        </div>

        <Price
          amount={
            amount(
              cart.totals
                .total_price,
              minorUnit,
            )
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
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-base font-bold text-white hover:bg-[var(--ysim-color-brand-800)] disabled:cursor-wait disabled:opacity-55"
      >
        <ShieldCheck className="h-5 w-5" />

        {
          submitting
            ? "Đang tạo đơn..."
            : "Đặt hàng"
        }
      </button>

      <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-soft)]">
        Bước này tạo WooCommerce Order nhưng chưa khởi tạo thanh toán.
      </p>
    </aside>
  );
}
