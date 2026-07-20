"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CreditCard,
  Gift,
  LoaderCircle,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type FieldErrors,
  useForm,
  useWatch,
} from "react-hook-form";

import {
  checkoutFormSchema,
  type CheckoutFormInput,
} from "@/features/checkout/checkout.validation";

import type {
  WooCommerceCheckout,
} from "@/features/checkout/checkout.types";

import type {
  PaymentMethodOption,
  PaymentSession,
} from "@/features/payments/payment.types";

interface CheckoutFormProps {
  paymentMethods: PaymentMethodOption[];
}

interface CheckoutApiResponse {
  checkout: WooCommerceCheckout;
  selectedPaymentProvider:
    PaymentMethodOption["id"];
}

interface PaymentErrorResponse {
  message?: string;

  error?: {
    message?: string;
  };
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

function getErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return fallback;
  }

  const record =
    payload as Record<string, unknown>;

  if (
    typeof record.message === "string" &&
    record.message.trim()
  ) {
    return record.message;
  }

  const error =
    record.error;

  if (
    typeof error === "object" &&
    error !== null &&
    !Array.isArray(error)
  ) {
    const errorRecord =
      error as Record<string, unknown>;

    if (
      typeof errorRecord.message ===
        "string" &&
      errorRecord.message.trim()
    ) {
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
): CheckoutAmount {
  const rawAmount =
    Number(totals.total_price);

  const minorUnit =
    Number(
      totals.currency_minor_unit,
    );

  if (
    !Number.isFinite(rawAmount) ||
    rawAmount <= 0
  ) {
    throw new Error(
      "Tổng tiền giỏ hàng không hợp lệ.",
    );
  }

  if (
    !Number.isInteger(minorUnit) ||
    minorUnit < 0
  ) {
    throw new Error(
      "Đơn vị tiền tệ của giỏ hàng không hợp lệ.",
    );
  }

  const amount =
    rawAmount /
    Math.pow(10, minorUnit);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Không thể xác định số tiền thanh toán.",
    );
  }

  const currency =
    totals.currency_code?.trim();

  if (!currency) {
    throw new Error(
      "Không xác định được loại tiền của giỏ hàng.",
    );
  }

  return {
    amount,
    currency:
      currency.toUpperCase(),
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
async function getCurrentCartAmount():
Promise<CheckoutAmount> {
  const response =
    await fetch(
      "/api/cart",
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache: "no-store",
      },
    );

  const payload: unknown =
    await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        "Không thể đọc thông tin giỏ hàng.",
      ),
    );
  }

  const cartData =
    payload as CartApiResponse;

  const totals =
    cartData.totals ??
    cartData.cart?.totals;

  if (!totals) {
    throw new Error(
      "Cart API không trả về thông tin tổng tiền.",
    );
  }

  return normalizeCartAmount(
    totals,
  );
}

