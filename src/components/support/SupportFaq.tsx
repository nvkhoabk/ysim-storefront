"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import type {
  SupportFaqItem,
} from "@/content/support/faq";

export interface SupportFaqProps {
  items: SupportFaqItem[];

  title?: string;

  viewAllHref?: string;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function SupportFaq({
  items,
  title = "Câu hỏi thường gặp",
  viewAllHref = "/faq",
  className,
}: SupportFaqProps) {
  const [
    activeId,
    setActiveId,
  ] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setActiveId((current) =>
      current === id ? null : id,
    );
  };

  return (
    <section
      aria-labelledby="support-faq-title"
      className={className}
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="support-faq-title"
          className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          {title}
        </h2>

        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition hover:text-green-800"
        >
          Xem tất cả

          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.map((item) => {
          const expanded =
            activeId === item.id;

          return (
            <article
              key={item.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`support-faq-${item.id}`}
                onClick={() =>
                  toggleItem(item.id)
                }
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-700"
              >
                <span className="text-sm font-medium leading-6 text-slate-800">
                  {item.question}
                </span>

                <ChevronDown
                  aria-hidden="true"
                  className={joinClasses(
                    "h-4 w-4 shrink-0 text-slate-500 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>

              {expanded ? (
                <div
                  id={`support-faq-${item.id}`}
                  className="border-t border-slate-100 bg-slate-50/60 px-5 py-4"
                >
                  <p className="text-sm leading-6 text-slate-600">
                    {item.answer}
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}