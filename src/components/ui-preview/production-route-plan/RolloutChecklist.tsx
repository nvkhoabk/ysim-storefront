import {
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import type {
  ProductionRoutePlanViewModel,
} from "@/types/view-models/production-route-plan";

export function RolloutChecklist({
  plan,
}: {
  plan:
    ProductionRoutePlanViewModel;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--ysim-color-text)]">
          <CheckCircle2 className="h-5 w-5 text-[var(--ysim-color-brand-700)]" />

          Global acceptance
        </h3>

        <div className="mt-5 space-y-3">
          {plan.globalChecks.map(
            (item) => (
              <p
                key={
                  item
                }
                className="rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-4 py-3 text-sm font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]"
              >
                {item}
              </p>
            ),
          )}
        </div>
      </section>

      <section className="rounded-[var(--ysim-radius-xl)] border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-amber-950">
          <ShieldAlert className="h-5 w-5" />

          Rollout rules
        </h3>

        <div className="mt-5 space-y-3">
          {plan.rolloutRules.map(
            (item) => (
              <p
                key={
                  item
                }
                className="rounded-[var(--ysim-radius-md)] bg-white/75 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-950/80"
              >
                {item}
              </p>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
