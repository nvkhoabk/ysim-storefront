import {
  Star,
} from "lucide-react";

import type {
  TestimonialViewModel,
} from "@/types/view-models/home";

export interface TestimonialCardProps {
  testimonial:
    TestimonialViewModel;
}

export function TestimonialCard({
  testimonial,
}: TestimonialCardProps) {
  const safeRating =
    Math.max(
      0,
      Math.min(
        5,
        Math.round(
          testimonial.rating,
        ),
      ),
    );

  return (
    <article className="flex h-full flex-col rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)]">
      <div
        aria-label={`${safeRating} trên 5 sao`}
        className="flex gap-1 text-[var(--ysim-color-brand-600)]"
      >
        {Array.from({
          length: 5,
        }).map(
          (
            _,
            index,
          ) => (
            <Star
              key={index}
              aria-hidden="true"
              className={
                index <
                safeRating
                  ? "h-4 w-4 fill-current"
                  : "h-4 w-4 text-[var(--ysim-color-border-strong)]"
              }
            />
          ),
        )}
      </div>

      <blockquote className="mt-5 flex-1 text-base leading-relaxed text-[var(--ysim-color-text)]">
        “{testimonial.quote}”
      </blockquote>

      <footer className="mt-6 flex items-center gap-3 border-t border-[var(--ysim-color-border)] pt-5">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--ysim-color-brand-100)] text-sm font-bold text-[var(--ysim-color-brand-800)]">
          {
            testimonial.initials
          }
        </span>

        <span className="min-w-0">
          <strong className="block truncate text-sm text-[var(--ysim-color-text)]">
            {
              testimonial.name
            }
          </strong>

          <span className="mt-0.5 block truncate text-xs text-[var(--ysim-color-text-muted)]">
            {
              testimonial
                .purchasedProduct
            }

            {testimonial.location
              ? ` · ${testimonial.location}`
              : ""}
          </span>
        </span>
      </footer>
    </article>
  );
}