export function CheckoutForm({
  paymentMethods,
}: CheckoutFormProps) {
  const router =
    useRouter();

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null,
    );

  const {
    register,
    handleSubmit,
    control,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<CheckoutFormInput>({
      resolver:
        zodResolver(
          checkoutFormSchema,
        ),

      defaultValues: {
        fullName: "",
        email: "",
        phone: "",
        country: "VN",

        purchaseFor:
          "self",

        recipientName: "",
        recipientEmail: "",

        paymentMethod:
          paymentMethods[0]?.id ??
          "gpay_gateway_all",

        customerNote: "",
        acceptTerms: false,
      },
    });

  const purchaseFor =
    useWatch({
      control,
      name: "purchaseFor",
    });

  async function submitCheckout(
    values: CheckoutFormInput,
  ) {
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
      const {
        amount,
        currency,
      } =
        await getCurrentCartAmount();

      /*
       * Bước 2:
       * Tạo WooCommerce Order từ cart hiện tại.
       */
      const checkoutResponse =
        await fetch(
          "/api/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                values,
              ),
          },
        );

      const checkoutData:
        unknown =
        await checkoutResponse
          .json();

      if (
        !checkoutResponse.ok
      ) {
        throw new Error(
          getErrorMessage(
            checkoutData,
            "Không thể tạo đơn hàng.",
          ),
        );
      }

      const {
        checkout,
        selectedPaymentProvider,
      } =
        checkoutData as
          CheckoutApiResponse;

      if (
        !checkout.order_id ||
        !checkout.order_key
      ) {
        throw new Error(
          "WooCommerce không trả về đầy đủ thông tin đơn hàng.",
        );
      }

      const orderNumber =
        checkout.order_number ??
        String(
          checkout.order_id,
        );

      /*
       * Bước 3:
       * Khởi tạo payment session theo provider.
       *
       * Không redirect theo redirect_url của WooCommerce
       * trước khi GPay init-order hoàn tất.
       */
      const paymentResponse =
        await fetch(
          "/api/payments/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                provider:
                  selectedPaymentProvider,

                orderId:
                  checkout.order_id,

                orderNumber,

                orderKey:
                  checkout.order_key,

                amount,
                currency,

                customerName:
                  values.fullName,

                customerEmail:
                  values.email,

                customerPhone:
                  values.phone,

                description:
                  `Thanh toán đơn YSim #${orderNumber}`,
              }),
          },
        );

      const paymentData:
        unknown =
        await paymentResponse
          .json();

      if (
        !paymentResponse.ok
      ) {
        throw new Error(
          getErrorMessage(
            paymentData,
            "Không thể khởi tạo thanh toán.",
          ),
        );
      }

      const paymentSession =
        paymentData as
          PaymentSession;

      /*
       * Bước 4:
       * Provider ngoài như GPay trả redirectUrl riêng.
       * URL này phải được ưu tiên trước WooCommerce
       * payment_result.redirect_url.
       */
      if (
        paymentSession.redirectUrl
      ) {
        if (
          paymentSession.provider
            .startsWith(
              "gpay_gateway_",
            )
        ) {
          if (
            !paymentSession
              .providerBillId
          ) {
            throw new Error(
              "GPay không trả về mã hóa đơn thanh toán.",
            );
          }

          sessionStorage.setItem(
            "ysim:gpay:pending-payment",

            JSON.stringify({
              orderId:
                paymentSession
                  .orderId,

              orderNumber:
                paymentSession
                  .orderNumber,

              orderKey:
                checkout
                  .order_key,

              provider:
                paymentSession
                  .provider,

              gpayBillId:
                paymentSession
                  .providerBillId,

              merchantOrderId:
                paymentSession
                  .merchantTransactionId,

              billUrl:
                paymentSession
                  .redirectUrl,

              expiresAt:
                paymentSession
                  .expiresAt,

              amount,
              currency,

              createdAt:
                new Date()
                  .toISOString(),
            }),
          );
        }

        window.location.assign(
          paymentSession
            .redirectUrl,
        );

        return;
      }

      /*
       * Provider GPay bắt buộc phải trả redirectUrl.
       * Không fallback sang trang order-received của WooCommerce,
       * vì điều đó sẽ che lỗi init-order.
       */
      if (
        selectedPaymentProvider
          .startsWith(
            "gpay_gateway_",
          )
      ) {
        throw new Error(
          "GPay không trả về đường dẫn thanh toán.",
        );
      }

      /*
       * Chỉ dùng WooCommerce redirect_url với provider
       * không có redirect riêng.
       */
      const wooRedirectUrl =
        checkout
          .payment_result
          ?.redirect_url;

      if (wooRedirectUrl) {
        window.location.assign(
          wooRedirectUrl,
        );

        return;
      }

      /*
       * Provider không redirect sử dụng trang trạng thái chung.
       */
      router.push(
        `/checkout/payment/${checkout.order_id}?key=${encodeURIComponent(
          checkout.order_key,
        )}`,
      );
    } catch (error) {
      console.error(
        "Checkout submit failed:",
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng.",
      );
    }
  }

  function handleInvalid(
    formErrors:
      FieldErrors<CheckoutFormInput>,
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
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
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
              {...register(
                "fullName",
              )}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError
              message={
                errors
                  .fullName
                  ?.message
              }
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-800">
              Email nhận eSIM *
            </span>

            <input
              type="email"
              autoComplete="email"
              {...register(
                "email",
              )}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError
              message={
                errors.email
                  ?.message
              }
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-800">
              Số điện thoại *
            </span>

            <input
              type="tel"
              autoComplete="tel"
              {...register(
                "phone",
              )}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <FieldError
              message={
                errors.phone
                  ?.message
              }
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              Quốc gia *
            </span>

            <select
              {...register(
                "country",
              )}
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
              message={
                errors.country
                  ?.message
              }
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
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
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
              {...register(
                "purchaseFor",
              )}
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
              {...register(
                "purchaseFor",
              )}
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

        {purchaseFor ===
        "gift" ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-slate-800">
                Tên người nhận *
              </span>

              <input
                type="text"
                {...register(
                  "recipientName",
                )}
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <FieldError
                message={
                  errors
                    .recipientName
                    ?.message
                }
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-slate-800">
                Email người nhận *
              </span>

              <input
                type="email"
                {...register(
                  "recipientEmail",
                )}
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <FieldError
                message={
                  errors
                    .recipientEmail
                    ?.message
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
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
              Bước 2
            </p>

            <h2 className="text-xl font-semibold text-slate-950">
              Phương thức thanh toán
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {paymentMethods.map(
            (method) => (
              <label
                key={method.id}
                className="block cursor-pointer"
              >
                <input
                  type="radio"
                  value={
                    method.id
                  }
                  {...register(
                    "paymentMethod",
                  )}
                  className="peer sr-only"
                />

                <span className="flex items-start gap-4 rounded-xl border border-slate-300 p-4 transition peer-checked:border-green-700 peer-checked:bg-green-50">
                  <span className="mt-1 h-4 w-4 rounded-full border-4 border-white bg-slate-300 ring-1 ring-slate-300 peer-checked:bg-green-700" />

                  <span>
                    <strong className="block text-sm text-slate-900">
                      {
                        method.title
                      }
                    </strong>

                    <span className="mt-1 block text-sm leading-6 text-slate-500">
                      {
                        method.description
                      }
                    </span>
                  </span>
                </span>
              </label>
            ),
          )}
        </div>

        <FieldError
          message={
            errors
              .paymentMethod
              ?.message
          }
        />

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-800">
            Ghi chú đơn hàng
          </span>

          <textarea
            rows={3}
            {...register(
              "customerNote",
            )}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register(
              "acceptTerms",
            )}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
          />

          <span className="text-sm leading-6 text-slate-600">
            Tôi xác nhận thiết bị hỗ trợ eSIM và đồng ý với điều khoản sử dụng,
            chính sách thanh toán và hoàn tiền của YSim.
          </span>
        </label>

        <FieldError
          message={
            errors
              .acceptTerms
              ?.message
          }
        />

        {submitError ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            isSubmitting
          }
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
