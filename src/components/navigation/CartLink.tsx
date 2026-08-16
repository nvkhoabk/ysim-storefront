// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { DEFAULT_LOCALIZED_SHELL_LABELS } from "@/i18n/shell/shell.defaults";
import type { LocalizedShellLabels } from "@/i18n/shell/shell.types";
import { cn } from "@/lib/ui/cn";

export interface CartLinkProps {
  count?: number;
  href?: string;
  labels?: Pick<LocalizedShellLabels, "cart" | "cartWithCount">;
  compact?: boolean;
  className?: string;
}

export function CartLink({
  count = 0,
  href = "/cart",
  labels = DEFAULT_LOCALIZED_SHELL_LABELS,
  compact = false,
  className,
}: CartLinkProps) {
  const accessibleLabel =
    count > 0
      ? labels.cartWithCount.replace("{count}", String(count))
      : labels.cart;

  return (
    <Link
      href={href}
      aria-label={accessibleLabel}
      className={cn(
        "relative inline-flex h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-transparent px-3 text-sm font-semibold text-[var(--ysim-color-text)]",
        "transition-[background-color,color,border-color] duration-[var(--ysim-duration-fast)]",
        "hover:border-[var(--ysim-color-border)] hover:bg-[var(--ysim-color-surface-subtle)]",
        compact && "w-11 px-0",
        className,
      )}
    >
      <ShoppingCart aria-hidden="true" className="h-5 w-5" />
      {!compact ? <span>{labels.cart}</span> : null}
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] px-1 text-[10px] leading-none font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
