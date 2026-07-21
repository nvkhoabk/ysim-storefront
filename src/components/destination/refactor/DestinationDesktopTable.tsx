import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  Price,
} from "@/components/ui";

import type {
  DestinationCatalogItemViewModel,
} from "@/types/view-models/destination-page";

export interface DestinationDesktopTableProps {
  items:
    readonly DestinationCatalogItemViewModel[];
}

export function DestinationDesktopTable({
  items,
}: DestinationDesktopTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white lg:block">
      <table className="w-full border-collapse">
        <thead className="bg-[var(--ysim-color-surface-subtle)] text-left text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-muted)]">
          <tr>
            <th className="px-5 py-4">
              Điểm đến
            </th>
            <th className="px-5 py-4">
              Khu vực
            </th>
            <th className="px-5 py-4">
              Thời hạn
            </th>
            <th className="px-5 py-4">
              Số gói
            </th>
            <th className="px-5 py-4">
              Giá từ
            </th>
            <th className="px-5 py-4 text-right">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (item) => (
              <tr
                key={
                  item.slug
                }
                className="border-t border-[var(--ysim-color-border)] transition-colors hover:bg-[var(--ysim-color-brand-50)]/55"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--ysim-color-border)] bg-white">
                      <Image
                        src={
                          item.flagUrl
                        }
                        alt={`Quốc kỳ ${item.name}`}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>

                    <span className="min-w-0">
                      <Link
                        href={
                          item.href
                        }
                        className="block truncate font-bold text-[var(--ysim-color-text)] hover:text-[var(--ysim-color-brand-700)]"
                      >
                        {
                          item.name
                        }
                      </Link>

                      <span className="mt-0.5 block max-w-sm truncate text-xs text-[var(--ysim-color-text-muted)]">
                        {
                          item.description
                        }
                      </span>
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
                  {
                    item.continentLabel
                  }
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
                  {
                    item.durationLabel ||
                    "Nhiều thời hạn"
                  }
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
                  {
                    item.productCount ??
                    "—"
                  }
                </td>

                <td className="px-5 py-4">
                  <Price
                    amount={
                      item.priceFrom
                    }
                    size="compact"
                  />
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={
                      item.href
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-[var(--ysim-radius-md)] px-3 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-100)]"
                  >
                    Xem gói

                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
