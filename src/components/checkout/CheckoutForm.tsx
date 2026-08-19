"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CreditCard, Gift, LoaderCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type FieldErrors, useForm, useWatch } from "react-hook-form";

import {
  checkoutFormSchema,
  type CheckoutFormFields,
  type CheckoutFormInput,
} from "@/features/checkout/checkout.validation";

import type { WooCommerceCheckout } from "@/features/checkout/checkout.types";

import type {
  PaymentMethodOption,
  PaymentSession,
} from "@/features/payments/payment.types";

import { VirtualAccountPaymentPanel } from "./VirtualAccountPaymentPanel";
import { useTransactionTranslations } from "@/i18n/transaction/useTransactionTranslations";
import { useStorefrontLocale } from "@/i18n/runtime";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import type { TransactionTranslator } from "@/i18n/transaction/transaction.types";

interface CheckoutFormProps {
  paymentMethods: PaymentMethodOption[];
}

interface CheckoutApiResponse {
  checkout: WooCommerceCheckout;
  selectedLocale: "vi" | "en" | "lo";
  selectedPaymentProvider: PaymentMethodOption["id"];
}

interface CartTotalsResponse {
  total_price: string;
  currency_code: string;
  currency_minor_unit: number;
}

interface CartApiResponse {
  totals?: CartTotalsResponse;

  cart?: {
    totals?: CartTotalsResponse;
  };

  error?: {
    message?: string;
  };

  message?: string;
}

interface CheckoutAmount {
  amount: number;
  currency: string;
}

function checkoutPaymentProviderId(
  providerId: PaymentMethodOption["id"] | undefined,
): CheckoutFormInput["paymentMethod"] | null {
  if (
    providerId === "gpay_virtual_account" ||
    providerId === "gpay_gateway_all"
  ) {
    return providerId;
  }

  return null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return fallback;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  const error = record.error;

  if (typeof error === "object" && error !== null && !Array.isArray(error)) {
    const errorRecord = error as Record<string, unknown>;

    if (typeof errorRecord.message === "string" && errorRecord.message.trim()) {
      return errorRecord.message;
    }
  }

  return fallback;
}

/**
 * Chuyển tổng tiền WooCommerce từ minor units
 * sang đơn vị tiền thực mà GPay cần.
 *
 * Ví dụ:
 *
 * VND:
 * total_price = "125000"
 * currency_minor_unit = 0
 * amount = 125000
 *
 * USD:
 * total_price = "1299"
 * currency_minor_unit = 2
 * amount = 12.99
 */
function normalizeCartAmount(
  totals: CartTotalsResponse,
  t: TransactionTranslator,
): CheckoutAmount {
  const rawAmount = Number(totals.total_price);

  const minorUnit = Number(totals.currency_minor_unit);

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new Error(t("common.error"));
  }

  if (!Number.isInteger(minorUnit) || minorUnit < 0) {
    throw new Error(t("common.error"));
  }

  const amount = rawAmount / Math.pow(10, minorUnit);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(t("common.error"));
  }

  const currency = totals.currency_code?.trim();

  if (!currency) {
    throw new Error(t("common.error"));
  }

  return {
    amount,
    currency: currency.toUpperCase(),
  };
}

/**
 * Lấy tổng tiền từ Cart API trước khi WooCommerce
 * tạo Order.
 *
 * Không dùng checkout.__experimentalCart vì
 * WooCommerce Checkout API có thể trả trường đó
 * bằng null sau khi order đã được tạo.
 */
async function getCurrentCartAmount(
  t: TransactionTranslator,
): Promise<CheckoutAmount> {
  const response = await fetch("/api/cart", {
    method: "GET",

    headers: {
      Accept: "application/json",
    },

    cache: "no-store",
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, t("common.error")));
  }

  const cartData = payload as CartApiResponse;

  const totals = cartData.totals ?? cartData.cart?.totals;

  if (!totals) {
    throw new Error(t("common.error"));
  }

  return normalizeCartAmount(totals, t);
}

