import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  RotateCcw,
  TerminalSquare,
} from "lucide-react";

import type {
  Wave3ActivationRouteViewModel,
} from "@/types/view-models/wave3-activation";

const modeClasses = {
  legacy:
    "bg-slate-100 text-slate-700",
  candidate:
    "bg-amber-50 text-amber-900",
  refactor:
    "bg-emerald-50 text-emerald-800",
} as const;

const readinessClasses = {
  "candidate-ready":
    "bg-emerald-50 text-emerald-800",
  "source-switch-only":
    "bg-amber-50 text-amber-900",
  blocked:
    "bg-red-50 text-red-800",
} as const;

export function Wave3ActivationRouteCard({
  route,
}: {
  route:
    Wave3ActivationRouteViewModel;
}) {
  return (
    <article className="flex h-full flex-col rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] text-sm font-bold text-white">
          {
            route.order
          }
        </span>

        <div className="flex flex-wrap justify-end gap-2">
          <span className={`rounded-[var(--ysim-radius-pill)] px-3 py-1 text-xs font-bold ${modeClasses[route.mode]}`}>
            {
              route.modeLabel
            }
          </span>

          <span className={`rounded-[var(--ysim-radius-pill)] px-3 py-1 text-xs font-bold ${readinessClasses[route.readiness]}`}>
            {
              route.readinessLabel
            }
          </span>
        </div>
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
        {
          route.risk
        } risk
      </p>

      <h2 className="mt-2 text-xl font-bold text-[var(--ysim-color-text)]">
        {
          route.label
        }
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Production
          </dt>
          <dd className="mt-1 font-mono text-[13px] font-semibold">
            {
              route.productionPath
            }
          </dd>
        </div>

        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Flag
          </dt>
          <dd className="mt-1 font-mono text-[13px] font-semibold text-[var(--ysim-color-brand-800)]">
            {
              route.featureFlag
            }={
              route.mode
            }
          </dd>
        </div>
      </dl>

      <ul className="mt-5 space-y-2 text-sm text-[var(--ysim-color-text-muted)]">
        {
          route.acceptanceChecks.map(
            (check) => (
              <li
                key={
                  check
                }
                className="flex items-start gap-2"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />
                {check}
              </li>
            ),
          )
        }
      </ul>

      {
        route.note
          ? (
              <p className="mt-5 flex items-start gap-2 rounded-[var(--ysim-radius-md)] border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {
                  route.note
                }
              </p>
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
              route.activationCommand
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
              route.rollbackCommand
            }
          </code>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Link
          href={
            route.candidatePath
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
        >
          Mở candidate
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
