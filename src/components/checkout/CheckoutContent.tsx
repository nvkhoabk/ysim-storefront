"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, ShoppingBag } from "lucide-react";

import { CheckoutForm } from "./CheckoutForm";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";

import type { WooCommerceCart } from "@/lib/woocommerce/cart-types";
import type { WooCommerceCheckout } from "@/features/checkout/checkout.types";
import type { PaymentMethodOption } from "@/features/payments/payment.types";
import { useTransactionTranslations } from "@/i18n/transaction/useTransactionTranslations";
import { useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";

interface CheckoutApiResponse {
  cart: WooCommerceCart;
  checkout: WooCommerceCheckout;
  locale: "vi" | "en" | "lo";
  paymentMethods: PaymentMethodOption[];
}

export function CheckoutContent() {
  const t = useTransactionTranslations();
  const { locale } = useStorefrontLocale();
  const [checkoutData, setCheckoutData] = useState<CheckoutApiResponse | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCheckout() {
      try {
        setCheckoutData(null);
        setErrorMessage(null);

        const response = await fetch(
          `/api/checkout?locale=${encodeURIComponent(locale)}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || t("common.error"));
        }

        const nextCheckoutData = data as CheckoutApiResponse;
        if (nextCheckoutData.locale !== locale) {
          throw new Error(t("common.error"));
        }

        if (!cancelled) {
          setCheckoutData(nextCheckoutData);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : t("common.error"),
          );
        }
      }
    }

    void fetchCheckout();

    return () => {
      cancelled = true;
    };
  }, [locale, t]);

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
        {t("common.loading")}
      </div>
    );
  }

  if (checkoutData.cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />

        <h2 className="mt-4 text-xl font-semibold text-slate-950">
          {t("cart.emptyTitle")}
        </h2>

        <p className="mt-2 text-slate-600">{t("cart.emptyDescription")}</p>

        <Link
          href={localizeShellHref("/esim", locale)}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800"
        >
          {t("common.continue")}
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
