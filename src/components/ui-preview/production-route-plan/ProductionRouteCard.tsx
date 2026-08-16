import Link from "next/link";

import {
  ArrowRight,
  Check,
  RotateCcw,
} from "lucide-react";

import type {
  ProductionRoutePlanItemViewModel,
} from "@/types/view-models/production-route-plan";

import {
  RouteModeBadge,
} from "./RouteModeBadge";

import {
  RouteReadinessBadge,
} from "./RouteReadinessBadge";

export function ProductionRouteCard({
  route,
}: {
  route:
    ProductionRoutePlanItemViewModel;
}) {
  return (
    <article className="flex h-full flex-col rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-50)] px-3 py-1 text-xs font-bold text-[var(--ysim-color-brand-800)]">
          Wave {route.wave}
        </span>

        <div className="flex flex-wrap gap-2">
          <RouteModeBadge
            mode={
              route.mode
            }
            label={
              route.modeLabel
            }
          />

          <RouteReadinessBadge
            readiness={
              route.readiness
            }
            label={
              route.readinessLabel
            }
          />
        </div>
      </div>

      <h3 className="mt-5 text-xl font-bold text-[var(--ysim-color-text)]">
        {route.label}
      </h3>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Production route
          </dt>

          <dd className="mt-1 break-all font-mono text-[13px] font-semibold text-[var(--ysim-color-text)]">
            {
              route.productionPath
            }
          </dd>
        </div>

        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Composition
          </dt>

          <dd className="mt-1 font-semibold text-[var(--ysim-color-text)]">
            {
              route.composition
            }
          </dd>
        </div>

        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
            Feature flag
          </dt>

          <dd className="mt-1 break-all font-mono text-[13px] font-semibold text-[var(--ysim-color-brand-800)]">
            {
              route.environmentFlag
            }=
            {
              route.mode
            }
          </dd>
        </div>
      </dl>

      <p className="mt-5 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
        {
          route.dataBoundary
        }
      </p>

      <div className="mt-5">
        <p className="text-sm font-bold text-[var(--ysim-color-text)]">
          Acceptance
        </p>

        <ul className="mt-3 space-y-2 text-sm text-[var(--ysim-color-text-muted)]">
          {route.acceptanceChecks.map(
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
          )}
        </ul>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] px-3 py-3 text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]">
        <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

        {
          route.rollback
        }
      </p>

      {route.note ? (
        <p className="mt-3 text-xs font-semibold leading-relaxed text-amber-800">
          {route.note}
        </p>
      ) : null}

      <div className="mt-auto pt-6">
        <Link
          href={
            route.previewPath
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-4 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
        >
          Mở preview

          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
