import {
  CircleAlert,
  Database,
  GitBranch,
  MapPinned,
} from "lucide-react";

import type {
  DestinationRouteCandidateViewModel,
  DestinationRouteDiagnosticStatus,
} from "@/types/view-models/destination-route-candidate";

import {
  cn,
} from "@/lib/ui/cn";

const diagnosticClass:
  Record<
    DestinationRouteDiagnosticStatus,
    string
  > = {
    live:
      "bg-emerald-50 text-emerald-800",
    fixture:
      "bg-slate-100 text-slate-700",
    fallback:
      "bg-amber-50 text-amber-900",
    warning:
      "bg-orange-50 text-orange-900",
  };

export function DestinationRouteCandidateNotice({
  candidate,
}: {
  candidate:
    DestinationRouteCandidateViewModel;
}) {
  return (
    <aside className="fixed bottom-4 right-4 z-[70] max-h-[calc(100vh-2rem)] w-[min(27rem,calc(100vw-2rem))] overflow-y-auto rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-white/95 p-4 shadow-[var(--ysim-shadow-lg)] backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
          <MapPinned className="h-5 w-5" />
        </span>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
            Destination route candidate
          </p>

          <h2 className="mt-1 font-bold text-[var(--ysim-color-text)]">
            Catalog diagnostics
          </h2>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-xs">
        <div className="flex items-center justify-between gap-3 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-2">
          <dt className="inline-flex items-center gap-2 font-semibold text-[var(--ysim-color-text-muted)]">
            <GitBranch className="h-3.5 w-3.5" />
            Route
          </dt>

          <dd className="font-bold text-[var(--ysim-color-text)]">
            {
              candidate.routeModeLabel
            }
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-2">
          <dt className="inline-flex items-center gap-2 font-semibold text-[var(--ysim-color-text-muted)]">
            <Database className="h-3.5 w-3.5" />
            Data
          </dt>

          <dd className="font-bold text-[var(--ysim-color-text)]">
            {
              candidate.sourceModeLabel
            }
          </dd>
        </div>
      </dl>

      <div className="mt-3 space-y-2">
        {candidate.diagnostics.map(
          (item) => (
            <div
              key={
                `${item.domain}-${item.label}`
              }
              className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-xs text-[var(--ysim-color-text)]">
                  {
                    item.label
                  }
                </strong>

                <span
                  className={cn(
                    "rounded-[var(--ysim-radius-pill)] px-2 py-1 text-[10px] font-bold",
                    diagnosticClass[
                      item.status
                    ],
                  )}
                >
                  {
                    item.statusLabel
                  }
                </span>
              </div>

              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]">
                {
                  item.message
                }
              </p>
            </div>
          ),
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {candidate.warnings.map(
          (warning) => (
            <p
              key={
                warning
              }
              className="flex items-start gap-2 text-[11px] font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]"
            >
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
              {warning}
            </p>
          ),
        )}
      </div>
    </aside>
  );
}
