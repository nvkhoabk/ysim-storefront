import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type {
  EsimCatalogEmptyState,
} from "./types";

export interface GlobalCatalogPanelProps {
  content: EsimCatalogEmptyState;

  visual?: ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function GlobalCatalogPanel({
  content,
  visual,
  className,
}: GlobalCatalogPanelProps) {
  const href =
    content.action.href ?? "/destinations";

  return (
    <section
      className={joinClasses(
        "flex min-h-[520px] items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="max-w-xl">
        {visual ? (
          <div
            aria-hidden="true"
            className="mx-auto mb-8 flex min-h-40 items-center justify-center"
          >
            {visual}
          </div>
        ) : null}

        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-green-700">
          {content.eyebrow}
        </p>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          {content.title}
        </h2>

        <p className="mt-5 text-base leading-7 text-slate-600">
          {content.description}
        </p>

        <Link
          href={href}
          className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          {content.action.label}

          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Link>
      </div>
    </section>
  );
}