"use client";

import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

export interface BreadcrumbItem {

  label: string;

  href?: string;
}

interface Props {

  items: BreadcrumbItem[];
}

export function PageBreadcrumbs({
  items,
}: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
    >
      {items.map(
        (
          item,
          index,
        ) => {
          const last =
            index ===
            items.length - 1;

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {item.href &&
              !last ? (
                <Link
                  href={item.href}
                  className="transition hover:text-green-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    last
                      ? "font-medium text-slate-900"
                      : ""
                  }
                >
                  {item.label}
                </span>
              )}

              {!last && (
                <ChevronRight
                  className="h-4 w-4"
                />
              )}
            </div>
          );
        },
      )}
    </nav>
  );
}