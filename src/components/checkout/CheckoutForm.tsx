"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Gift,
  LoaderCircle,
  User,
} from "lucide-react";
import {
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  checkoutFormSchema,
  type CheckoutFormInput,
} from "@/features/checkout/checkout.validation";
import type { WooCommerceCheckout } from "@/features/checkout/checkout.types";

interface PaymentMethodOption {
  id: string;
  title: string;
  description: string;
}

interface CheckoutFormProps {
  paymentMethods: PaymentMethodOption[];
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}

export function CheckoutForm({
  paymentMethods,
}: CheckoutFormProps) {
  const router = useRouter();

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "VN",

      purchaseFor: "self",

      recipientName: "",
      recipientEmail: "",

      paymentMethod:
        paymentMethods[0]?.id ?? "",

      customerNote: "",
      acceptTerms: false,
    },
  });

  const purchaseFor = useWatch({
	  control,
	  name: "purchaseFor",
	});

  async function submitCheckout(
    values: CheckoutFormInput,
  ) {
    setSubmitError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không thể tạo đơn hàng.",
        );
      }

      const checkout =
        data as WooCommerceCheckout;

      const redirectUrl =
        checkout.payment_result?.redirect_url;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      router.push(
        `/checkout/success?order=${encodeURIComponent(
          checkout.order_number ??
            String(checkout.order_id),
        )}&key=${encodeURIComponent(
          checkout.order_key,
        )}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng.",
      );
    }
  }

  function handleInvalid(
    formErrors: FieldErrors<CheckoutFormInput>,
  ) {
    console.error(
      "Checkout validation errors:",
      formErrors,
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        submitCheckout,
        handleInvalid,
      )}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
            <User className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Bước 1
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              Thông tin người mua
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              Họ và tên *
            </span>

            <input
              type="text"
              autoComplete="name"
              {...register("fullName")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError
              message={errors.fullName?.message}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-800">
              Email nhận eSIM *
            </span>

            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError
              message={errors.email?.message}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-800">
              Số điện thoại *
            </span>

            <input
              type="tel"
              autoComplete="tel"
              {...register("phone")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError
              message={errors.phone?.message}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              Quốc gia *
            </span>

            <select
              {...register("country")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="VN">
                Việt Nam
              </option>
              <option value="PH">
                Philippines
              </option>
              <option value="TH">
                Thái Lan
              </option>
              <option value="SG">
                Singapore
              </option>
              <option value="MY">
                Malaysia
              </option>
              <option value="ID">
                Indonesia
              </option>
            </select>

            <FieldError
              message={errors.country?.message}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
            <Gift className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Người sử dụng
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              eSIM dành cho ai?
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
                  Mua cho chính tôi
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  QR gửi về email người mua
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
                  Mua tặng người khác
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  Gửi QR đến người nhận
                </span>
              </span>
            </span>
          </label>
        </div>

        {purchaseFor === "gift" ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-slate-800">
                Tên người nhận *
              </span>

              <input
                type="text"
                {...register("recipientName")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <FieldError
                message={
                  errors.recipientName?.message
                }
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-slate-800">
                Email người nhận *
              </span>

              <input
                type="email"
                {...register("recipientEmail")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <FieldError
                message={
                  errors.recipientEmail?.message
                }
              />
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
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Bước 2
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              Phương thức thanh toán
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className="block cursor-pointer"
            >
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

        <FieldError
          message={errors.paymentMethod?.message}
        />

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-800">
            Ghi chú đơn hàng
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
            Tôi xác nhận thiết bị hỗ trợ eSIM và đồng ý với
            điều khoản sử dụng, chính sách thanh toán và hoàn
            tiền của YSim.
          </span>
        </label>

        <FieldError
          message={errors.acceptTerms?.message}
        />

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
              Đang tạo đơn hàng...
            </>
          ) : (
            "Đặt hàng và thanh toán"
          )}
        </button>
      </section>
    </form>
  );
}