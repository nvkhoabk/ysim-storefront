import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface EsimPromotionAsideProps {
  visual?: ReactNode;

  className?: string;
}

const BENEFITS = [
  "Kích hoạt trong 1 phút",
  "Không cần SIM vật lý",
  "Giữ nguyên số Việt Nam",
  "Hỗ trợ 24/7 tiếng Việt",
];

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function EsimPromotionAside({
  visual,
  className,
}: EsimPromotionAsideProps) {
  return (
    <aside
      aria-labelledby="esim-promotion-title"
      className={joinClasses(
        "h-full overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-b from-green-50 via-white to-emerald-50 shadow-sm",
        className,
      )}
    >
      <div className="flex h-full flex-col p-6 lg:p-7">
        <div>
          <p className="text-xl font-bold text-slate-950">
            eSIM cho hơn
          </p>

          <h2
            id="esim-promotion-title"
            className="mt-1 text-6xl font-bold leading-none tracking-tight text-green-700"
          >
            200+
          </h2>

          <p className="mt-3 text-xl font-semibold leading-7 text-slate-900">
            quốc gia &amp; vùng lãnh thổ
          </p>
        </div>

        <ul className="mt-7 space-y-4">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="border-l-2 border-green-600 pl-4 text-sm font-medium leading-6 text-slate-700"
            >
              {benefit}
            </li>
          ))}
        </ul>

        {visual ? (
          <div
            aria-hidden="true"
            className="my-7 flex min-h-64 flex-1 items-center justify-center"
          >
            {visual}
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="my-7 min-h-48 flex-1 rounded-2xl border border-dashed border-green-200 bg-white/50"
          />
        )}

        <Link
          href="/destinations"
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          Khám phá eSIM

          <ArrowRight
            aria-hidden="true"
            className="h-5 w-5"
          />
        </Link>
      </div>
    </aside>
  );
}