import type {
  ReactNode,
} from "react";

export interface CheckoutSectionProps {
  step: number;
  title: string;
  description?: string;
  children:
    ReactNode;
}

export function CheckoutSection({
  step,
  title,
  description,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ysim-color-brand-700)] text-sm font-bold text-white">
          {step}
        </span>

        <div>
          <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}
