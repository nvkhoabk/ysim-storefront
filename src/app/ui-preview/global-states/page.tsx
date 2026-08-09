import {
  CheckCircle2,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  GlobalStatePreviewExplorer,
} from "@/components/global-states/GlobalStatePreviewExplorer";

import {
  createGlobalStatePreviewViewModel,
} from "@/config/storefront-global-state-preview";

export const metadata = {
  title:
    "Global States Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function GlobalStatesPreviewPage() {
  const preview =
    createGlobalStatePreviewViewModel();

  return (
    <PageShell
      cartCount={0}
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <SectionHeader
            eyebrow="Package 34"
            title={
              preview.title
            }
            description={
              preview.description
            }
          />
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <GlobalStatePreviewExplorer
            preview={
              preview
            }
          />
        </Container>
      </Section>

      <Section variant="subtle">
        <Container size="content">
          <SectionHeader
            eyebrow="Acceptance"
            title="Checklist"
          />

          <div className="space-y-3 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
            {
              preview.acceptance.map(
                (item) => (
                  <p
                    key={
                      item
                    }
                    className="flex items-start gap-3 text-sm font-semibold leading-7 text-[var(--ysim-color-text-muted)]"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]"
                    />

                    {
                      item
                    }
                  </p>
                ),
              )
            }
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
