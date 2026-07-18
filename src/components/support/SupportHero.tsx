"use client";

import Image from "next/image";
import Link from "next/link";

import type {
  SupportHeroContent,
  SupportSearchPayload,
} from "./types";

import {
  SupportSearch,
} from "./SupportSearch";

export interface SupportHeroProps {
  content: SupportHeroContent;

  searchValue: string;

  onSearchChange: (value: string) => void;

  onSearchSubmit?: (
    payload: SupportSearchPayload,
  ) => void;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function SupportHero({
  content,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  className,
}: SupportHeroProps) {
  return (
    <section
      aria-labelledby="support-hero-title"
      className={joinClasses(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(460px,1.2fr)]">
        <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-7"
          >
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/images/hero/hero-support.png"
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
                Hỗ trợ
              </li>
            </ol>
          </nav>

          <h1
            id="support-hero-title"
            className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            {content.title}{" "}
            {content.highlightedText ? (
              <span className="text-green-700">
                {content.highlightedText}
              </span>
            ) : null}
          </h1>

          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            {content.description}
          </p>

          <SupportSearch
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder={
              content.searchPlaceholder
            }
            className="mt-7 max-w-xl"
          />
        </div>

        <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 sm:min-h-[360px] lg:min-h-[400px]">
          <Image
            src={content.imageSrc}
            alt={content.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-contain object-center"
          />
        </div>
      </div>
    </section>
  );
}