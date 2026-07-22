"use client";

import {
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  LoaderCircle,
  Minus,
  Plus,
  RefreshCcw,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  Price,
} from "@/components/ui";

import {
  useWooCommerceCart,
} from "@/features/cart/refactor";

import type {
  WooCommerceCartItem,
} from "@/lib/woocommerce/cart-types";

import type {
  CartRouteCandidateViewModel,
} from "@/types/view-models/cart-route-candidate";

import {
  CartRouteCandidateNotice,
} from "./CartRouteCandidateNotice";

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

function variationLabels(
  item:
    WooCommerceCartItem,
): readonly string[] {
  return [
    ...(
      item.variation ||
      []
    ).map(
      (attribute) =>
        `${attribute.attribute}: ${attribute.value}`,
    ),
    ...(
      item.item_data ||
      []
    ).map(
      (data) =>
        `${data.key}: ${data.display || data.value}`,
    ),
  ];
}

export function CartCandidateClient({
  candidate,
}: {
  candidate:
    CartRouteCandidateViewModel;
}) {
  const cartState =
    useWooCommerceCart();

  const [
    couponCode,
    setCouponCode,
  ] =
    useState("");

  const cart =
    cartState.cart;

  async function applyCoupon() {
    const code =
      couponCode.trim();

    if (!code) {
      return;
    }

    try {
      await cartState
        .applyCoupon(
          code,
        );

      setCouponCode(
        "",
      );
    } catch {
      // Error is already exposed by the hook.
    }
  }

  if (
    cartState.isLoading
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container>
            <div className="flex min-h-[24rem] items-center justify-center gap-3 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--ysim-color-brand-700)]" />
              Đang tải giỏ hàng WooCommerce...
            </div>
          </Container>
        </Section>

        <CartRouteCandidateNotice
          candidate={
            candidate
          }
        />
      </PageShell>
    );
  }

  if (!cart) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container size="content">
            <div className="rounded-[var(--ysim-radius-xl)] border border-red-200 bg-red-50 p-8 text-center">
              <h1 className="text-2xl font-bold text-red-900">
                Không thể tải giỏ hàng
              </h1>

              <p className="mt-3 text-sm font-semibold text-red-800">
                {
                  cartState.error ||
                  "WooCommerce Cart API không phản hồi."
                }
              </p>

              <button
                type="button"
                onClick={() =>
                  void cartState
                    .reload()
                }
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-red-700 px-5 text-sm font-bold text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Thử lại
              </button>
            </div>
          </Container>
        </Section>

        <CartRouteCandidateNotice
          candidate={
            candidate
          }
        />
      </PageShell>
    );
  }

  if (
    cart.items.length ===
    0
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container size="content">
            <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-10 text-center shadow-[var(--ysim-shadow-sm)]">
              <ShoppingBag className="mx-auto h-12 w-12 text-[var(--ysim-color-brand-700)]" />

              <h1 className="mt-5 text-3xl font-bold text-[var(--ysim-color-text)]">
                Giỏ hàng đang trống
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                Hãy chọn điểm đến và gói eSIM phù hợp với chuyến đi.
              </p>

              <Link
                href="/destinations"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-6 text-sm font-bold text-white"
              >
                Chọn điểm đến
              </Link>
            </div>
          </Container>
        </Section>

        <CartRouteCandidateNotice
          candidate={
            candidate
          }
        />
      </PageShell>
    );
  }

  const minorUnit =
    cart.totals
      .currency_minor_unit;

  return (
    <PageShell
      cartCount={
        cart.items_count
      }
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
            Cart
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--ysim-color-text)] sm:text-4xl">
            {
              candidate.title
            }
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--ysim-color-text-muted)]">
            {
              candidate.description
            }
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          {
            cartState.error
              ? (
                  <div className="mb-5 rounded-[var(--ysim-radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                    {
                      cartState.error
                    }
                  </div>
                )
              : null
          }

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-4">
              {
                cart.items.map(
                  (item) => {
                    const image =
                      item.images?.[0];

                    const isPending =
                      cartState.pending ===
                      item.key;

                    const labels =
                      variationLabels(
                        item,
                      );

                    return (
                      <article
                        key={
                          item.key
                        }
                        className="relative flex flex-col gap-5 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:flex-row"
                      >
                        {
                          isPending
                            ? (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[var(--ysim-radius-xl)] bg-white/75 backdrop-blur-[1px]">
                                  <LoaderCircle className="h-6 w-6 animate-spin text-[var(--ysim-color-brand-700)]" />
                                </div>
                              )
                            : null
                        }

                        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] sm:h-32 sm:w-40">
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
                                    sizes="160px"
                                    className="object-cover"
                                  />
                                )
                              : null
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h2 className="font-bold text-[var(--ysim-color-text)]">
                                {
                                  item.name
                                }
                              </h2>

                              {
                                item.sku
                                  ? (
                                      <p className="mt-1 text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                                        SKU:{" "}
                                        {
                                          item.sku
                                        }
                                      </p>
                                    )
                                  : null
                              }
                            </div>

                            <Price
                              amount={
                                amount(
                                  item.prices
                                    .price,
                                  item.prices
                                    .currency_minor_unit,
                                )
                              }
                              originalAmount={
                                amount(
                                  item.prices
                                    .regular_price,
                                  item.prices
                                    .currency_minor_unit,
                                ) >
                                amount(
                                  item.prices
                                    .price,
                                  item.prices
                                    .currency_minor_unit,
                                )
                                  ? amount(
                                      item.prices
                                        .regular_price,
                                      item.prices
                                        .currency_minor_unit,
                                    )
                                  : undefined
                              }
                              size="compact"
                            />
                          </div>

                          {
                            labels.length >
                            0
                              ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {
                                      labels.map(
                                        (
                                          label,
                                          index,
                                        ) => (
                                          <span
                                            key={
                                              `${label}-${index}`
                                            }
                                            className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-50)] px-3 py-1 text-xs font-bold text-[var(--ysim-color-brand-800)]"
                                          >
                                            {
                                              label
                                            }
                                          </span>
                                        ),
                                      )
                                    }
                                  </div>
                                )
                              : null
                          }

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="inline-flex items-center overflow-hidden rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)]">
                              <button
                                type="button"
                                aria-label="Giảm số lượng"
                                disabled={
                                  isPending ||
                                  item.quantity <=
                                    item.quantity_limits
                                      .minimum
                                }
                                onClick={() =>
                                  void cartState
                                    .updateQuantity(
                                      item.key,
                                      item.quantity -
                                        1,
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center hover:bg-[var(--ysim-color-surface-subtle)] disabled:opacity-40"
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <span className="flex h-10 min-w-12 items-center justify-center border-x border-[var(--ysim-color-border-strong)] px-3 text-sm font-bold">
                                {
                                  item.quantity
                                }
                              </span>

                              <button
                                type="button"
                                aria-label="Tăng số lượng"
                                disabled={
                                  isPending ||
                                  item.quantity >=
                                    item.quantity_limits
                                      .maximum
                                }
                                onClick={() =>
                                  void cartState
                                    .updateQuantity(
                                      item.key,
                                      item.quantity +
                                        1,
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center hover:bg-[var(--ysim-color-surface-subtle)] disabled:opacity-40"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={
                                isPending
                              }
                              onClick={() =>
                                void cartState
                                  .remove(
                                    item.key,
                                  )
                              }
                              className="inline-flex items-center gap-2 text-sm font-bold text-red-700 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  },
                )
              }
            </div>

            <aside className="h-fit rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-[var(--ysim-color-text)]">
                Tóm tắt đơn hàng
              </h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-[var(--ysim-color-text-muted)]">
                  <dt>Tạm tính</dt>
                  <dd className="font-semibold">
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
                        <div className="flex justify-between gap-4 text-[var(--ysim-color-brand-700)]">
                          <dt>Giảm giá</dt>
                          <dd className="font-bold">
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

              <div className="mt-5 border-t border-[var(--ysim-color-border)] pt-5">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-bold text-[var(--ysim-color-text)]">
                    Tổng cộng
                  </span>

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
              </div>

              <div className="mt-6 border-t border-[var(--ysim-color-border)] pt-5">
                <label
                  htmlFor="candidate-coupon"
                  className="flex items-center gap-2 text-sm font-bold text-[var(--ysim-color-text)]"
                >
                  <Tag className="h-4 w-4 text-[var(--ysim-color-brand-700)]" />
                  Mã giảm giá
                </label>

                <div className="mt-3 flex gap-2">
                  <input
                    id="candidate-coupon"
                    value={
                      couponCode
                    }
                    onChange={(
                      event,
                    ) =>
                      setCouponCode(
                        event.target.value,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        void applyCoupon();
                      }
                    }}
                    placeholder="Nhập mã"
                    className="min-h-11 min-w-0 flex-1 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] px-3 text-sm outline-none focus:border-[var(--ysim-color-brand-700)]"
                  />

                  <button
                    type="button"
                    disabled={
                      cartState.pending ===
                        "coupon" ||
                      !couponCode
                        .trim()
                    }
                    onClick={() =>
                      void applyCoupon()
                    }
                    className="min-h-11 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-[var(--ysim-color-brand-700)] disabled:opacity-40"
                  >
                    Áp dụng
                  </button>
                </div>

                {
                  cart.coupons.length >
                  0
                    ? (
                        <div className="mt-4 space-y-2">
                          {
                            cart.coupons.map(
                              (
                                coupon,
                              ) => (
                                <div
                                  key={
                                    coupon.code
                                  }
                                  className="flex items-center justify-between rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] px-3 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)]"
                                >
                                  <span>
                                    {
                                      coupon.code
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    aria-label={
                                      `Gỡ mã ${coupon.code}`
                                    }
                                    disabled={
                                      cartState.pending ===
                                      "coupon"
                                    }
                                    onClick={() =>
                                      void cartState
                                        .removeCoupon(
                                          coupon.code,
                                        )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ),
                            )
                          }
                        </div>
                      )
                    : null
                }
              </div>

              <Link
                href={
                  candidate.checkoutCandidatePath
                }
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-base font-bold text-white hover:bg-[var(--ysim-color-brand-800)]"
              >
                Thanh toán
              </Link>

              <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-soft)]">
                Package 29 sẽ nối Checkout với Order flow thật.
              </p>
            </aside>
          </div>
        </Container>
      </Section>

      <CartRouteCandidateNotice
        candidate={
          candidate
        }
      />
    </PageShell>
  );
}
