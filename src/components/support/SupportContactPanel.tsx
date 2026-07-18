import Link from "next/link";

import type {
  SupportContactMethod,
} from "@/content/support/contact";

export interface SupportContactPanelProps {
  methods: SupportContactMethod[];

  title?: string;

  description?: string;

  className?: string;
}

export function SupportContactPanel({
  methods,
  title = "Liên hệ với chúng tôi",
  description = "Chúng tôi luôn sẵn sàng hỗ trợ bạn!",
  className,
}: SupportContactPanelProps) {
  return (
    <section
      aria-labelledby="support-contact-title"
      className={className}
    >
      <h2
        id="support-contact-title"
        className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
      >
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {methods.map((method) => {
          const Icon = method.icon;

          return (
            <article
              key={method.id}
              id={method.id}
              className="grid items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-950">
                    {method.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {method.description}
                  </p>
                </div>
              </div>

              <Link
                href={method.href}
                target={
                  method.external
                    ? "_blank"
                    : undefined
                }
                rel={
                  method.external
                    ? "noopener noreferrer"
                    : undefined
                }
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-green-700 bg-white px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                {method.actionLabel}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}