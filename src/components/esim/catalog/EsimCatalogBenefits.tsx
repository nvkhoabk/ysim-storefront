import type { ReactNode } from "react";

import type {
  EsimCatalogBenefit,
} from "./types";

export interface EsimCatalogBenefitsProps {
  benefits: EsimCatalogBenefit[];

  renderIcon?: (
    benefit: EsimCatalogBenefit,
  ) => ReactNode;

  className?: string;
}

function joinClasses(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes.filter(Boolean).join(" ");
}

export function EsimCatalogBenefits({
  benefits,
  renderIcon,
  className,
}: EsimCatalogBenefitsProps) {
  return (
    <section
      aria-label="Lợi ích khi sử dụng eSIM YSim"
      className={joinClasses(
        "border-t border-slate-200 pt-6",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => {
          const visual =
            renderIcon?.(benefit) ??
            benefit.icon;

          return (
            <article
              key={benefit.id}
              className="min-w-0 text-center"
            >
              {visual ? (
                <div
                  aria-hidden="true"
                  className="mx-auto flex h-9 w-9 items-center justify-center text-green-700"
                >
                  {visual}
                </div>
              ) : null}

              <h3
                className={joinClasses(
                  "text-xs font-semibold leading-5 text-slate-800",
                  visual ? "mt-2" : "",
                )}
              >
                {benefit.title}
              </h3>

              {benefit.description ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {benefit.description}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}