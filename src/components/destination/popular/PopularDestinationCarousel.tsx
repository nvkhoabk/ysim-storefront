"use client";

import type {
  ReactNode,
} from "react";

import {
  useRef,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import type {
  PopularDestination,
} from "../types";

import {
  PopularDestinationCard,
} from "./PopularDestinationCard";

export interface PopularDestinationCarouselProps {
  destinations: PopularDestination[];

  title?: string;

  viewAllHref?: string;

  viewAllLabel?: string;

  renderFlag?: (
    countryCode: string,
  ) => ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function PopularDestinationCarousel({
  destinations,
  title = "Điểm đến phổ biến",
  viewAllHref = "/destinations",
  viewAllLabel = "Xem tất cả",
  renderFlag,
  className,
}: PopularDestinationCarouselProps) {
  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const scrollByCard = (
    direction: "previous" | "next",
  ) => {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-popular-destination-card]",
      );

    const cardWidth =
      firstCard?.offsetWidth ?? 260;

    const computedStyle =
      window.getComputedStyle(container);

    const columnGap =
      Number.parseFloat(
        computedStyle.columnGap ||
          computedStyle.gap ||
          "16",
      ) || 16;

    container.scrollBy({
      left:
        direction === "next"
          ? cardWidth + columnGap
          : -(cardWidth + columnGap),
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-labelledby="popular-destinations-title"
      className={className}
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="popular-destinations-title"
          className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          {title}
        </h2>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() =>
                scrollByCard("previous")
              }
              aria-label="Xem điểm đến trước"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-green-700 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollByCard("next")
              }
              aria-label="Xem điểm đến tiếp theo"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-green-700 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-green-700"
          >
            {viewAllLabel}

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={joinClasses(
          "mt-5 grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto pb-3",
          "snap-x snap-mandatory scroll-smooth",
          "sm:auto-cols-[42%]",
          "lg:auto-cols-[28%]",
          "xl:auto-cols-[calc((100%_-_5rem)/6)]",
        )}
      >
        {destinations.map(
          (destination, index) => (
            <div
              key={destination.id}
              data-popular-destination-card
              className="min-w-0 snap-start"
            >
              <PopularDestinationCard
                destination={destination}
                renderFlag={renderFlag}
                priority={index < 2}
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
}