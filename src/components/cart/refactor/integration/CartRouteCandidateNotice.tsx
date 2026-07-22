import {
  CircleAlert,
  ShoppingCart,
} from "lucide-react";

import type {
  CartRouteCandidateViewModel,
  CartRouteDiagnosticStatus,
} from "@/types/view-models/cart-route-candidate";

const classes:
  Record<
    CartRouteDiagnosticStatus,
    string
  > = {
    live:
      "bg-emerald-50 text-emerald-800",
    ready:
      "bg-slate-100 text-slate-700",
    warning:
      "bg-amber-50 text-amber-900",
    error:
      "bg-red-50 text-red-800",
  };

export function CartRouteCandidateNotice({
  candidate,
}: {
  candidate:
    CartRouteCandidateViewModel;
}) {
  return (
    <aside className="fixed bottom-4 right-4 z-[70] max-h-[calc(100vh-2rem)] w-[min(27rem,calc(100vw-2rem))] overflow-y-auto rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-white/95 p-4 shadow-[var(--ysim-shadow-lg)] backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
          <ShoppingCart className="h-5 w-5" />
        </span>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
            Cart route candidate
          </p>

          <h2 className="mt-1 font-bold text-[var(--ysim-color-text)]">
            WooCommerce diagnostics
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {
          candidate.diagnostics.map(
            (item) => (
              <div
                key={
                  item.domain
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
                    className={`rounded-[var(--ysim-radius-pill)] px-2 py-1 text-[10px] font-bold ${classes[item.status]}`}
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
          )
        }
      </div>

      <p className="mt-3 flex items-start gap-2 text-[11px] font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]">
        <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
        Production route /cart chưa thay đổi.
      </p>
    </aside>
  );
}
