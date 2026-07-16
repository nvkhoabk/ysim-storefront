"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, ShoppingBag } from "lucide-react";

import { CheckoutForm } from "./CheckoutForm";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";

import type { WooCommerceCart } from "@/lib/woocommerce/cart-types";
import type { WooCommerceCheckout } from "@/features/checkout/checkout.types";
import type { PaymentMethodOption } from "@/features/payments/payment.types";

interface CheckoutApiResponse {
  cart: WooCommerceCart;
  checkout: WooCommerceCheckout;
  paymentMethods: PaymentMethodOption[];
}

export function CheckoutContent() {
  const [checkoutData, setCheckoutData] = useState<CheckoutApiResponse | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCheckout() {
      try {
        const response = await fetch("/api/checkout", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải trang thanh toán.");
        }

        if (!cancelled) {
          setCheckoutData(data as CheckoutApiResponse);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Không thể tải trang thanh toán.",
          );
        }
      }
    }

    void fetchCheckout();

    return () => {
      cancelled = true;
    };
  }, []);

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Đang chuẩn bị thanh toán...
      </div>
    );
  }

  if (checkoutData.cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />

        <h2 className="mt-4 text-xl font-semibold text-slate-950">
          Giỏ hàng đang trống
        </h2>

        <p className="mt-2 text-slate-600">
          Hãy chọn một gói eSIM trước khi thanh toán.
        </p>

        <Link
          href="/esim"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800"
        >
          Chọn gói eSIM
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <CheckoutForm paymentMethods={checkoutData.paymentMethods} />

      <CheckoutOrderSummary cart={checkoutData.cart} />
    </div>
  );
}
