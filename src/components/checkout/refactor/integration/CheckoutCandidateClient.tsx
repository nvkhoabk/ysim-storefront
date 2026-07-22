"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  CreditCard,
  Gift,
  Landmark,
  LoaderCircle,
  Mail,
  Phone,
  QrCode,
  RefreshCcw,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  CheckoutField,
} from "@/components/checkout/refactor/CheckoutField";

import {
  CheckoutSection,
} from "@/components/checkout/refactor/CheckoutSection";

import {
  hasCheckoutCandidateErrors,
  loadCheckoutCandidate,
  submitCheckoutCandidate,
  validateCheckoutCandidate,
} from "@/features/checkout/refactor";

import type {
  PaymentMethodOption,
  PaymentProviderId,
} from "@/features/payments/payment.types";

import {
  getPaymentProviderPresentationKind,
} from "@/features/payments/candidate/payment-provider-presentation";

import type {
  CheckoutCandidateApiResponse,
  CheckoutCandidateFormErrors,
  CheckoutCandidateFormState,
  CheckoutOrderHandoff,
  CheckoutRouteCandidateViewModel,
} from "@/types/view-models/checkout-route-candidate";

import {
  CheckoutCandidateNotice,
} from "./CheckoutCandidateNotice";

import {
  CheckoutCandidateOrderSummary,
} from "./CheckoutCandidateOrderSummary";

import {
  CheckoutCandidateSuccess,
} from "./CheckoutCandidateSuccess";

function renderPaymentIcon(
  providerId:
    PaymentProviderId,
) {
  const kind =
    getPaymentProviderPresentationKind(
      providerId,
    );

  if (
    kind ===
    "gpay"
  ) {
    return (
      <QrCode className="h-5 w-5" />
    );
  }

  if (
    kind ===
    "cash"
  ) {
    return (
      <Landmark className="h-5 w-5" />
    );
  }

  return (
    <CreditCard className="h-5 w-5" />
  );
}

function cartAmount(
  data:
    CheckoutCandidateApiResponse,
): {
  amount: number;
  currency: string;
} {
  const raw =
    Number(
      data.cart.totals
        .total_price,
    );

  const minorUnit =
    data.cart.totals
      .currency_minor_unit;

  return {
    amount:
      Number.isFinite(
        raw,
      )
        ? raw /
          Math.pow(
            10,
            minorUnit,
          )
        : 0,
    currency:
      data.cart.totals
        .currency_code ||
      "VND",
  };
}

function paymentMethodExists(
  methods:
    readonly PaymentMethodOption[],
  id:
    PaymentProviderId,
): boolean {
  return methods.some(
    (method) =>
      method.id ===
      id,
  );
}

