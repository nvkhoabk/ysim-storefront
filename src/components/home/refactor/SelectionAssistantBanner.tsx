import Link from "next/link";

import {
  ArrowRight,
  Compass,
  Plane,
} from "lucide-react";

import {
  Container,
  Section,
} from "@/components/layout";

import type {
  SelectionAssistantViewModel,
} from "@/types/view-models/home";

export interface SelectionAssistantBannerProps {
  banner:
    SelectionAssistantViewModel;
}

export function SelectionAssistantBanner({
  banner,
}: SelectionAssistantBannerProps) {
  return (
    <Section spacing="sm">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--ysim-radius-xl)] bg-[linear-gradient(135deg,var(--ysim-color-brand-900),var(--ysim-color-brand-700))] p-7 text-white shadow-[var(--ysim-shadow-md)] sm:p-9 lg:p-11">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[2rem] border-white/5"
          />

          <Plane
            aria-hidden="true"
            className="absolute bottom-6 right-[14%] hidden h-20 w-20 rotate-12 text-white/10 lg:block"
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              {banner.eyebrow ? (
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                  {
                    banner.eyebrow
                  }
                </p>
              ) : null}

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {
                  banner.title
                }
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                {
                  banner.description
                }
              </p>
            </div>

            <Link
              href={
                banner.actionHref
              }
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-white px-6 py-3 text-base font-bold text-[var(--ysim-color-brand-900)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--ysim-shadow-md)]"
            >
              <Compass className="h-5 w-5" />

              {
                banner.actionLabel
              }

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
