import {
  ArrowRight,
  Layers3,
} from "lucide-react";

import type {
  ProductionRoutePlanViewModel,
} from "@/types/view-models/production-route-plan";

export function IntegrationWaveTimeline({
  plan,
}: {
  plan:
    ProductionRoutePlanViewModel;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {plan.waves.map(
        (
          wave,
          index,
        ) => {
          const routes =
            wave.routeIds.map(
              (routeId) =>
                plan.routes.find(
                  (route) =>
                    route.id ===
                    routeId,
                ),
            )
            .filter(Boolean);

          return (
            <article
              key={
                wave.wave
              }
              className="relative rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5"
            >
              {index <
              plan.waves.length -
                1 ? (
                <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-[var(--ysim-color-brand-700)] lg:block" />
              ) : null}

              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] text-sm font-bold text-white">
                {
                  wave.wave
                }
              </span>

              <h3 className="mt-5 text-lg font-bold text-[var(--ysim-color-text)]">
                {wave.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                {
                  wave.description
                }
              </p>

              <div className="mt-5 space-y-2">
                {routes.map(
                  (route) =>
                    route ? (
                      <p
                        key={
                          route.id
                        }
                        className="flex items-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--ysim-color-text-muted)]"
                      >
                        <Layers3 className="h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

                        {
                          route.label
                        }
                      </p>
                    ) : null,
                )}
              </div>
            </article>
          );
        },
      )}
    </div>
  );
}