export function CheckoutForm({ paymentMethods }: CheckoutFormProps) {
  const router = useRouter();
  const t = useTransactionTranslations();
  const { locale } = useStorefrontLocale();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [virtualAccountPayment, setVirtualAccountPayment] = useState<{
    session: PaymentSession;
    orderKey: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,

    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckoutFormFields, unknown, CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),

    defaultValues: {
      locale,
      fullName: "",
      email: "",
      phone: "",
      country: "VN",

      purchaseFor: "self",

      recipientName: "",
      recipientEmail: "",

      paymentMethod:
        checkoutPaymentProviderId(paymentMethods[0]?.id) ??
        "gpay_virtual_account",

      customerNote: "",
      acceptTerms: false,
    },
  });

  const purchaseFor = useWatch({
    control,
    name: "purchaseFor",
  });

  const paymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  useEffect(() => {
    setValue("locale", locale);

    const nextPaymentMethod = checkoutPaymentProviderId(
      paymentMethods[0]?.id,
    );

    if (
      !paymentMethods.some((method) => method.id === paymentMethod) &&
      nextPaymentMethod
    ) {
      setValue("paymentMethod", nextPaymentMethod, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [locale, paymentMethod, paymentMethods, setValue]);

  async function submitCheckout(values: CheckoutFormInput) {
    setSubmitError(null);

    try {
      /*
       * Bước 1:
       * Đọc tổng tiền từ cart hiện tại.
       *
       * Phải thực hiện trước khi gọi Checkout API,
       * vì sau khi WooCommerce tạo Order,
       * __experimentalCart có thể bằng null.
       */
      const { amount, currency } = await getCurrentCartAmount(t);

      /*
       * Bước 2:
       * Tạo WooCommerce Order từ cart hiện tại.
       */
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(values),
      });

      const checkoutData: unknown = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(getErrorMessage(checkoutData, t("common.error")));
      }

      const { checkout, selectedLocale, selectedPaymentProvider } =
        checkoutData as CheckoutApiResponse;

      if (!checkout.order_id || !checkout.order_key) {
        throw new Error(t("common.error"));
      }

      const orderNumber = checkout.order_number ?? String(checkout.order_id);

      /*
       * Bước 3:
       * Khởi tạo payment session theo provider.
       *
       * Không redirect theo redirect_url của WooCommerce
       * trước khi GPay init-order hoàn tất.
       */
      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          provider: selectedPaymentProvider,
          locale: selectedLocale,

          orderId: checkout.order_id,

          orderNumber,

          orderKey: checkout.order_key,

          amount,
          currency,

          customerName: values.fullName,

          customerEmail: values.email,

          customerPhone: values.phone,

          description: `YSim order #${orderNumber}`,
        }),
      });

      const paymentData: unknown = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(getErrorMessage(paymentData, t("common.error")));
      }

      const paymentSession = paymentData as PaymentSession;

      if (paymentSession.provider === "gpay_virtual_account") {
        sessionStorage.setItem(
          "ysim:gpay-va:pending-payment",
          JSON.stringify({
            session: paymentSession,
            orderKey: checkout.order_key,
            createdAt: new Date().toISOString(),
          }),
        );

        setVirtualAccountPayment({
          session: paymentSession,
          orderKey: checkout.order_key,
        });

        return;
      }

      /*
       * Bước 4:
       * Provider ngoài như GPay trả redirectUrl riêng.
       * URL này phải được ưu tiên trước WooCommerce
       * payment_result.redirect_url.
       */
      if (paymentSession.redirectUrl) {
        if (paymentSession.provider.startsWith("gpay_gateway_")) {
          if (!paymentSession.providerBillId) {
            throw new Error(t("common.error"));
          }

          sessionStorage.setItem(
            "ysim:gpay:pending-payment",

            JSON.stringify({
              orderId: paymentSession.orderId,

              orderNumber: paymentSession.orderNumber,

              orderKey: checkout.order_key,

              provider: paymentSession.provider,

              gpayBillId: paymentSession.providerBillId,

              merchantOrderId: paymentSession.merchantTransactionId,

              billUrl: paymentSession.redirectUrl,

              expiresAt: paymentSession.expiresAt,

              amount,
              currency,

              createdAt: new Date().toISOString(),
            }),
          );
        }

        window.location.assign(paymentSession.redirectUrl);

        return;
      }

      /*
       * Provider GPay bắt buộc phải trả redirectUrl.
       * Không fallback sang trang order-received của WooCommerce,
       * vì điều đó sẽ che lỗi init-order.
       */
      if (selectedPaymentProvider.startsWith("gpay_gateway_")) {
        throw new Error(t("common.error"));
      }

      /*
       * Chỉ dùng WooCommerce redirect_url với provider
       * không có redirect riêng.
       */
      const wooRedirectUrl = checkout.payment_result?.redirect_url;

      if (wooRedirectUrl) {
        window.location.assign(wooRedirectUrl);

        return;
      }

      /*
       * Provider không redirect sử dụng trang trạng thái chung.
       */
      router.push(
        localizeShellHref(
          `/checkout/payment/${checkout.order_id}?key=${encodeURIComponent(
            checkout.order_key,
          )}`,
          locale,
        ),
      );
    } catch (error) {
      console.error("Checkout submit failed:", error);

      setSubmitError(
        error instanceof Error ? error.message : t("common.error"),
      );
    }
  }

  function handleInvalid(formErrors: FieldErrors<CheckoutFormFields>) {
    console.error("Checkout validation errors:", formErrors);
  }

  if (virtualAccountPayment) {
    return (
      <VirtualAccountPaymentPanel
        session={virtualAccountPayment.session}
        orderKey={virtualAccountPayment.orderKey}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submitCheckout, handleInvalid)}
      className="space-y-6"
    >
      <input type="hidden" {...register("locale")} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
            <User className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
              {t("checkout.step1")}
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              {t("checkout.buyerTitle")}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              {t("checkout.fullNameRequired")}
            </span>

            <input
              type="text"
              autoComplete="name"
              {...register("fullName")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError message={errors.fullName?.message} />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-800">
              {t("checkout.emailRequired")}
            </span>

            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError message={errors.email?.message} />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-800">
              {t("checkout.phoneRequired")}
            </span>

            <input
              type="tel"
              autoComplete="tel"
              {...register("phone")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError message={errors.phone?.message} />
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              {t("checkout.countryRequired")}
            </span>

            <select
              {...register("country")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="VN">{t("checkout.country.VN")}</option>

              <option value="PH">{t("checkout.country.PH")}</option>

              <option value="TH">{t("checkout.country.TH")}</option>

              <option value="SG">{t("checkout.country.SG")}</option>

              <option value="MY">{t("checkout.country.MY")}</option>

              <option value="ID">{t("checkout.country.ID")}</option>
            </select>

            <FieldError message={errors.country?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
            <Gift className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
              {t("checkout.recipientEyebrow")}
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              {t("checkout.recipientQuestion")}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="cursor-pointer">
            <input
              type="radio"
              value="self"
              {...register("purchaseFor")}
              className="peer sr-only"
            />

            <span className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-300 p-4 transition peer-checked:border-green-700 peer-checked:bg-green-50">
              <Check className="h-5 w-5 text-green-700" />

              <span>
                <strong className="block text-sm text-slate-900">
                  {t("checkout.selfTitle")}
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  {t("checkout.selfDescription")}
                </span>
              </span>
            </span>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              value="gift"
              {...register("purchaseFor")}
              className="peer sr-only"
            />

            <span className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-300 p-4 transition peer-checked:border-green-700 peer-checked:bg-green-50">
              <Gift className="h-5 w-5 text-green-700" />

              <span>
                <strong className="block text-sm text-slate-900">
                  {t("checkout.giftTitle")}
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  {t("checkout.giftDescription")}
                </span>
              </span>
            </span>
          </label>
        </div>

        {purchaseFor === "gift" ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-slate-800">
                {t("checkout.recipientNameRequired")}
              </span>

              <input
                type="text"
                {...register("recipientName")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <FieldError message={errors.recipientName?.message} />
            </label>

            <label>
              <span className="text-sm font-semibold text-slate-800">
                {t("checkout.recipientEmailRequired")}
              </span>

              <input
                type="email"
                {...register("recipientEmail")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <FieldError message={errors.recipientEmail?.message} />
            </label>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
            <CreditCard className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
              {t("checkout.step2")}
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              {t("payment.eyebrow")}
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {paymentMethods.map((method) => (
            <label key={method.id} className="block cursor-pointer">
              <input
                type="radio"
                value={method.id}
                {...register("paymentMethod")}
                className="peer sr-only"
              />

              <span className="flex items-start gap-4 rounded-xl border border-slate-300 p-4 transition peer-checked:border-green-700 peer-checked:bg-green-50">
                <span className="mt-1 h-4 w-4 rounded-full border-4 border-white bg-slate-300 ring-1 ring-slate-300 peer-checked:bg-green-700" />

                <span>
                  <strong className="block text-sm text-slate-900">
                    {method.title}
                  </strong>

                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    {method.description}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>

        {paymentMethod === "gpay_virtual_account" ? (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            {t("checkout.virtualAccountNotice")}
          </div>
        ) : null}

        <FieldError message={errors.paymentMethod?.message} />

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-800">
            {t("checkout.noteLabel")}
          </span>

          <textarea
            rows={3}
            {...register("customerNote")}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
          />

          <span className="text-sm leading-6 text-slate-600">
            {t("checkout.terms")}
          </span>
        </label>

        <FieldError message={errors.acceptTerms?.message} />

        {submitError ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              {t("checkout.submitting")}
            </>
          ) : (
            t("checkout.submit")
          )}
        </button>
      </section>
    </form>
  );
}
