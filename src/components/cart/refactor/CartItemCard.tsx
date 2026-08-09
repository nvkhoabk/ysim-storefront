import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  Database,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  CartLineItemViewModel,
} from "@/types/view-models/cart-refactor";

export interface CartItemCardProps {
  line:
    CartLineItemViewModel;
  onQuantityChange:
    (
      lineId: string,
      quantity: number,
    ) => void;
  onRemove:
    (lineId: string) => void;
}

export function CartItemCard({
  line,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  const available =
    line.purchasable &&
    line.inStock;

  return (
    <article className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-4 shadow-[var(--ysim-shadow-sm)] sm:p-5">
      <div className="flex gap-4">
        <Link
          href={
            line.href
          }
          className="relative aspect-square h-24 shrink-0 overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] sm:h-28"
        >
          <Image
            src={
              line.imageUrl
            }
            alt={
              line.imageAlt
            }
            fill
            sizes="112px"
            className="object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
            {
              line.destinationName
            }
          </p>

          <div className="mt-1 flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-lg font-bold text-[var(--ysim-color-text)]">
              <Link
                href={
                  line.href
                }
                className="hover:text-[var(--ysim-color-brand-700)]"
              >
                {
                  line.name
                }
              </Link>
            </h2>

            <button
              type="button"
              aria-label={`Xóa ${line.name}`}
              onClick={() =>
                onRemove(
                  line.lineId,
                )
              }
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] text-[var(--ysim-color-text-soft)] hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1.5">
              <Database className="h-3.5 w-3.5 text-[var(--ysim-color-brand-700)]" />

              {
                line.dataLabel
              }
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-surface-subtle)] px-3 py-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--ysim-color-brand-700)]" />

              {
                line.durationLabel
              }
            </span>
          </div>

          {line.sku ? (
            <p className="mt-3 text-[11px] text-[var(--ysim-color-text-soft)]">
              SKU: {line.sku}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-[var(--ysim-color-border)] pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--ysim-color-text-muted)]">
            Đơn giá
          </p>

          <Price
            amount={
              line.unitPrice
            }
            originalAmount={
              line.regularUnitPrice >
              line.unitPrice
                ? line.regularUnitPrice
                : undefined
            }
            size="compact"
          />
        </div>

        <div className="flex items-end justify-between gap-5 sm:justify-end">
          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
              Số lượng
            </p>

            <div className="inline-flex items-center overflow-hidden rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white">
              <button
                type="button"
                aria-label="Giảm số lượng"
                disabled={
                  line.quantity <=
                  1
                }
                onClick={() =>
                  onQuantityChange(
                    line.lineId,
                    line.quantity -
                      1,
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center hover:bg-[var(--ysim-color-brand-50)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="min-w-10 text-center text-sm font-bold">
                {
                  line.quantity
                }
              </span>

              <button
                type="button"
                aria-label="Tăng số lượng"
                disabled={
                  line.quantity >=
                  99
                }
                onClick={() =>
                  onQuantityChange(
                    line.lineId,
                    line.quantity +
                      1,
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center hover:bg-[var(--ysim-color-brand-50)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-[var(--ysim-color-text-muted)]">
              Thành tiền
            </p>

            <Price
              amount={
                line.lineTotal
              }
              size="compact"
            />
          </div>
        </div>
      </div>

      {!available ? (
        <p className="mt-4 rounded-[var(--ysim-radius-md)] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Gói này hiện không còn sẵn sàng để mua.
        </p>
      ) : null}
    </article>
  );
}
