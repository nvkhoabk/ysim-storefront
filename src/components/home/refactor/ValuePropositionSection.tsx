import {
  BadgeDollarSign,
  Globe2,
  Headphones,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  ValuePropositionIcon,
  ValuePropositionSectionViewModel,
} from "@/types/view-models/home";

const iconMap:
  Record<ValuePropositionIcon, LucideIcon> = {
    instant:
      Zap,

    transparent:
      BadgeDollarSign,

    support:
      Headphones,

    global:
      Globe2,
  };

export interface ValuePropositionSectionProps {
  section:
    ValuePropositionSectionViewModel;
}

export function ValuePropositionSection({
  section,
}: ValuePropositionSectionProps) {
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
          align="center"
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {section.items.map(
            (item) => {
              const Icon =
                iconMap[
                  item.icon
                ];

              return (
                <article
                  key={
                    item.title
                  }
                  className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6 text-center shadow-[var(--ysim-shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--ysim-duration-normal)] hover:-translate-y-1 hover:border-[var(--ysim-color-brand-200)] hover:shadow-[var(--ysim-shadow-card-hover)]"
                >
                  <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                    <Icon
                      aria-hidden="true"
                      className="h-6 w-6"
                    />
                  </span>

                  <h2 className="mt-5 text-lg font-bold text-[var(--ysim-color-text)]">
                    {
                      item.title
                    }
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    {
                      item.description
                    }
                  </p>
                </article>
              );
            },
          )}
        </div>
      </Container>
    </Section>
  );
}
