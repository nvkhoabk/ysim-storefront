import Link from "next/link";

import {
  ArrowLeft,
  CreditCard,
  Headphones,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  OrderContactCards,
} from "@/components/payment/refactor/OrderContactCards";

import {
  OrderResultSummary,
} from "@/components/payment/refactor/OrderResultSummary";

import {
  PaymentStatusBadge,
} from "@/components/payment/refactor/PaymentStatusBadge";

import {
  PaymentTimeline,
} from "@/components/payment/refactor/PaymentTimeline";

import type {
  OrderResultPageViewModel,
} from "@/types/view-models/payment-result";

export function SecureOrderResultComposition({
  order,
  verifiedAt,
}: {
  order:
    OrderResultPageViewModel;
  verifiedAt: string;
}) {
  return (
    <PageShell
      cartCount={0}
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <Link
            href="/ui-preview/payment-result-route-candidate"
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--ysim-radius-md)] px-3 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-100)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại kết quả thanh toán
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
                <ShieldCheck className="h-4 w-4" />
                Đã xác minh quyền truy cập
              </p>

              <h1 className="mt-2 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
                {
                  order.orderCode
                }
              </h1>

              <p className="mt-3 text-sm text-[var(--ysim-color-text-muted)]">
                Tạo lúc{" "}
                {
                  order.createdAtLabel
                }
              </p>

              <p className="mt-1 text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                Xác minh lại lúc{" "}
                {
                  new Date(
                    verifiedAt,
                  ).toLocaleString(
                    "vi-VN",
                  )
                }
              </p>
            </div>

            <PaymentStatusBadge
              status={
                order.status
              }
              label={
                order.statusLabel
              }
              className="self-start sm:self-auto"
            />
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
            <div className="space-y-5">
              <OrderResultSummary
                order={
                  order
                }
              />

              <OrderContactCards
                order={
                  order
                }
              />
            </div>

            <div className="space-y-5">
              <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
                <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
                  Thanh toán
                </h2>

                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

                    <div>
                      <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                        Phương thức
                      </dt>

                      <dd className="mt-0.5 font-bold text-[var(--ysim-color-text)]">
                        {
                          order.payment
                            .methodLabel
                        }
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

                    <div>
                      <dt className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                        Mã giao dịch
                      </dt>

                      <dd className="mt-0.5 break-all font-bold text-[var(--ysim-color-text)]">
                        {
                          order.payment
                            .providerReference ||
                          "Chưa có"
                        }
                      </dd>
                    </div>
                  </div>
                </dl>
              </section>

              <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
                <SectionHeader
                  title="Tiến trình"
                />

                <PaymentTimeline
                  items={
                    order.timeline
                  }
                />
              </section>

              <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] p-5">
                <p className="flex items-start gap-3 text-sm font-semibold leading-relaxed text-[var(--ysim-color-brand-900)]">
                  <Headphones className="mt-0.5 h-5 w-5 shrink-0" />
                  {
                    order.supportText
                  }
                </p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
