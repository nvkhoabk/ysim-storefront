import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  LockKeyhole,
  TerminalSquare,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  ReadinessGateStatus,
  ReleaseReadinessViewModel,
} from "@/types/view-models/release-readiness";

const statusClass:
  Record<
    ReadinessGateStatus,
    string
  > = {
    required:
      "bg-emerald-50 text-emerald-800",
    manual:
      "bg-sky-50 text-sky-800",
    blocked:
      "bg-amber-50 text-amber-900",
  };

const statusLabel:
  Record<
    ReadinessGateStatus,
    string
  > = {
    required:
      "Required",
    manual:
      "Manual",
    blocked:
      "Blocked",
  };

export function ReleaseReadinessPage({
  readiness,
}: {
  readiness:
    ReleaseReadinessViewModel;
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
            eyebrow="Package 36"
            title={
              readiness.title
            }
            description={
              readiness.description
            }
          />

          <div className="mt-6 rounded-[var(--ysim-radius-lg)] border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-start gap-3 text-sm font-semibold leading-7 text-amber-950">
              <AlertTriangle
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0"
              />
              Dashboard mô tả các gate. Kết quả thực tế phải được tạo bởi scripts và lưu vào evidence bundle.
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {
              readiness.gates.map(
                (gate) => (
                  <article
                    key={
                      gate.id
                    }
                    className="flex h-full flex-col rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] text-sm font-bold text-white">
                        {
                          gate.order
                        }
                      </span>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[gate.status]}`}>
                        {
                          statusLabel[
                            gate.status
                          ]
                        }
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-[var(--ysim-color-text)]">
                      {
                        gate.title
                      }
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[var(--ysim-color-text-muted)]">
                      {
                        gate.description
                      }
                    </p>

                    <ul className="mt-5 space-y-2">
                      {
                        gate.checks.map(
                          (check) => (
                            <li
                              key={
                                check
                              }
                              className="flex items-start gap-2 text-sm font-semibold leading-6 text-[var(--ysim-color-text-muted)]"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="mt-1 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]"
                              />
                              {
                                check
                              }
                            </li>
                          ),
                        )
                      }
                    </ul>

                    {
                      gate.command
                        ? (
                            <div className="mt-auto pt-5">
                              <div className="rounded-[var(--ysim-radius-md)] bg-slate-950 p-3 text-slate-100">
                                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                  <TerminalSquare
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                  />
                                  Command
                                </p>

                                <code className="block break-all text-[11px] leading-relaxed">
                                  {
                                    gate.command
                                  }
                                </code>
                              </div>
                            </div>
                          )
                        : null
                    }
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
            eyebrow="Safety"
            title="Preview guardrails"
          />

          <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)]">
            {
              readiness.safety.map(
                (
                  item,
                  index,
                ) => (
                  <p
                    key={
                      item
                    }
                    className="flex items-start gap-3 py-2 text-sm font-semibold leading-7 text-[var(--ysim-color-text-muted)]"
                  >
                    {
                      index === 0
                        ? (
                            <LockKeyhole
                              aria-hidden="true"
                              className="mt-1 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]"
                            />
                          )
                        : (
                            <CircleDot
                              aria-hidden="true"
                              className="mt-1 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]"
                            />
                          )
                    }

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
