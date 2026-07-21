import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import type {
  CheckoutFormErrors,
} from "@/types/view-models/checkout-refactor";

export interface TermsConfirmationProps {
  acceptTerms: boolean;
  termsLabel: string;
  privacyLabel: string;
  errors:
    CheckoutFormErrors;
  onChange:
    (value: boolean) => void;
}

export function TermsConfirmation({
  acceptTerms,
  termsLabel,
  privacyLabel,
  errors,
  onChange,
}: TermsConfirmationProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-4">
        <input
          type="checkbox"
          checked={
            acceptTerms
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.checked,
            )
          }
          className="mt-1 h-4 w-4 accent-[var(--ysim-color-brand-700)]"
        />

        <span className="text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
          {termsLabel}
        </span>
      </label>

      {errors.acceptTerms ? (
        <p className="mt-2 text-sm font-semibold text-red-700">
          {
            errors.acceptTerms
          }
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p className="flex items-start gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-3 text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

          {privacyLabel}
        </p>

        <p className="flex items-start gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-3 text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

          Package này không lưu dữ liệu cá nhân và không gọi cổng thanh toán.
        </p>
      </div>
    </div>
  );
}
