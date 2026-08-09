import {
  CheckCircle2,
  Mail,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  CheckoutSubmitPreview,
} from "@/types/view-models/checkout-refactor";

export interface CheckoutSuccessStateProps {
  result:
    CheckoutSubmitPreview;
  onReset:
    () => void;
}

export function CheckoutSuccessState({
  result,
  onReset,
}: CheckoutSuccessStateProps) {
  return (
    <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-white p-7 text-center shadow-[var(--ysim-shadow-md)] sm:p-10">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
        <CheckCircle2 className="h-8 w-8" />
      </span>

      <p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
        Demo thành công
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--ysim-color-text)]">
        Đã mô phỏng tạo đơn hàng
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
        Không có order thật, giao dịch thật hoặc email thật nào được tạo.
      </p>

      <dl className="mx-auto mt-7 max-w-lg space-y-3 rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-5 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Mã demo
          </dt>

          <dd className="font-bold">
            {
              result.orderCode
            }
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Phương thức
          </dt>

          <dd className="font-bold uppercase">
            {
              result.paymentMethod
            }
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ysim-color-text-muted)]">
            Tổng tiền
          </dt>

          <dd>
            <Price
              amount={
                result.total
              }
              size="compact"
            />
          </dd>
        </div>
      </dl>

      <p className="mx-auto mt-6 flex max-w-lg items-start justify-center gap-2 text-sm text-[var(--ysim-color-text-muted)]">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

        eSIM sẽ được mô phỏng gửi tới{" "}
        <strong className="break-all text-[var(--ysim-color-text)]">
          {
            result.recipientEmail
          }
        </strong>
      </p>

      <button
        type="button"
        onClick={
          onReset
        }
        className="mt-7 min-h-11 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-5 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
      >
        Quay lại Checkout
      </button>
    </div>
  );
}
