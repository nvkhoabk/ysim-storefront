"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { formatMoney } from "@/lib/currency";
import type {
  WooCommerceCart,
  WooCommerceCartItem,
} from "@/lib/woocommerce/cart-types";

export function CartContent() {
  const [cart, setCart] =
    useState<WooCommerceCart | null>(null);

  const [couponCode, setCouponCode] = useState("");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [pendingItemKey, setPendingItemKey] =
    useState<string | null>(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  useEffect(() => {
	  let cancelled = false;

	  async function fetchCart() {
		try {
		  const response = await fetch("/api/cart", {
			cache: "no-store",
		  });

		  const data = await response.json();

		  if (!response.ok) {
			throw new Error(
			  data.message || "Không thể tải giỏ hàng.",
			);
		  }

		  if (!cancelled) {
			setCart(data as WooCommerceCart);
			setErrorMessage(null);
		  }
		} catch (error) {
		  if (!cancelled) {
			setErrorMessage(
			  error instanceof Error
				? error.message
				: "Không thể tải giỏ hàng.",
			);
		  }
		}
	  }

	  void fetchCart();

	  return () => {
		cancelled = true;
	  };
	}, []);

  function updateLocalCart(nextCart: WooCommerceCart) {
    setCart(nextCart);

    window.dispatchEvent(
      new CustomEvent("ysim-cart-updated", {
        detail: {
          itemsCount: nextCart.items_count,
        },
      }),
    );
  }

  async function updateQuantity(
    item: WooCommerceCartItem,
    nextQuantity: number,
  ) {
    if (
      nextQuantity < item.quantity_limits.minimum ||
      nextQuantity > item.quantity_limits.maximum
    ) {
      return;
    }

    setPendingItemKey(item.key);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemKey: item.key,
          quantity: nextQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể cập nhật số lượng.",
        );
      }

      updateLocalCart(data as WooCommerceCart);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật số lượng.",
      );
    } finally {
      setPendingItemKey(null);
    }
  }

  async function removeItem(itemKey: string) {
    setPendingItemKey(itemKey);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cart/items", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể xóa sản phẩm.",
        );
      }

      updateLocalCart(data as WooCommerceCart);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể xóa sản phẩm.",
      );
    } finally {
      setPendingItemKey(null);
    }
  }

  async function applyCoupon() {
    const normalizedCode = couponCode.trim();

    if (!normalizedCode) {
      return;
    }

    setCouponLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cart/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalizedCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể áp dụng mã giảm giá.",
        );
      }

      updateLocalCart(data as WooCommerceCart);
      setCouponCode("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể áp dụng mã giảm giá.",
      );
    } finally {
      setCouponLoading(false);
    }
  }

  async function removeCoupon(code: string) {
    setCouponLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cart/coupons", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể gỡ mã giảm giá.",
        );
      }

      updateLocalCart(data as WooCommerceCart);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể gỡ mã giảm giá.",
      );
    } finally {
      setCouponLoading(false);
    }
  }

  if (!cart && !errorMessage) {
    return (
      <div className="mt-10 flex items-center justify-center gap-3 py-16 text-slate-600">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />

        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          Giỏ hàng đang trống
        </h2>

        <p className="mt-2 text-slate-600">
          Hãy chọn một gói eSIM phù hợp với hành trình.
        </p>

        <Link
          href="/esim"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800"
        >
          Xem các gói eSIM
        </Link>
      </div>
    );
  }

  return (
    <>
      {errorMessage ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {cart.items.map((item) => {
            const image = item.images?.[0];
            const isPending =
              pendingItemKey === item.key;

            return (
              <article
                key={item.key}
                className="relative flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"
              >
                {isPending ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
                    <LoaderCircle className="h-6 w-6 animate-spin text-green-700" />
                  </div>
                ) : null}

                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-36">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || item.name}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">
                    {item.name}
                  </h2>

                  {item.sku ? (
                    <p className="mt-1 text-xs text-slate-500">
                      SKU: {item.sku}
                    </p>
                  ) : null}

                  <p className="mt-3 text-lg font-bold text-green-700">
                    {formatMoney({
                      amount: item.prices.price,
                      currencyCode:
                        item.prices.currency_code,
                      currencyMinorUnit:
                        item.prices.currency_minor_unit,
                    })}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-300">
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        onClick={() =>
                          void updateQuantity(
                            item,
                            item.quantity - 1,
                          )
                        }
                        disabled={
                          isPending ||
                          item.quantity <=
                            item.quantity_limits.minimum
                        }
                        className="flex h-10 w-10 items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="flex h-10 min-w-12 items-center justify-center border-x border-slate-300 px-3 text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label="Tăng số lượng"
                        onClick={() =>
                          void updateQuantity(
                            item,
                            item.quantity + 1,
                          )
                        }
                        disabled={
                          isPending ||
                          item.quantity >=
                            item.quantity_limits.maximum
                        }
                        className="flex h-10 w-10 items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void removeItem(item.key)
                      }
                      disabled={isPending}
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Tóm tắt đơn hàng
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính</span>

              <span>
                {formatMoney({
                  amount: cart.totals.total_items,
                  currencyCode:
                    cart.totals.currency_code,
                  currencyMinorUnit:
                    cart.totals.currency_minor_unit,
                })}
              </span>
            </div>

            {Number(cart.totals.total_discount) > 0 ? (
              <div className="flex justify-between text-green-700">
                <span>Giảm giá</span>

                <span>
                  -
                  {formatMoney({
                    amount:
                      cart.totals.total_discount,
                    currencyCode:
                      cart.totals.currency_code,
                    currencyMinorUnit:
                      cart.totals.currency_minor_unit,
                  })}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                Tổng cộng
              </span>

              <span className="text-xl font-bold text-green-700">
                {formatMoney({
                  amount: cart.totals.total_price,
                  currencyCode:
                    cart.totals.currency_code,
                  currencyMinorUnit:
                    cart.totals.currency_minor_unit,
                })}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <label
              htmlFor="coupon-code"
              className="flex items-center gap-2 text-sm font-semibold text-slate-800"
            >
              <Tag className="h-4 w-4 text-green-700" />
              Mã giảm giá
            </label>

            <div className="mt-3 flex gap-2">
              <input
                id="coupon-code"
                type="text"
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void applyCoupon();
                  }
                }}
                placeholder="Nhập mã"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => void applyCoupon()}
                disabled={
                  couponLoading || !couponCode.trim()
                }
                className="h-11 rounded-xl border border-green-700 px-4 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                {couponLoading ? "..." : "Áp dụng"}
              </button>
            </div>

            {cart.coupons.length > 0 ? (
              <div className="mt-4 space-y-2">
                {cart.coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
                  >
                    <span className="font-semibold">
                      {coupon.code}
                    </span>

                    <button
                      type="button"
                      aria-label={`Gỡ mã ${coupon.code}`}
                      onClick={() =>
                        void removeCoupon(coupon.code)
                      }
                      disabled={couponLoading}
                      className="rounded-md p-1 hover:bg-green-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-green-700 text-sm font-semibold text-white hover:bg-green-800"
          >
            Tiến hành thanh toán
          </Link>

          <Link
            href="/esim"
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tiếp tục mua hàng
          </Link>
        </aside>
      </div>
    </>
  );
}