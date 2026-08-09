import Link from "next/link";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  Mail,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  PaymentResultStatus,
  PaymentResultViewModel,
} from "@/types/view-models/payment-result";

import {
  cn,
} from "@/lib/ui/cn";

import {
  PaymentStatusBadge,
} from "./PaymentStatusBadge";

const statusIconMap:
  Record<
    PaymentResultStatus,
    LucideIcon
  > = {
    success:
      CheckCircle2,

    failed:
      CircleAlert,

    pending:
      Clock3,

    processing:
      LoaderCircle,
  };

const statusIconClassMap:
  Record<
    PaymentResultStatus,
    string
  > = {
    success:
      "bg-emerald-50 text-emerald-700",

    failed:
      "bg-red-50 text-red-700",

    pending:
      "bg-amber-50 text-amber-800",

    processing:
      "bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]",
  };

export interface PaymentResultCardProps {
  result:
    PaymentResultViewModel;
}

export function PaymentResultCard({
  result,
}: PaymentResultCardProps) {
  const StatusIcon =
    statusIconMap[
      result.status
    ];

  return (
    <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-md)] sm:p-8">
      <div className="text-center">
        <span
          className={cn(
            "mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full",
            statusIconClassMap[
              result.status
            ],
          )}
        >
          <StatusIcon
            className={cn(
              "h-8 w-8",
              result.status ===
              "processing"
                ? "animate-spin"
                : "",
            )}
          />
        </span>

        <div className="mt-5">
          <PaymentStatusBadge
            status={
              result.status
            }
            label={
              result.statusLabel
            }
          />
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[var(--ysim-color-text)] sm:text-4xl">
          {result.title}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--ysim-color-text-muted)]">
          {
            result.description
          }
        </p>
      </div>

      <dl className="mt-8 grid gap-4 rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Mã đơn hàng
          </dt>

          <dd className="mt-1 break-all font-bold text-[var(--ysim-color-text)]">
            {
              result.orderCode
            }
          </dd>
        </div>

        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Thời gian
          </dt>

          <dd className="mt-1 font-bold text-[var(--ysim-color-text)]">
            {
              result.createdAtLabel
            }
          </dd>
        </div>

        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Phương thức
          </dt>

          <dd className="mt-1 font-bold text-[var(--ysim-color-text)]">
            {
              result.paymentMethodLabel
            }
          </dd>
        </div>

        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Số tiền
          </dt>

          <dd className="mt-1">
            <Price
              amount={
                result.amount
              }
              size="compact"
            />
          </dd>
        </div>

        {result.providerReference ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
              Mã giao dịch
            </dt>

            <dd className="mt-1 break-all font-bold text-[var(--ysim-color-text)]">
              {
                result.providerReference
              }
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="flex items-start gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] p-4 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ysim-color-brand-700)]" />

          <span>
            eSIM được gửi tới:
            <strong className="mt-1 block break-all text-[var(--ysim-color-text)]">
              {
                result.recipientEmail
              }
            </strong>
          </span>
        </p>

        <p className="flex items-start gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] p-4 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
          <ReceiptText className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ysim-color-brand-700)]" />

          <span>
            Email đơn hàng:
            <strong className="mt-1 block break-all text-[var(--ysim-color-text)]">
              {
                result.customerEmail
              }
            </strong>
          </span>
        </p>
      </div>

      {result.note ? (
        <p
          id="payment-note"
          className="mt-6 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] px-4 py-3 text-sm font-semibold leading-relaxed text-[var(--ysim-color-brand-900)]"
        >
          {result.note}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {result.actions.map(
          (action) => (
            <Link
              key={
                `${action.label}-${action.href}`
              }
              href={
                action.href
              }
              className={cn(
                "inline-flex min-h-12 items-center justify-center rounded-[var(--ysim-radius-md)] px-6 text-sm font-bold transition-[transform,background-color,box-shadow]",
                action.variant ===
                "primary"
                  ? "bg-[var(--ysim-color-brand-700)] text-white hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-800)] hover:shadow-[var(--ysim-shadow-md)]"
                  : "border border-[var(--ysim-color-brand-700)] bg-white text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]",
              )}
            >
              {
                action.label
              }
            </Link>
          ),
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-[var(--ysim-color-text-soft)]">
        {result.supportText}
      </p>
    </div>
  );
}
