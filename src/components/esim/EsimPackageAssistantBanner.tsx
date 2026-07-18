import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface EsimPackageAssistantBannerProps {
  visual?: ReactNode;

  className?: string;
}

const STEPS = [
  {
    number: 1,
    title: "Bạn đi đâu?",
    description:
      "Chọn quốc gia hoặc khu vực",
  },
  {
    number: 2,
    title: "Đi bao nhiêu ngày?",
    description:
      "Chọn thời gian dự kiến sử dụng",
  },
  {
    number: 3,
    title: "Dùng Internet nhiều hay ít?",
    description:
      "Chọn nhu cầu sử dụng",
  },
];

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function EsimPackageAssistantBanner({
  visual,
  className,
}: EsimPackageAssistantBannerProps) {
  return (
    <section
      aria-labelledby="package-assistant-title"
      className={joinClasses(
        "overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-green-50 shadow-sm",
        className,
      )}
    >
      <div className="grid items-center gap-7 px-6 py-7 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,2fr)_auto] lg:px-8">
        <div className="flex items-center gap-5">
          {visual ? (
            <div
              aria-hidden="true"
              className="hidden h-24 w-24 shrink-0 items-center justify-center sm:flex"
            >
              {visual}
            </div>
          ) : null}

          <div>
            <h2
              id="package-assistant-title"
              className="text-xl font-bold text-slate-950"
            >
              Bạn chưa biết chọn gói nào?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Trả lời 3 câu hỏi, YSim sẽ gợi ý gói eSIM phù hợp nhất cho hành
              trình của bạn.
            </p>
          </div>
        </div>

        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                {step.number}
              </span>

              <h3 className="mt-3 text-sm font-bold text-slate-900">
                {step.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <Link
          href="/package-assistant"
          className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-green-700 bg-white px-6 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          Bắt đầu ngay

          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Link>
      </div>
    </section>
  );
}