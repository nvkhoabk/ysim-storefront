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
  ProductionRoutePlanViewModel,
} from "@/types/view-models/production-route-plan";

import {
  IntegrationWaveTimeline,
} from "./IntegrationWaveTimeline";

import {
  ProductionRouteExplorer,
} from "./ProductionRouteExplorer";

import {
  RolloutChecklist,
} from "./RolloutChecklist";

export function ProductionRoutePlanComposition({
  plan,
}: {
  plan:
    ProductionRoutePlanViewModel;
}) {
  const refactorCount =
    plan.routes.filter(
      (route) =>
        route.mode ===
        "refactor",
    ).length;

  const candidateCount =
    plan.routes.filter(
      (route) =>
        route.mode ===
        "candidate",
    ).length;

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

            Route Migration Workspace
          </p>

          <h1 className="mt-3 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
            {plan.title}
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[var(--ysim-color-text-muted)] sm:text-lg">
            {
              plan.description
            }
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
              {
                plan.routes
                  .length
              }{" "}
              production routes
            </span>

            <span className="rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-amber-800 shadow-[var(--ysim-shadow-sm)]">
              {
                candidateCount
              }{" "}
              candidate
            </span>

            <span className="rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-[var(--ysim-shadow-sm)]">
              {
                refactorCount
              }{" "}
              refactor
            </span>

            <span className="inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
              <ShieldCheck className="h-4 w-4" />

              Default legacy
            </span>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Rollout sequence"
            title="Ba đợt tích hợp độc lập"
            description="Bắt đầu từ content route ít rủi ro, kết thúc bằng transactional commerce."
          />

          <IntegrationWaveTimeline
            plan={
              plan
            }
          />
        </Container>
      </Section>

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="Route registry"
            title="Kế hoạch theo từng route"
            description="Kiểm tra mode, dependency, acceptance và rollback của từng route."
          />

          <ProductionRouteExplorer
            routes={
              plan.routes
            }
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Acceptance & rollback"
            title="Điều kiện trước khi chuyển production"
          />

          <RolloutChecklist
            plan={
              plan
            }
          />
        </Container>
      </Section>
    </PageShell>
  );
}
