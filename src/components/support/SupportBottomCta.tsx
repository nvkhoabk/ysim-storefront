import Image from "next/image";
import Link from "next/link";

import {
  Headphones,
  Mail,
  MessageCircle,
} from "lucide-react";

export interface SupportBottomCtaProps {
  className?: string;

  imageSrc?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function SupportBottomCta({
  className,
  imageSrc = "/images/support/support-agent.png",
}: SupportBottomCtaProps) {
  return (
    <section
      aria-labelledby="support-bottom-cta-title"
      className={joinClasses(
        "mt-8 overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 shadow-sm",
        className,
      )}
    >
      <div className="grid items-center gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[150px_minmax(0,1fr)_auto]">
        <div className="relative hidden h-28 lg:block">
          <Image
            src={imageSrc}
            alt="Nhân viên hỗ trợ YSim"
            fill
            sizes="150px"
            className="object-contain object-bottom"
          />
        </div>

        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm lg:hidden"
          >
            <Headphones className="h-6 w-6" />
          </span>

          <div>
            <h2
              id="support-bottom-cta-title"
              className="text-lg font-bold text-slate-950"
            >
              Không tìm thấy câu trả lời?
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Đội ngũ chuyên viên của YSim luôn sẵn sàng hỗ trợ bạn 24/7.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          <Link
            href="/support#live-chat"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <MessageCircle
              aria-hidden="true"
              className="h-4 w-4"
            />

            Trò chuyện ngay
          </Link>

          <Link
            href="/support/request"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <Mail
              aria-hidden="true"
              className="h-4 w-4"
            />

            Gửi yêu cầu hỗ trợ
          </Link>
        </div>
      </div>
    </section>
  );
}