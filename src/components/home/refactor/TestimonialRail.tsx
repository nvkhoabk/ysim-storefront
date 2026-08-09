"use client";

import {
  useRef,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  TestimonialSectionViewModel,
} from "@/types/view-models/home";

import {
  TestimonialCard,
} from "./TestimonialCard";

export interface TestimonialRailProps {
  section:
    TestimonialSectionViewModel;
}

export function TestimonialRail({
  section,
}: TestimonialRailProps) {
  const railRef =
    useRef<HTMLDivElement>(
      null,
    );

  function scroll(
    direction:
      | "previous"
      | "next",
  ) {
    const rail =
      railRef.current;

    if (!rail) {
      return;
    }

    const distance =
      Math.max(
        rail.clientWidth *
          0.8,
        300,
      );

    rail.scrollBy({
      left:
        direction ===
        "next"
          ? distance
          : -distance,
      behavior:
        "smooth",
    });
  }

  return (
    <Section variant="subtle">
      <Container>
        <SectionHeader
          eyebrow={
            section.eyebrow
          }
          title={
            section.title
          }
          description={
            section.description
          }
          action={
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Xem đánh giá trước"
                onClick={() =>
                  scroll(
                    "previous",
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Xem đánh giá tiếp theo"
                onClick={() =>
                  scroll(
                    "next",
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-300)]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div
          ref={railRef}
          className="grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(18rem,84vw)] gap-5 overflow-x-auto pb-4 [scrollbar-width:none] sm:auto-cols-[minmax(20rem,24rem)] [&::-webkit-scrollbar]:hidden"
        >
          {section.items.map(
            (testimonial) => (
              <div
                key={
                  testimonial.id
                }
                className="snap-start"
              >
                <TestimonialCard
                  testimonial={
                    testimonial
                  }
                />
              </div>
            ),
          )}
        </div>
      </Container>
    </Section>
  );
}
