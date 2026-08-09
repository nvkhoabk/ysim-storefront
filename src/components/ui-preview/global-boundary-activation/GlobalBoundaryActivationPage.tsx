import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  TerminalSquare,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  GlobalBoundaryActivationPlanViewModel,
} from "@/types/view-models/global-boundary-activation";

export function GlobalBoundaryActivationPage({
  plan,
}: {
  plan:
    GlobalBoundaryActivationPlanViewModel;
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
          <SectionHeader
            eyebrow="Package 35"
            title={
              plan.title
            }
            description={
              plan.description
            }
          />

          <div className="mt-6 rounded-[var(--ysim-radius-lg)] border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-start gap-3 text-sm font-semibold leading-7 text-amber-900">
              <AlertTriangle
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0"
              />
              Installer chỉ thêm dashboard và test routes. Boundary production chỉ thay khi chạy lệnh activate riêng.
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {
              plan.boundaries.map(
                (boundary) => (
                  <article
                    key={
                      boundary.id
                    }
                    className="flex h-full flex-col rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] text-sm font-bold text-white">
                        {
                          boundary.order
                        }
                      </span>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        boundary.risk ===
                        "high"
                          ? "bg-amber-50 text-amber-900"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {
                          boundary.risk
                        } risk
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-[var(--ysim-color-text)]">
                      {
                        boundary.label
                      }
                    </h2>

                    <code className="mt-2 block break-all text-xs font-semibold text-[var(--ysim-color-brand-800)]">
                      {
                        boundary.target
                      }
                    </code>

                    <ul className="mt-5 space-y-2 text-sm text-[var(--ysim-color-text-muted)]">
                      {
                        boundary.notes.map(
                          (note) => (
                            <li
                              key={
                                note
                              }
                              className="flex items-start gap-2"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]"
                              />
                              {
                                note
                              }
                            </li>
                          ),
                        )
                      }
                    </ul>

                    {
                      boundary.testPath
                        ? (
                            <Link
                              href={
                                boundary.testPath
                              }
                              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-[var(--ysim-color-brand-700)]"
                            >
                              Mở test route
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )
                        : null
                    }

                    <div className="mt-5 space-y-3">
                      <div className="rounded-[var(--ysim-radius-md)] bg-slate-950 p-3 text-slate-100">
                        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          <TerminalSquare className="h-3.5 w-3.5" />
                          Activate
                        </p>

                        <code className="block break-all text-[11px] leading-relaxed">
                          {
                            boundary.activateCommand
                          }
                        </code>
                      </div>

                      <div className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-3">
                        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                          <RotateCcw className="h-3.5 w-3.5" />
                          Rollback
                        </p>

                        <code className="block break-all text-[11px] leading-relaxed text-[var(--ysim-color-text-muted)]">
                          {
                            boundary.rollbackCommand
                          }
                        </code>
                      </div>
                    </div>
                  </article>
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
            title="Quy tắc activation"
          />

          <div className="space-y-3 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5">
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
                    className="flex items-start gap-3 text-sm font-semibold leading-7 text-[var(--ysim-color-text-muted)]"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-xs font-bold text-white">
                      {
                        index +
                        1
                      }
                    </span>

                    {
                      guardrail
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
