import Link from "next/link";

import {
  ArrowRight,
  CircleHelp,
  Headphones,
  MessageCircle,
} from "lucide-react";

export interface GuideSupportBannerProps {
  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function GuideSupportBanner({
  className,
}: GuideSupportBannerProps) {
  return (
    <section
      aria-labelledby="guide-support-title"
      className={joinClasses(
        "mt-8 overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 shadow-sm",
        className,
      )}
    >
      <div className="grid items-center gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-7">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
          >
            <Headphones className="h-6 w-6" />
          </span>

          <div>
            <h2
              id="guide-support-title"
              className="text-lg font-bold text-slate-950"
            >
              Cần hỗ trợ thêm?
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Đội ngũ YSim luôn sẵn sàng hỗ trợ bạn 24/7 qua các kênh bên dưới.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          <Link
            href="/support"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <MessageCircle
              aria-hidden="true"
              className="h-4 w-4"
            />

            Trò chuyện ngay

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>

          <Link
            href="/faq"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <CircleHelp
              aria-hidden="true"
              className="h-4 w-4"
            />

            Xem câu hỏi thường gặp

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}