export function CheckoutCandidateClient({
  showDiagnostics = true,
  candidate,
}: {
  candidate:
    CheckoutRouteCandidateViewModel;
  showDiagnostics?: boolean;
}) {
  const [
    data,
    setData,
  ] =
    useState<
      CheckoutCandidateApiResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState<
      string | null
    >(null);

  const [
    errors,
    setErrors,
  ] =
    useState<
      CheckoutCandidateFormErrors
    >({});

  const [
    handoff,
    setHandoff,
  ] =
    useState<
      CheckoutOrderHandoff | null
    >(null);

  const [
    form,
    setForm,
  ] =
    useState<
      CheckoutCandidateFormState
    >({
      fullName:
        "",
      email:
        "",
      phone:
        "",
      country:
        candidate.defaultCountry,
      purchaseFor:
        "self",
      recipientName:
        "",
      recipientEmail:
        "",
      paymentMethod:
        "cash_agent",
      customerNote:
        "",
      acceptTerms:
        false,
    });

  async function load() {
    setLoading(
      true,
    );
    setLoadError(
      null,
    );

    try {
      const nextData =
        await loadCheckoutCandidate();

      setData(
        nextData,
      );

      const preferred =
        paymentMethodExists(
          nextData.paymentMethods,
          form.paymentMethod,
        )
          ? form.paymentMethod
          : nextData.paymentMethods[0]
              ?.id;

      if (preferred) {
        setForm(
          (current) => ({
            ...current,
            paymentMethod:
              preferred,
          }),
        );
      }
    } catch (
      caught
    ) {
      setLoadError(
        caught instanceof
          Error
          ? caught.message
          : "Không thể tải Checkout.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(
    () => {
      void load();
    },
    [],
  );

  const recipientEmail =
    useMemo(
      () =>
        form.purchaseFor ===
        "gift"
          ? form.recipientEmail
          : form.email,
      [
        form.email,
        form.purchaseFor,
        form.recipientEmail,
      ],
    );

  async function submit() {
    if (
      submitting ||
      handoff
    ) {
      return;
    }

    const nextErrors =
      validateCheckoutCandidate(
        form,
      );

    setErrors(
      nextErrors,
    );

    if (
      hasCheckoutCandidateErrors(
        nextErrors,
      )
    ) {
      return;
    }

    if (!data) {
      return;
    }

    setSubmitting(
      true,
    );

    try {
      const result =
        await submitCheckoutCandidate(
          form,
        );

      const {
        amount,
        currency,
      } =
        cartAmount(
          data,
        );

      const nextHandoff:
        CheckoutOrderHandoff = {
          orderId:
            result.checkout
              .order_id,
          orderNumber:
            result.checkout
              .order_number ||
            String(
              result.checkout
                .order_id,
            ),
          orderKey:
            result.checkout
              .order_key,
          orderStatus:
            result.checkout
              .status,
          provider:
            result.selectedPaymentProvider,
          amount,
          currency,
          customerName:
            form.fullName,
          customerEmail:
            form.email,
          customerPhone:
            form.phone,
          recipientEmail,
          createdAt:
            new Date()
              .toISOString(),
        };

      window.sessionStorage.setItem(
        "ysim-checkout-order-handoff",
        JSON.stringify(
          nextHandoff,
        ),
      );

      window.dispatchEvent(
        new CustomEvent(
          "ysim:checkout-order-created",
          {
            detail:
              nextHandoff,
          },
        ),
      );

      setHandoff(
        nextHandoff,
      );

      window.dispatchEvent(
        new CustomEvent(
          "ysim-cart-updated",
          {
            detail: {
              itemsCount:
                0,
            },
          },
        ),
      );
    } catch (
      caught
    ) {
      setErrors({
        submit:
          caught instanceof
            Error
            ? caught.message
            : "Không thể tạo đơn hàng.",
      });
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  if (
    loading
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container>
            <div className="flex min-h-[26rem] items-center justify-center gap-3 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--ysim-color-brand-700)]" />
              Đang tải Checkout...
            </div>
          </Container>
        </Section>

        {showDiagnostics
          ? (
            <CheckoutCandidateNotice
                      candidate={
                        candidate
                      }        />
            )
          : null}
      </PageShell>
    );
  }

  if (
    loadError ||
    !data
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container size="content">
            <div className="rounded-[var(--ysim-radius-xl)] border border-red-200 bg-red-50 p-8 text-center">
              <h1 className="text-2xl font-bold text-red-900">
                Không thể tải Checkout
              </h1>

              <p className="mt-3 text-sm font-semibold text-red-800">
                {
                  loadError ||
                  "Checkout API không phản hồi."
                }
              </p>

              <button
                type="button"
                onClick={() =>
                  void load()
                }
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-red-700 px-5 text-sm font-bold text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Thử lại
              </button>
            </div>
          </Container>
        </Section>

        {showDiagnostics
          ? (
            <CheckoutCandidateNotice
                      candidate={
                        candidate
                      }        />
            )
          : null}
      </PageShell>
    );
  }

  if (
    handoff
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container>
            <CheckoutCandidateSuccess
              handoff={
                handoff
              }
            />
          </Container>
        </Section>

        {showDiagnostics
          ? (
            <CheckoutCandidateNotice
                      candidate={
                        candidate
                      }        />
            )
          : null}
      </PageShell>
    );
  }

  if (
    data.cart.items.length ===
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

              <p className="mt-3 text-sm text-[var(--ysim-color-text-muted)]">
                Hãy thêm một gói eSIM trước khi tạo đơn hàng.
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

        {showDiagnostics
          ? (
            <CheckoutCandidateNotice
                      candidate={
                        candidate
                      }        />
            )
          : null}
      </PageShell>
    );
  }

  return (
    <PageShell
      cartCount={
        data.cart
          .items_count
      }
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
            Checkout
          </p>

          <h1 className="mt-2 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
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
            errors.submit
              ? (
                  <div className="mb-5 rounded-[var(--ysim-radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                    {
                      errors.submit
                    }
                  </div>
                )
              : null
          }

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
            <div className="space-y-5">
              <CheckoutSection
                step={1}
                title="Thông tin khách hàng"
                description="Dùng để xử lý đơn hàng và liên hệ khi cần."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <CheckoutField
                      name="fullName"
                      label="Họ và tên"
                      autoComplete="name"
                      value={
                        form.fullName
                      }
                      error={
                        errors.fullName
                      }
                      icon={
                        <User />
                      }
                      placeholder="Nguyễn Văn A"
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          fullName:
                            event.target.value,
                        })
                      }
                    />
                  </div>

                  <CheckoutField
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={
                      form.email
                    }
                    error={
                      errors.email
                    }
                    icon={
                      <Mail />
                    }
                    placeholder="ban@example.com"
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        email:
                          event.target.value,
                      })
                    }
                  />

                  <CheckoutField
                    name="phone"
                    label="Số điện thoại"
                    type="tel"
                    autoComplete="tel"
                    value={
                      form.phone
                    }
                    error={
                      errors.phone
                    }
                    icon={
                      <Phone />
                    }
                    placeholder="+84 912 345 678"
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        phone:
                          event.target.value,
                      })
                    }
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
                      Quốc gia
                    </span>

                    <select
                      value={
                        form.country
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          country:
                            event.target.value,
                        })
                      }
                      className="min-h-12 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-3.5 text-sm font-semibold text-[var(--ysim-color-text)]"
                    >
                      <option value="VN">
                        Việt Nam
                      </option>
                      <option value="US">
                        Hoa Kỳ
                      </option>
                      <option value="JP">
                        Nhật Bản
                      </option>
                      <option value="KR">
                        Hàn Quốc
                      </option>
                      <option value="SG">
                        Singapore
                      </option>
                    </select>

                    {
                      errors.country
                        ? (
                            <span className="mt-2 block text-sm font-semibold text-red-700">
                              {
                                errors.country
                              }
                            </span>
                          )
                        : null
                    }
                  </label>
                </div>
              </CheckoutSection>

              <CheckoutSection
                step={2}
                title="Người nhận eSIM"
                description="QR eSIM sẽ được gửi tới email người nhận."
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] p-4">
                  <input
                    type="checkbox"
                    checked={
                      form.purchaseFor ===
                      "gift"
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        purchaseFor:
                          event.target.checked
                            ? "gift"
                            : "self",
                      })
                    }
                    className="mt-1 h-4 w-4 accent-[var(--ysim-color-brand-700)]"
                  />

                  <span className="flex gap-3">
                    <Gift className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ysim-color-brand-700)]" />

                    <span>
                      <strong className="block text-sm text-[var(--ysim-color-text)]">
                        Gửi eSIM cho người khác
                      </strong>

                      <span className="mt-1 block text-sm text-[var(--ysim-color-text-muted)]">
                        Nhập tên và email người nhận QR.
                      </span>
                    </span>
                  </span>
                </label>

                {
                  form.purchaseFor ===
                  "gift"
                    ? (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                          <CheckoutField
                            name="recipientName"
                            label="Tên người nhận"
                            value={
                              form.recipientName
                            }
                            error={
                              errors.recipientName
                            }
                            icon={
                              <User />
                            }
                            onChange={(
                              event,
                            ) =>
                              setForm({
                                ...form,
                                recipientName:
                                  event.target.value,
                              })
                            }
                          />

                          <CheckoutField
                            name="recipientEmail"
                            label="Email người nhận"
                            type="email"
                            value={
                              form.recipientEmail
                            }
                            error={
                              errors.recipientEmail
                            }
                            icon={
                              <Mail />
                            }
                            onChange={(
                              event,
                            ) =>
                              setForm({
                                ...form,
                                recipientEmail:
                                  event.target.value,
                              })
                            }
                          />
                        </div>
                      )
                    : (
                        <p className="mt-4 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
                          eSIM sẽ được gửi tới email khách hàng.
                        </p>
                      )
                }
              </CheckoutSection>

              <CheckoutSection
                step={3}
                title="Phương thức thanh toán"
                description="Package 29 chỉ lưu lựa chọn; chưa khởi tạo Payment Session."
              >
                <div
                  role="radiogroup"
                  aria-label="Phương thức thanh toán"
                  className="space-y-3"
                >
                  {
                    data.paymentMethods.map(
                      (method) => {
                        const active =
                          form.paymentMethod ===
                          method.id;

                        return (
                          <button
                            key={
                              method.id
                            }
                            type="button"
                            role="radio"
                            aria-checked={
                              active
                            }
                            onClick={() =>
                              setForm({
                                ...form,
                                paymentMethod:
                                  method.id,
                              })
                            }
                            className={`flex w-full items-start gap-4 rounded-[var(--ysim-radius-lg)] border p-4 text-left ${
                              active
                                ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-50)] ring-1 ring-[var(--ysim-color-brand-700)]"
                                : "border-[var(--ysim-color-border)] bg-white"
                            }`}
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-white text-[var(--ysim-color-brand-700)]">
                              {
                                renderPaymentIcon(
                                  method.id,
                                )
                              }
                            </span>

                            <span>
                              <strong className="block text-sm text-[var(--ysim-color-text)]">
                                {
                                  method.title
                                }
                              </strong>

                              <span className="mt-1 block text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                                {
                                  method.description
                                }
                              </span>
                            </span>
                          </button>
                        );
                      },
                    )
                  }
                </div>

                {
                  errors.paymentMethod
                    ? (
                        <p className="mt-2 text-sm font-semibold text-red-700">
                          {
                            errors.paymentMethod
                          }
                        </p>
                      )
                    : null
                }
              </CheckoutSection>

              <CheckoutSection
                step={4}
                title="Ghi chú và xác nhận"
                description="Kiểm tra thông tin trước khi tạo WooCommerce Order."
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
                    Ghi chú cho đơn hàng
                  </span>

                  <textarea
                    value={
                      form.customerNote
                    }
                    maxLength={500}
                    rows={4}
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        customerNote:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-3.5 py-3 text-sm font-semibold outline-none focus:border-[var(--ysim-color-brand-700)]"
                    placeholder="Yêu cầu hỗ trợ hoặc lưu ý..."
                  />
                </label>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={
                      form.acceptTerms
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        acceptTerms:
                          event.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 accent-[var(--ysim-color-brand-700)]"
                  />

                  <span className="text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    Tôi đồng ý với{" "}
                    <Link
                      href="/terms"
                      className="font-bold text-[var(--ysim-color-brand-700)]"
                    >
                      Điều khoản
                    </Link>
                    ,{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-bold text-[var(--ysim-color-brand-700)]"
                    >
                      Chính sách riêng tư
                    </Link>{" "}
                    và{" "}
                    <Link
                      href="/refund-policy"
                      className="font-bold text-[var(--ysim-color-brand-700)]"
                    >
                      Chính sách hoàn tiền
                    </Link>
                    .
                  </span>
                </label>

                {
                  errors.acceptTerms
                    ? (
                        <p className="mt-2 text-sm font-semibold text-red-700">
                          {
                            errors.acceptTerms
                          }
                        </p>
                      )
                    : null
                }
              </CheckoutSection>
            </div>

            <CheckoutCandidateOrderSummary
              cart={
                data.cart
              }
              submitting={
                submitting
              }
              onSubmit={() =>
                void submit()
              }
            />
          </div>
        </Container>
      </Section>

      {showDiagnostics
        ? (
          <CheckoutCandidateNotice
                  candidate={
                    candidate
                  }      />
          )
        : null}
    </PageShell>
  );
}
