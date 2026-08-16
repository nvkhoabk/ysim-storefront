import {
  Building2,
  CreditCard,
  QrCode,
  type LucideIcon,
} from "lucide-react";

import type {
  CheckoutFormErrors,
  CheckoutPaymentMethodIcon,
  CheckoutPaymentMethodId,
  CheckoutPaymentMethodViewModel,
} from "@/types/view-models/checkout-refactor";

import {
  cn,
} from "@/lib/ui/cn";

const iconMap:
  Record<
    CheckoutPaymentMethodIcon,
    LucideIcon
  > = {
    qr:
      QrCode,

    card:
      CreditCard,

    bank:
      Building2,
  };

export interface PaymentMethodSelectorProps {
  methods:
    readonly CheckoutPaymentMethodViewModel[];
  value:
    CheckoutPaymentMethodId;
  errors:
    CheckoutFormErrors;
  onChange:
    (
      value:
        CheckoutPaymentMethodId,
    ) => void;
}

export function PaymentMethodSelector({
  methods,
  value,
  errors,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Phương thức thanh toán"
        className="space-y-3"
      >
        {methods.map(
          (method) => {
            const Icon =
              iconMap[
                method.icon
              ];

            const active =
              value ===
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
                disabled={
                  !method.enabled
                }
                onClick={() =>
                  onChange(
                    method.id,
                  )
                }
                className={cn(
                  "flex w-full items-start gap-4 rounded-[var(--ysim-radius-lg)] border p-4 text-left transition-[transform,border-color,background-color,box-shadow]",
                  active
                    ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-50)] shadow-[var(--ysim-shadow-sm)]"
                    : "border-[var(--ysim-color-border)] bg-white hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)]",
                  !method.enabled
                    ? "cursor-not-allowed opacity-45"
                    : "",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)]",
                    active
                      ? "bg-[var(--ysim-color-brand-700)] text-white"
                      : "bg-[var(--ysim-color-surface-subtle)] text-[var(--ysim-color-brand-700)]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-[var(--ysim-color-text)]">
                      {method.label}
                    </strong>

                    {method.badge ? (
                      <span className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-100)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-800)]">
                        {
                          method.badge
                        }
                      </span>
                    ) : null}
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    {
                      method.description
                    }
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-2 h-4 w-4 shrink-0 rounded-full border-2",
                    active
                      ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] shadow-[inset_0_0_0_3px_white]"
                      : "border-[var(--ysim-color-border-strong)] bg-white",
                  )}
                />
              </button>
            );
          },
        )}
      </div>

      {errors.paymentMethod ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          {
            errors.paymentMethod
          }
        </p>
      ) : null}
    </div>
  );
}
