import {
  BadgeCheck,
  TicketPercent,
} from "lucide-react";

import type {
  AppliedCartCouponViewModel,
} from "@/types/view-models/cart-refactor";

export interface CartPromoCodeProps {
  value: string;
  appliedCoupon?:
    AppliedCartCouponViewModel;
  message?: string;
  onChange:
    (value: string) => void;
  onApply:
    () => void;
}

export function CartPromoCode({
  value,
  appliedCoupon,
  message,
  onChange,
  onApply,
}: CartPromoCodeProps) {
  return (
    <div>
      <label
        htmlFor="cart-promo-code"
        className="block text-sm font-bold text-[var(--ysim-color-text)]"
      >
        Mã ưu đãi
      </label>

      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <TicketPercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ysim-color-text-soft)]" />

          <input
            id="cart-promo-code"
            value={
              value
            }
            onChange={(
              event,
            ) =>
              onChange(
                event.target.value,
              )
            }
            placeholder="Nhập mã ưu đãi"
            className="min-h-11 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white pl-10 pr-3 text-sm font-semibold uppercase outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ysim-color-focus)_18%,transparent)]"
          />
        </div>

        <button
          type="button"
          onClick={
            onApply
          }
          className="min-h-11 shrink-0 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
        >
          Áp dụng
        </button>
      </div>

      <p className="mt-2 text-xs text-[var(--ysim-color-text-soft)]">
        Mã demo:{" "}
        <strong>
          YSIM10
        </strong>
      </p>

      {appliedCoupon ? (
        <p className="mt-3 flex items-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] px-3 py-2 text-sm font-semibold text-[var(--ysim-color-brand-800)]">
          <BadgeCheck className="h-4 w-4" />

          {
            appliedCoupon.label
          }{" "}
          đã được áp dụng.
        </p>
      ) : null}

      {message ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
