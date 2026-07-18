import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

import type {
  SupportTopic,
} from "./types";

export interface SupportTopicsProps {
  topics: SupportTopic[];

  title?: string;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function SupportTopics({
  topics,
  title = "Chủ đề hỗ trợ phổ biến",
  className,
}: SupportTopicsProps) {
  return (
    <section
      aria-labelledby="support-topics-title"
      className={joinClasses(
        "mt-8",
        className,
      )}
    >
      <h2
        id="support-topics-title"
        className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
      >
        {title}
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {topics.map((topic) => {
          const Icon = topic.iconComponent;

          return (
            <Link
              key={topic.id}
              href={topic.href}
              className="group flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
                >
                  {topic.icon ??
                    (Icon ? (
                      <Icon className="h-6 w-6" />
                    ) : null)}
                </span>

                <ChevronRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-green-700"
                />
              </div>

              <h3 className="mt-4 text-sm font-bold leading-5 text-slate-950">
                {topic.title}
              </h3>

              <p className="mt-2 hidden text-xs leading-5 text-slate-500 sm:block">
                {topic.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}