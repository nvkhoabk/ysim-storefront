import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

import type {
  OffersTabItem,
  OffersTabKey,
} from "./types";

export interface OffersTabsProps {
  items: OffersTabItem[];

  activeTab?: OffersTabKey;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function OffersTabs({
  items,
  activeTab = "discount-policy",
  className,
}: OffersTabsProps) {
  return (
    <nav
      aria-label="Danh mục chính sách ưu đãi"
      className={joinClasses(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="grid lg:grid-cols-5">
        {items.map((item) => {
          const active =
            item.key === activeTab;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={joinClasses(
                "group flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-sm font-semibold transition last:border-b-0",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700",
                "lg:justify-center lg:border-b-0 lg:border-r lg:last:border-r-0",
                active
                  ? "bg-green-700 text-white"
                  : "bg-white text-slate-700 hover:bg-green-50 hover:text-green-700",
              )}
            >
              <span className="truncate">
                {item.label}
              </span>

              <ChevronRight
                aria-hidden="true"
                className={joinClasses(
                  "h-4 w-4 shrink-0 lg:hidden",
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-green-700",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}