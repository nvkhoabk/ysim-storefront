import Link from "next/link";

import {
  ShoppingCart,
} from "lucide-react";

import {
  cn,
} from "@/lib/ui/cn";

export interface CartLinkProps {
  count?: number;
  compact?: boolean;
  className?: string;
}

export function CartLink({
  count = 0,
  compact = false,
  className,
}: CartLinkProps) {
  const label =
    count > 0
      ? `Giỏ hàng có ${count} sản phẩm`
      : "Giỏ hàng";

  return (
    <Link
      href="/cart"
      aria-label={label}
      className={cn(
        "relative inline-flex h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-transparent px-3 text-sm font-semibold text-[var(--ysim-color-text)]",
        "transition-[background-color,color,border-color] duration-[var(--ysim-duration-fast)]",
        "hover:border-[var(--ysim-color-border)] hover:bg-[var(--ysim-color-surface-subtle)]",
        compact &&
          "w-11 px-0",
        className,
      )}
    >
      <ShoppingCart
        aria-hidden="true"
        className="h-5 w-5"
      />

      {!compact ? (
        <span>
          Giỏ hàng
        </span>
      ) : null}

      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] px-1 text-[10px] font-bold leading-none text-white">
          {count > 99
            ? "99+"
            : count}
        </span>
      ) : null}
    </Link>
  );
}
