import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  PartnerLogoSectionViewModel,
} from "@/types/view-models/home";

export interface PartnerLogoStripProps {
  section:
    PartnerLogoSectionViewModel;
}

export function PartnerLogoStrip({
  section,
}: PartnerLogoStripProps) {
  return (
    <Section spacing="sm">
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

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {section.items.map(
            (partner) => (
              <div
                key={
                  partner.name
                }
                title={
                  partner.name
                }
                className="inline-flex min-h-14 min-w-[8.5rem] items-center justify-center rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] bg-white px-5 py-3 text-center text-xs font-bold tracking-[0.12em] text-[var(--ysim-color-text-muted)] transition-[transform,border-color,color] hover:-translate-y-0.5 hover:border-[var(--ysim-color-brand-200)] hover:text-[var(--ysim-color-brand-800)]"
              >
                {partner.shortName ||
                  partner.name}
              </div>
            ),
          )}
        </div>
      </Container>
    </Section>
  );
}
