import Link from "next/link";

import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  AppliedCartCouponViewModel,
  CartTotalsViewModel,
} from "@/types/view-models/cart-refactor";

import {
  CartPromoCode,
} from "./CartPromoCode";

export interface CartSummaryProps {
  totals:
    CartTotalsViewModel;
  canCheckout: boolean;
  unavailableLineCount: number;
  promoValue: string;
  appliedCoupon?:
    AppliedCartCouponViewModel;
  promoMessage?: string;
  onPromoChange:
    (value: string) => void;
  onApplyPromo:
    () => void;
}

export function CartSummary({
  totals,
  canCheckout,
  unavailableLineCount,
  promoValue,
  appliedCoupon,
  promoMessage,
  onPromoChange,
  onApplyPromo,
}: CartSummaryProps) {
  return (
    <aside className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-md)] lg:sticky lg:top-28 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
        Tóm tắt đơn hàng
      </h2>

      <div className="mt-5">
        <CartPromoCode
          value={
            promoValue
          }
          appliedCoupon={
            appliedCoupon
          }
          message={
            promoMessage
          }
          onChange={
            onPromoChange
          }
          onApply={
            onApplyPromo
          }
        />
      </div>

      <dl className="mt-6 space-y-3 border-t border-[var(--ysim-color-border)] pt-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Tạm tính
          </dt>

          <dd className="font-bold text-[var(--ysim-color-text)]">
            <Price
              amount={
                totals.subtotal
              }
              size="compact"
            />
          </dd>
        </div>

        {totals.productDiscount >
        0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--ysim-color-text-muted)]">
              Giảm giá sản phẩm
            </dt>

            <dd className="font-bold text-[var(--ysim-color-brand-700)]">
              -{" "}
              <Price
                amount={
                  totals.productDiscount
                }
                size="compact"
              />
            </dd>
          </div>
        ) : null}

        {totals.couponDiscount >
        0 ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--ysim-color-text-muted)]">
              Mã ưu đãi
            </dt>

            <dd className="font-bold text-[var(--ysim-color-brand-700)]">
              -{" "}
              <Price
                amount={
                  totals.couponDiscount
                }
                size="compact"
              />
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--ysim-color-border)] pt-5">
        <div>
          <p className="text-sm font-bold text-[var(--ysim-color-text)]">
            Tổng cộng
          </p>

          <p className="mt-1 text-xs text-[var(--ysim-color-text-soft)]">
            Đã bao gồm các ưu đãi
          </p>
        </div>

        <Price
          amount={
            totals.total
          }
        />
      </div>

      {canCheckout ? (
        <Link
          href="/checkout"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 py-3 text-base font-bold text-white transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-800)] hover:shadow-[var(--ysim-shadow-md)]"
        >
          Thanh toán

          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 py-3 text-base font-bold text-white opacity-45"
        >
          Thanh toán
        </button>
      )}

      {unavailableLineCount >
      0 ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          Hãy xóa hoặc thay đổi gói không còn sẵn sàng trước khi thanh toán.
        </p>
      ) : null}

      <div className="mt-5 space-y-2 border-t border-[var(--ysim-color-border)] pt-5 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--ysim-color-brand-700)]" />

          Thanh toán an toàn
        </p>

        <p className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-[var(--ysim-color-brand-700)]" />

          Thông tin được bảo vệ
        </p>
      </div>
    </aside>
  );
}
