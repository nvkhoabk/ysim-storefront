import Image from "next/image";
import Link from "next/link";

import {
  MessageCircle,
} from "lucide-react";

export interface SupportAvailabilityCardProps {
  title?: string;

  description?: string;

  href?: string;

  imageSrc?: string;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function SupportAvailabilityCard({
  title = "Hỗ trợ 24/7",
  description = "Luôn đồng hành cùng bạn",
  href = "/support#live-chat",
  imageSrc = "/images/hero/hero-support.png",
  className,
}: SupportAvailabilityCardProps) {
  return (
    <section
      aria-labelledby="support-availability-title"
      className={joinClasses(
        "overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 shadow-sm",
        className,
      )}
    >
      <div className="grid min-h-[150px] grid-cols-[minmax(0,1fr)_150px] items-center gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <h2
            id="support-availability-title"
            className="text-lg font-bold text-green-700"
          >
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>

          <Link
            href={href}
            className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <MessageCircle
              aria-hidden="true"
              className="h-4 w-4"
            />

            Chat ngay
          </Link>
        </div>

        <div className="relative h-full min-h-[120px]">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="220px"
            className="object-contain object-center"
          />
        </div>
      </div>
    </section>
  );
}