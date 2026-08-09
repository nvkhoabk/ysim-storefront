import {
  GitBranch,
  ShieldCheck,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  Wave2ActivationPlanViewModel,
} from "@/types/view-models/wave2-activation";

import {
  Wave2ActivationRouteCard,
} from "./Wave2ActivationRouteCard";

export function Wave2ActivationComposition({
  plan,
}: {
  plan:
    Wave2ActivationPlanViewModel;
}) {
  return (
    <PageShell
      cartCount={0}
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
            <GitBranch className="h-4 w-4" />
            Catalog Commerce
          </p>

          <h1 className="mt-3 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
            {
              plan.title
            }
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[var(--ysim-color-text-muted)] sm:text-lg">
            {
              plan.description
            }
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
            <ShieldCheck className="h-4 w-4" />
            Installer không thay production route
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Activation order"
            title="Destination trước Product Detail"
            description="Mỗi route có feature flag và rollback độc lập."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {
              plan.routes.map(
                (route) => (
                  <Wave2ActivationRouteCard
                    key={
                      route.id
                    }
                    route={
                      route
                    }
                  />
                ),
              )
            }
          </div>
        </Container>
      </Section>

      <Section variant="subtle">
        <Container size="content">
          <SectionHeader
            eyebrow="Guardrails"
            title="Quy tắc bắt buộc"
          />

          <div className="space-y-3 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 sm:p-6">
            {
              plan.guardrails.map(
                (
                  guardrail,
                  index,
                ) => (
                  <p
                    key={
                      guardrail
                    }
                    className="flex items-start gap-3 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-4 py-3 text-sm font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-xs font-bold text-white">
                      {
                        index +
                        1
                      }
                    </span>
                    {guardrail}
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
