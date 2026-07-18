import Link from "next/link";

import {
  Check,
  ChevronRight,
  Gem,
  Medal,
  ShieldCheck,
} from "lucide-react";

import type {
  PartnerTier,
  PartnerTierKey,
} from "./types";

export interface PartnerTierCardProps {
  tier: PartnerTier;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

function getTierStyles(
  tierKey: PartnerTierKey,
) {
  switch (tierKey) {
    case "gold":
      return {
        card:
          "border-amber-200 hover:border-amber-300",
        header:
          "bg-gradient-to-r from-amber-50 to-white",
        icon:
          "bg-amber-100 text-amber-600",
        name: "text-amber-700",
      };

    case "diamond":
      return {
        card:
          "border-green-200 hover:border-green-300",
        header:
          "bg-gradient-to-r from-green-50 to-white",
        icon:
          "bg-green-100 text-green-700",
        name: "text-slate-950",
      };

    case "silver":
    default:
      return {
        card:
          "border-slate-200 hover:border-slate-300",
        header:
          "bg-gradient-to-r from-slate-50 to-white",
        icon:
          "bg-slate-200 text-slate-600",
        name: "text-slate-950",
      };
  }
}

function TierIcon({
  tierKey,
}: {
  tierKey: PartnerTierKey;
}) {
  switch (tierKey) {
    case "gold":
      return <Medal className="h-6 w-6" />;

    case "diamond":
      return <Gem className="h-6 w-6" />;

    case "silver":
    default:
      return (
        <ShieldCheck className="h-6 w-6" />
      );
  }
}

export function PartnerTierCard({
  tier,
  className,
}: PartnerTierCardProps) {
  const styles = getTierStyles(tier.key);

  return (
    <article
      id={`${tier.key}-policy`}
      className={joinClasses(
        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        styles.card,
        className,
      )}
    >
      <Link
        href={tier.href}
        aria-label={`Xem chính sách hạng ${tier.name}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
      >
        <header
          className={joinClasses(
            "flex items-center gap-3 border-b border-slate-100 px-5 py-4",
            styles.header,
          )}
        >
          <span
            aria-hidden="true"
            className={joinClasses(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              styles.icon,
            )}
          >
            <TierIcon tierKey={tier.key} />
          </span>

          <div className="min-w-0 flex-1">
            <h3
              className={joinClasses(
                "text-lg font-bold",
                styles.name,
              )}
            >
              {tier.name}
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              {tier.subtitle}
            </p>
          </div>

          <ChevronRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-700 lg:hidden"
          />
        </header>

        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 px-5 py-4">
          <div className="pr-4">
            <p className="text-xs font-medium text-slate-500">
              Chiết khấu
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700">
              {tier.discountLabel}
            </p>
          </div>

          <div className="pl-4">
            <p className="text-xs font-medium text-slate-500">
              Yêu cầu doanh số
            </p>

            <p className="mt-2 text-sm font-bold leading-5 text-slate-950">
              {tier.salesRequirement}
            </p>
          </div>
        </div>

        <div className="hidden px-5 py-4 lg:block">
          <h4 className="text-xs font-bold text-slate-800">
            Ưu đãi khác
          </h4>

          <ul className="mt-3 space-y-2.5">
            {tier.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm leading-5 text-slate-600"
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
                />

                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </article>
  );
}