"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Quote, Star } from "lucide-react";
import { useRef } from "react";

import { testimonials, type TestimonialItem } from "@/data/testimonials";

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <article
      data-testimonial-card
      className="flex h-[126px] min-w-0 snap-start flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
            {testimonial.initials}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="truncate text-[12px] leading-4 font-bold text-slate-950">
                {testimonial.customerName}
              </h3>

              {testimonial.verified ? (
                <BadgeCheck
                  aria-label="Đánh giá đã xác minh"
                  className="h-3.5 w-3.5 shrink-0 text-green-700"
                />
              ) : null}
            </div>

            <p className="mt-0.5 truncate text-[10px] leading-4 text-slate-500">
              {testimonial.destinationFlag} {testimonial.destination}
            </p>
          </div>
        </div>

        <Quote
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-green-100"
          fill="currentColor"
        />
      </div>

      <div
        className="mt-2 flex items-center gap-0.5"
        aria-label={`${testimonial.rating} trên 5 sao`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={
              index < testimonial.rating
                ? "h-3 w-3 fill-amber-400 text-amber-400"
                : "h-3 w-3 text-slate-200"
            }
          />
        ))}
      </div>

      <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-600">
        {testimonial.content}
      </p>
    </article>
  );
}

export function TestimonialsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: "left" | "right") {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector<HTMLElement>(
      "[data-testimonial-card]",
    );

    const cardWidth = firstCard?.offsetWidth ?? 280;

    carousel.scrollBy({
      left: direction === "right" ? cardWidth + 12 : -(cardWidth + 12),
      behavior: "smooth",
    });
  }

  return (
    <section className="bg-white px-5 pt-0 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-[17px] leading-6 font-bold text-slate-950">
            Khách hàng nói gì về YSim
          </h2>

          <div className="flex items-center gap-2">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 transition hover:text-green-700"
            >
              Xem tất cả đánh giá
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                aria-label="Xem đánh giá trước"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-700 hover:bg-green-700 hover:text-white focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                aria-label="Xem đánh giá tiếp theo"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-700 hover:bg-green-700 hover:text-white focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="-mx-5 grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[87%] grid-flow-col gap-3 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:auto-cols-[48%] sm:px-6 lg:mx-0 lg:auto-cols-[24%] lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
