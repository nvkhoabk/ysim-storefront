import {
  QrCode,
  Search,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  HowItWorksIcon,
  HowItWorksSectionViewModel,
} from "@/types/view-models/home";

const iconMap:
  Record<HowItWorksIcon, LucideIcon> = {
    choose:
      Search,

    receive:
      QrCode,

    connect:
      Wifi,
  };

export interface HowItWorksSectionProps {
  section:
    HowItWorksSectionViewModel;
}

export function HowItWorksSection({
  section,
}: HowItWorksSectionProps) {
  return (
    <Section>
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
          align="center"
        />

        <ol className="grid gap-5 lg:grid-cols-3">
          {section.steps.map(
            (step) => {
              const Icon =
                iconMap[
                  step.icon
                ];

              return (
                <li
                  key={
                    step.step
                  }
                  className="relative rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 sm:p-8"
                >
                  <span className="absolute right-5 top-4 text-6xl font-bold leading-none text-[var(--ysim-color-brand-50)]">
                    {String(
                      step.step,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] text-white shadow-[var(--ysim-shadow-sm)]">
                    <Icon
                      aria-hidden="true"
                      className="h-6 w-6"
                    />
                  </span>

                  <h2 className="relative mt-6 text-xl font-bold text-[var(--ysim-color-text)]">
                    {
                      step.title
                    }
                  </h2>

                  <p className="relative mt-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    {
                      step.description
                    }
                  </p>
                </li>
              );
            },
          )}
        </ol>
      </Container>
    </Section>
  );
}
