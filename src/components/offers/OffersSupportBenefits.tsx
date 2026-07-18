import {
  GraduationCap,
  Headphones,
  Megaphone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import type {
  OffersSupportBenefit,
} from "./types";

export interface OffersSupportBenefitsProps {
  items: OffersSupportBenefit[];

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

function SupportBenefitIcon({
  id,
}: {
  id: string;
}) {
  switch (id) {
    case "free-training":
      return (
        <GraduationCap className="h-7 w-7" />
      );

    case "agency-program":
      return (
        <Megaphone className="h-7 w-7" />
      );

    case "transparent-policy":
      return (
        <ShieldCheck className="h-7 w-7" />
      );

    case "grow-together":
      return (
        <UsersRound className="h-7 w-7" />
      );

    case "marketing-support":
    default:
      return (
        <Headphones className="h-7 w-7" />
      );
  }
}

export function OffersSupportBenefits({
  items,
  className,
}: OffersSupportBenefitsProps) {
  return (
    <section
      aria-label="Quyền lợi hỗ trợ đối tác"
      className={joinClasses(
        "mt-7 overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50",
        className,
      )}
    >
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-start gap-3 border-b border-green-100/80 px-5 py-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-green-700"
            >
              {item.icon ?? (
                <SupportBenefitIcon
                  id={item.id}
                />
              )}
            </span>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-950">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}