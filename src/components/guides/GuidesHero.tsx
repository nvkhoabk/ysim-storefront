import Link from "next/link";
import Image from "next/image";

import type {
  GuidesHeroContent,
  GuidesTabItem,
  GuidesTabKey,
} from "./types";

import {
  GuidesTabs,
} from "./GuidesTabs";

export interface GuidesHeroProps {
  content: GuidesHeroContent;

  tabs: GuidesTabItem[];

  activeTab?: GuidesTabKey;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function GuidesHero({
  content,
  tabs,
  activeTab = "installation",
  className,
}: GuidesHeroProps) {
  return (
    <section
      aria-labelledby="guides-hero-title"
      className={joinClasses(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)]">
        <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-7"
          >
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/"
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
                Hướng dẫn
              </li>
            </ol>
          </nav>

          <h1
            id="guides-hero-title"
            className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            {content.title}{" "}
            {content.highlightedTitle ? (
              <span className="text-green-700">
                {content.highlightedTitle}
              </span>
            ) : null}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            {content.description}
          </p>
        </div>

        <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 sm:min-h-[340px] lg:min-h-[360px]">
          <Image
            src={content.imageSrc}
            alt={content.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain object-center"
          />
        </div>
      </div>

      <GuidesTabs
        items={tabs}
        activeTab={activeTab}
      />
    </section>
  );
}