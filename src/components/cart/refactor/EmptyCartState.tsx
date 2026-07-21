import Link from "next/link";

import {
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

export function EmptyCartState() {
  return (
    <div className="rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] bg-white px-6 py-16 text-center">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
        <ShoppingCart className="h-7 w-7" />
      </span>

      <h2 className="mt-5 text-2xl font-bold text-[var(--ysim-color-text)]">
        Giỏ hàng đang trống
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
        Chọn điểm đến và gói eSIM phù hợp để bắt đầu hành trình.
      </p>

      <Link
        href="/destinations"
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-6 py-3 text-base font-bold text-white"
      >
        Chọn điểm đến

        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
