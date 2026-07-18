import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  PopularGuideTopic,
} from "@/content/guides/topics";

export interface PopularGuideTopicsProps {
  topics: PopularGuideTopic[];

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function PopularGuideTopics({
  topics,
  className,
}: PopularGuideTopicsProps) {
  return (
    <section
      aria-labelledby="popular-guide-topics-title"
      className={joinClasses(
        "mt-10",
        className,
      )}
    >
      <h2
        id="popular-guide-topics-title"
        className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
      >
        Các chủ đề hướng dẫn phổ biến
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {topics.map((topic) => {
          const Icon = topic.icon;

          return (
            <Link
              key={topic.id}
              href={topic.href}
              className="group flex min-h-[132px] flex-col rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-green-50/60 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
              >
                <Icon className="h-6 w-6" />
              </span>

              <div className="mt-4 min-w-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900">
                  {topic.title}
                </h3>

                {topic.highlightedText ? (
                  <p className="text-sm font-semibold leading-6 text-green-700">
                    {topic.highlightedText}
                  </p>
                ) : null}
              </div>

              <span className="mt-auto flex justify-end pt-3 text-green-700">
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}