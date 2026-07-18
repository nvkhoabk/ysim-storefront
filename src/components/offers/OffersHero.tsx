import type {
  ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  BarChart3,
  CreditCard,
  Gift,
  Headphones,
  Tag,
} from "lucide-react";

import type {
  OffersBenefitItem,
  OffersHeroContent,
  OffersHighlightItem,
  OffersTabItem,
  OffersTabKey,
} from "./types";

import {
  OffersTabs,
} from "./OffersTabs";

export interface OffersHeroProps {
  content: OffersHeroContent;

  benefits: OffersBenefitItem[];

  highlights: OffersHighlightItem[];

  tabs: OffersTabItem[];

  activeTab?: OffersTabKey;

  visual?: ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

function BenefitIcon({
  id,
}: {
  id: string;
}) {
  switch (id) {
    case "sustainable-growth":
      return (
        <BarChart3 className="h-7 w-7" />
      );

    case "sales-rewards":
      return <Gift className="h-7 w-7" />;

    case "partner-support":
      return (
        <Headphones className="h-7 w-7" />
      );

    case "high-discount":
    default:
      return <Tag className="h-7 w-7" />;
  }
}

function HighlightIcon({
  id,
}: {
  id: string;
}) {
  switch (id) {
    case "revenue-reward":
      return <Gift className="h-6 w-6" />;

    case "fast-payment":
      return (
        <CreditCard className="h-6 w-6" />
      );

    default:
      return <Tag className="h-6 w-6" />;
  }
}

export function OffersHero({
  content,
  benefits,
  highlights,
  tabs,
  activeTab = "discount-policy",
  visual,
  className,
}: OffersHeroProps) {
  return (
    <section
      aria-labelledby="offers-hero-title"
      className={joinClasses(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pt-7 lg:px-9 lg:pb-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6"
        >
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li>
              <Link
                href="/imges/hero/hero-offers.png"
                className="transition hover:text-green-700"
              >
                Trang chủ
              </Link>
            </li>

            <li aria-hidden="true">
              /
            </li>

            <li
              aria-current="page"
              className="font-medium text-slate-700"
            >
              Ưu đãi
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)_190px]">
          <div className="min-w-0">
            <h1
              id="offers-hero-title"
              className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
            >
              {content.title}
              <span className="mt-1 block">
                – {content.secondTitleLine}{" "}
                <span className="text-green-700">
                  {content.highlightedText}
                </span>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              {content.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4 lg:gap-x-5">
              {benefits.map((benefit) => (
                <article
                  key={benefit.id}
                  className="min-w-0"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center text-green-700"
                  >
                    {benefit.icon ?? (
                      <BenefitIcon
                        id={benefit.id}
                      />
                    )}
                  </span>

                  <h2 className="mt-3 text-sm font-bold text-slate-950">
                    {benefit.title}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-white to-emerald-50 sm:min-h-[340px] lg:min-h-[390px]">
            {visual ? (
              <div className="absolute inset-0">
                {visual}
              </div>
            ) : content.imageSrc ? (
              <Image
                src={content.imageSrc}
                alt={
                  content.imageAlt ??
                  "Ưu đãi dành cho đối tác YSim"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-contain object-center"
              />
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="absolute left-[12%] top-[18%] h-32 w-32 rounded-full bg-green-100 blur-3xl"
                />

                <div
                  aria-hidden="true"
                  className="absolute bottom-[8%] right-[10%] h-40 w-40 rounded-full bg-emerald-100 blur-3xl"
                />
              </>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map(
              (highlight, index) => (
                <article
                  key={highlight.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                  {index === 0 ? (
                    <>
                      <p className="text-xs font-semibold text-slate-700">
                        {highlight.title}
                      </p>

                      <p className="mt-1 text-3xl font-bold text-green-700">
                        {highlight.value}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {highlight.description}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center text-green-700"
                      >
                        {highlight.icon ?? (
                          <HighlightIcon
                            id={highlight.id}
                          />
                        )}
                      </span>

                      <div>
                        <h2 className="text-sm font-bold text-slate-950">
                          {highlight.title}
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-9">
        <OffersTabs
          items={tabs}
          activeTab={activeTab}
        />
      </div>
    </section>
  );
}