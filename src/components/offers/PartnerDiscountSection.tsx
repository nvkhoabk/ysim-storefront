import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  PartnerTier,
} from "./types";

import {
  PartnerTierCard,
} from "./PartnerTierCard";

export interface PartnerDiscountSectionProps {
  tiers: PartnerTier[];

  title?: string;

  description?: string;

  detailsHref?: string;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function PartnerDiscountSection({
  tiers,
  title = "Chính sách chiết khấu theo hạng đối tác",
  description =
    "Càng nâng hạng – Càng hưởng ưu đãi cao.",
  detailsHref = "/offers#terms",
  className,
}: PartnerDiscountSectionProps) {
  return (
    <section
      id="discount-policy"
      aria-labelledby="partner-discount-title"
      className={joinClasses(
        "mt-7",
        className,
      )}
    >
      <div>
        <h2
          id="partner-discount-title"
          className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {tiers.map((tier) => (
          <PartnerTierCard
            key={tier.key}
            tier={tier}
          />
        ))}
      </div>

      <Link
        href={detailsHref}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 lg:hidden"
      >
        Xem chi tiết chính sách

        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4"
        />
      </Link>
    </section>
  );
}