import {
  Layers3,
  Route,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  PreviewHubViewModel,
} from "@/types/view-models/ui-preview-registry";

import {
  PreviewHubExplorer,
} from "./PreviewHubExplorer";

import {
  PreviewReviewChecklist,
} from "./PreviewReviewChecklist";

import {
  PreviewRouteNavigator,
} from "./PreviewRouteNavigator";

import {
  PreviewViewportMatrix,
} from "./PreviewViewportMatrix";

export function PreviewHubComposition({
  hub,
}: {
  hub:
    PreviewHubViewModel;
}) {
  const routeCount =
    hub.packages.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.routes.length,
      0,
    );

  return (
    <PageShell
      cartCount={0}
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)]">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
                <Layers3 className="h-4 w-4" />

                UI Review Workspace
              </p>

              <h1 className="mt-3 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
                {hub.title}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ysim-color-text-muted)] sm:text-lg">
                {
                  hub.description
                }
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
                  {
                    hub.packages
                      .length
                  }{" "}
                  packages
                </span>

                <span className="rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
                  {
                    routeCount
                  }{" "}
                  preview routes
                </span>

                <span className="inline-flex items-center gap-2 rounded-[var(--ysim-radius-pill)] bg-white px-4 py-2 text-sm font-bold text-[var(--ysim-color-brand-800)] shadow-[var(--ysim-shadow-sm)]">
                  <Route className="h-4 w-4" />

                  Local dev first
                </span>
              </div>
            </div>

            <PreviewRouteNavigator
              packages={
                hub.packages
              }
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Package directory"
            title="Mở và kiểm thử từng phần"
            description="Tìm theo package, component, trạng thái hoặc route."
          />

          <PreviewHubExplorer
            packages={
              hub.packages
            }
            phases={
              hub.phases
            }
          />
        </Container>
      </Section>

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="Responsive review"
            title="Viewport matrix"
            description="Ba kích thước cơ sở dùng cho human review."
          />

          <PreviewViewportMatrix
            items={
              hub.viewports
            }
          />
        </Container>
      </Section>

      <Section>
        <Container size="content">
          <PreviewReviewChecklist
            checklist={
              hub.checklist
            }
          />
        </Container>
      </Section>
    </PageShell>
  );
}
