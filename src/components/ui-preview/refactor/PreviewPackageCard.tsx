import Link from "next/link";

import {
  ArrowRight,
  Check,
  ExternalLink,
} from "lucide-react";

import type {
  PreviewPackageViewModel,
} from "@/types/view-models/ui-preview-registry";

import {
  PreviewStatusBadge,
} from "./PreviewStatusBadge";

export function PreviewPackageCard({
  item,
}: {
  item:
    PreviewPackageViewModel;
}) {
  return (
    <article className="flex h-full flex-col rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-[var(--ysim-color-brand-200)] hover:shadow-[var(--ysim-shadow-card-hover)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-2 text-sm font-bold text-white">
          {String(
            item.packageNumber,
          ).padStart(
            2,
            "0",
          )}
        </span>

        <PreviewStatusBadge
          status={
            item.status
          }
          label={
            item.statusLabel
          }
        />
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
        {item.phase}
      </p>

      <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[var(--ysim-color-text)]">
        {item.title}
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
        {
          item.description
        }
      </p>

      <ul className="mt-5 space-y-2 text-sm text-[var(--ysim-color-text-muted)]">
        {item.checks.map(
          (check) => (
            <li
              key={
                check
              }
              className="flex items-start gap-2"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />

              <span>
                {check}
              </span>
            </li>
          ),
        )}
      </ul>

      {item.note ? (
        <p className="mt-5 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-2 text-xs font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]">
          {item.note}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {item.routes.map(
          (route) => (
            <Link
              key={
                `${item.packageNumber}-${route.href}`
              }
              href={
                route.href
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-brand-700)] px-3 py-2 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
            >
              {
                route.label
              }

              {route.href.startsWith(
                "http",
              ) ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Link>
          ),
        )}

        {item.routes.length ===
        0 ? (
          <span className="inline-flex min-h-10 items-center rounded-[var(--ysim-radius-md)] border border-dashed border-[var(--ysim-color-border-strong)] px-3 text-sm font-semibold text-[var(--ysim-color-text-soft)]">
            Không có UI route riêng
          </span>
        ) : null}
      </div>
    </article>
  );
}
