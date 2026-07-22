"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
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
  PaymentResultPageComposition,
} from "@/components/payment/refactor";

import {
  createVerifiedPaymentCandidate,
} from "@/features/payments/candidate/payment-candidate-client";

import {
  getPaymentProviderLabel,
} from "@/features/payments/candidate/payment-provider-presentation";

import {
  presentPaymentCandidateResult,
} from "@/features/payments/candidate/payment-result-presenter";

import type {
  PaymentProviderId,
} from "@/features/payments/payment.types";

import type {
  CheckoutOrderHandoff,
} from "@/types/view-models/checkout-route-candidate";

import type {
  PaymentCandidateConfigViewModel,
  PaymentCandidateStoredSession,
} from "@/types/view-models/payment-route-candidate";

import {
  PaymentCandidateDiagnostics,
} from "./PaymentCandidateDiagnostics";

const handoffStorageKey =
  "ysim-checkout-order-handoff";

const sessionStorageKey =
  "ysim-payment-candidate-session";

function providerLabel(
  provider:
    PaymentProviderId,
): string {
  return getPaymentProviderLabel(
    provider,
  );
}

function parseHandoff(
  value:
    | string
    | null,
): CheckoutOrderHandoff | null {
  if (!value) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        value,
      ) as
        CheckoutOrderHandoff;

    if (
      !parsed.orderId ||
      !parsed.orderKey ||
      !parsed.provider
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function parseStoredSession(
  value:
    | string
    | null,
): PaymentCandidateStoredSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        value,
      ) as
        PaymentCandidateStoredSession;

    return (
      parsed.session &&
      parsed.handoff &&
      parsed.order
    )
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function PaymentCandidateClient({
  config,
  resultOnly = false,
}: {
  config:
    PaymentCandidateConfigViewModel;
  resultOnly?: boolean;
}) {
  const [
    handoff,
    setHandoff,
  ] =
    useState<
      CheckoutOrderHandoff | null
    >(null);

  const [
    stored,
    setStored,
  ] =
    useState<
      PaymentCandidateStoredSession | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(
    () => {
      setHandoff(
        parseHandoff(
          window.sessionStorage.getItem(
            handoffStorageKey,
          ),
        ),
      );

      setStored(
        parseStoredSession(
          window.sessionStorage.getItem(
            sessionStorageKey,
          ),
        ),
      );

      setLoading(
        false,
      );
    },
    [],
  );

  const providerEnabled =
    useMemo(
      () =>
        handoff
          ? config.enabledProviders.includes(
              handoff.provider,
            )
          : false,
      [
        config.enabledProviders,
        handoff,
      ],
    );

  async function createPayment() {
    if (
      !handoff ||
      creating ||
      !providerEnabled
    ) {
      return;
    }

    setCreating(
      true,
    );
    setError(
      null,
    );

    try {
      const response =
        await createVerifiedPaymentCandidate({
          provider:
            handoff.provider,
          orderId:
            handoff.orderId,
          orderKey:
            handoff.orderKey,
        });

      const nextStored:
        PaymentCandidateStoredSession = {
          handoff,
          session:
            response.session,
          order:
            response.order,
          savedAt:
            new Date()
              .toISOString(),
        };

      window.sessionStorage.setItem(
        sessionStorageKey,
        JSON.stringify(
          nextStored,
        ),
      );

      window.dispatchEvent(
        new CustomEvent(
          "ysim:payment-candidate-created",
          {
            detail:
              nextStored,
          },
        ),
      );

      setStored(
        nextStored,
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof
          Error
          ? caught.message
          : "Không thể khởi tạo thanh toán.",
      );
    } finally {
      setCreating(
        false,
      );
    }
  }

  function clearSession() {
    window.sessionStorage.removeItem(
      sessionStorageKey,
    );
    setStored(
      null,
    );
    setError(
      null,
    );
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
            <div className="flex min-h-[25rem] items-center justify-center gap-3 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--ysim-color-brand-700)]" />
              Đang đọc Payment handoff...
            </div>
          </Container>
        </Section>

        <PaymentCandidateDiagnostics
          config={
            config
          }
        />
      </PageShell>
    );
  }

  if (
    resultOnly &&
    !stored
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container size="content">
            <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-9 text-center shadow-[var(--ysim-shadow-sm)]">
              <ReceiptText className="mx-auto h-12 w-12 text-[var(--ysim-color-brand-700)]" />

              <h1 className="mt-5 text-3xl font-bold text-[var(--ysim-color-text)]">
                Chưa có Payment Session
              </h1>

              <p className="mt-3 text-sm text-[var(--ysim-color-text-muted)]">
                Khởi tạo Payment Candidate trước khi mở trang kết quả.
              </p>

              <Link
                href="/ui-preview/payment-route-candidate"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-6 text-sm font-bold text-white"
              >
                Mở Payment Candidate
              </Link>
            </div>
          </Container>
        </Section>

        <PaymentCandidateDiagnostics
          config={
            config
          }
        />
      </PageShell>
    );
  }

  if (
    stored
  ) {
    const resultPage =
      presentPaymentCandidateResult({
        session:
          stored.session,
        handoff:
          stored.handoff,
      });

    return (
      <>
        <PaymentResultPageComposition
          page={
            resultPage
          }
          previewControls={
            <div className="flex flex-col gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--ysim-color-text)]">
                  Verified Payment Candidate
                </p>

                <p className="mt-1 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
                  Order #{stored.order.orderNumber} · {stored.order.customerEmailMasked}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {
                  stored.session
                    .redirectUrl
                    ? (
                        <a
                          href={
                            stored.session
                              .redirectUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-white"
                        >
                          Mở cổng thanh toán
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )
                    : null
                }

                <button
                  type="button"
                  onClick={
                    clearSession
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-4 text-sm font-bold text-[var(--ysim-color-text-muted)]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Tạo lại session
                </button>
              </div>
            </div>
          }
        />

        {
          stored.session.qr
            ?.image
            ? (
                <div className="fixed bottom-4 left-4 z-[65] rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-4 shadow-[var(--ysim-shadow-lg)]">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-700)]">
                    QR Payment
                  </p>

                  <div className="relative mt-3 h-48 w-48">
                    <Image
                      src={
                        stored.session
                          .qr.image
                      }
                      alt="QR thanh toán"
                      fill
                      sizes="192px"
                      className="object-contain"
                    />
                  </div>
                </div>
              )
            : null
        }

        <PaymentCandidateDiagnostics
          config={
            config
          }
        />
      </>
    );
  }

  if (!handoff) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container size="content">
            <div className="rounded-[var(--ysim-radius-xl)] border border-amber-200 bg-amber-50 p-9 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-700" />

              <h1 className="mt-5 text-3xl font-bold text-amber-950">
                Chưa có Order handoff
              </h1>

              <p className="mt-3 text-sm font-semibold leading-relaxed text-amber-900">
                Hãy tạo WooCommerce Order bằng Checkout Candidate trước.
              </p>

              <Link
                href="/ui-preview/checkout-route-candidate"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-amber-800 px-6 text-sm font-bold text-white"
              >
                Mở Checkout Candidate
              </Link>
            </div>
          </Container>
        </Section>

        <PaymentCandidateDiagnostics
          config={
            config
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      cartCount={0}
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
            Verified payment
          </p>

          <h1 className="mt-2 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
            {
              config.title
            }
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--ysim-color-text-muted)]">
            {
              config.description
            }
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container size="content">
          <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] sm:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                <CreditCard className="h-6 w-6" />
              </span>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                  Order handoff
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--ysim-color-text)]">
                  Đơn hàng #{handoff.orderNumber}
                </h2>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                  Phương thức
                </dt>
                <dd className="mt-1 font-bold text-[var(--ysim-color-text)]">
                  {
                    providerLabel(
                      handoff.provider,
                    )
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                  Số tiền tham chiếu
                </dt>
                <dd className="mt-1">
                  <Price
                    amount={
                      handoff.amount
                    }
                    size="compact"
                  />
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                  Email khách hàng
                </dt>
                <dd className="mt-1 break-all font-bold text-[var(--ysim-color-text)]">
                  {
                    handoff.customerEmail
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                  Email nhận eSIM
                </dt>
                <dd className="mt-1 break-all font-bold text-[var(--ysim-color-text)]">
                  {
                    handoff.recipientEmail
                  }
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] p-4">
              <p className="flex items-start gap-3 text-sm font-semibold leading-relaxed text-[var(--ysim-color-brand-900)]">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
                Amount hiển thị ở trên chỉ là tham chiếu. Server sẽ đọc lại total, currency và billing từ WooCommerce trước khi tạo Payment Session.
              </p>
            </div>

            {
              !providerEnabled
                ? (
                    <div className="mt-5 rounded-[var(--ysim-radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                      Provider {handoff.provider} chưa nằm trong `YSIM_PAYMENT_CANDIDATE_ENABLED_PROVIDERS`.
                    </div>
                  )
                : null
            }

            {
              error
                ? (
                    <div className="mt-5 rounded-[var(--ysim-radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                      {
                        error
                      }
                    </div>
                  )
                : null
            }

            <button
              type="button"
              disabled={
                creating ||
                !providerEnabled
              }
              onClick={() =>
                void createPayment()
              }
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-6 text-base font-bold text-white hover:bg-[var(--ysim-color-brand-800)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {
                creating
                  ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    )
                  : (
                      <ShieldCheck className="h-5 w-5" />
                    )
              }

              {
                creating
                  ? "Đang xác minh và khởi tạo..."
                  : "Khởi tạo thanh toán"
              }
            </button>

            <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-soft)]">
              Không có request Payment nào được gửi trước khi bạn bấm nút.
            </p>
          </div>
        </Container>
      </Section>

      <PaymentCandidateDiagnostics
        config={
          config
        }
      />
    </PageShell>
  );
}
