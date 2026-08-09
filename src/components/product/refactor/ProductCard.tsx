import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BadgePercent,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

import {
  Badge,
  Price,
} from "@/components/ui";

import type {
  ProductBadgeIcon,
  ProductCardViewModel,
} from "@/types/view-models/product-card";

import {
  cn,
} from "@/lib/ui/cn";

import {
  ProductAttributeChips,
} from "./ProductAttributeChips";

const badgeIconMap:
  Record<
    ProductBadgeIcon,
    LucideIcon
  > = {
    featured:
      Sparkles,

    sale:
      BadgePercent,

    popular:
      Star,
  };

export interface ProductCardProps {
  product:
    ProductCardViewModel;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white shadow-[var(--ysim-shadow-sm)]",
        "transition-[transform,box-shadow,border-color] duration-[var(--ysim-duration-normal)] ease-[var(--ysim-ease-standard)]",
        "hover:-translate-y-1 hover:border-[var(--ysim-color-brand-200)] hover:shadow-[var(--ysim-shadow-card-hover)]",
        "md:flex-row",
        className,
      )}
    >
      <Link
        href={
          product.href
        }
        aria-label={`Xem ${product.name}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[var(--ysim-color-surface-subtle)] md:aspect-auto md:w-[42%] md:min-w-[12rem]"
      >
        <Image
          src={
            product.imageUrl
          }
          alt={
            product.imageAlt
          }
          fill
          priority={
            priority
          }
          sizes="(max-width: 767px) 88vw, (max-width: 1280px) 36vw, 22rem"
          className="object-cover"
        />

        {product.badges.length >
        0 ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.badges.map(
              (badge) => {
                const Icon =
                  badge.icon
                    ? badgeIconMap[
                        badge.icon
                      ]
                    : null;

                return (
                  <Badge
                    key={
                      `${badge.label}-${badge.icon || "none"}`
                    }
                    icon={
                      Icon ? (
                        <Icon />
                      ) : undefined
                    }
                    className="shadow-[var(--ysim-shadow-sm)]"
                  >
                    {
                      badge.label
                    }
                  </Badge>
                );
              },
            )}
          </div>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
            {product.familyCode}
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-[var(--ysim-color-text)]">
            <Link
              href={
                product.href
              }
              className="rounded-[var(--ysim-radius-sm)] hover:text-[var(--ysim-color-brand-700)]"
            >
              {product.name}
            </Link>
          </h2>

          <ProductAttributeChips
            dataLabel={
              product.dataLabel
            }
            durationLabel={
              product.durationLabel
            }
            className="mt-4"
          />
        </div>

        <div className="mt-auto flex flex-col gap-5 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <Price
            amount={
              product.price
            }
            originalAmount={
              product.regularPrice
            }
            discountLabel={
              product.discountLabel
            }
          />

          <Link
            href={
              product.href
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 py-2.5 text-sm font-bold text-[var(--ysim-color-brand-700)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[var(--ysim-color-brand-50)]"
          >
            Xem chi tiết

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {product.sku ? (
          <p className="mt-4 truncate text-[11px] text-[var(--ysim-color-text-soft)]">
            SKU: {product.sku}
          </p>
        ) : null}
      </div>
    </article>
  );
}
