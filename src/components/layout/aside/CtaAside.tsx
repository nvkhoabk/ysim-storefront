import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import Link from "next/link";

export type CtaAsideTone =
  | "green"
  | "light"
  | "dark";

export interface CtaAsideAction {
  label: string;

  href: string;

  external?: boolean;
}

export interface CtaAsideProps
  extends Omit<
    HTMLAttributes<HTMLElement>,
    "title"
  > {
  eyebrow?: string;

  title: ReactNode;

  description?: ReactNode;

  visual?: ReactNode;

  primaryAction?: CtaAsideAction;

  secondaryAction?: CtaAsideAction;

  note?: ReactNode;

  tone?: CtaAsideTone;

  sticky?: boolean;
}

const TONE_CLASSES: Record<
  CtaAsideTone,
  {
    wrapper: string;
    eyebrow: string;
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
    note: string;
  }
> = {
  green: {
    wrapper:
      "border-green-700 bg-gradient-to-br from-green-700 to-emerald-800",

    eyebrow:
      "text-green-100",

    title:
      "text-white",

    description:
      "text-green-50/90",

    primaryButton:
      "bg-white text-green-800 hover:bg-green-50 focus-visible:outline-white",

    secondaryButton:
      "border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",

    note:
      "text-green-100",
  },

  light: {
    wrapper:
      "border-green-200 bg-gradient-to-br from-green-50 to-white",

    eyebrow:
      "text-green-700",

    title:
      "text-slate-950",

    description:
      "text-slate-600",

    primaryButton:
      "bg-green-700 text-white hover:bg-green-800 focus-visible:outline-green-700",

    secondaryButton:
      "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-green-700",

    note:
      "text-slate-500",
  },

  dark: {
    wrapper:
      "border-slate-800 bg-slate-950",

    eyebrow:
      "text-green-400",

    title:
      "text-white",

    description:
      "text-slate-300",

    primaryButton:
      "bg-green-500 text-slate-950 hover:bg-green-400 focus-visible:outline-green-400",

    secondaryButton:
      "border-slate-700 bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-white",

    note:
      "text-slate-400",
  },
};

function joinClasses(
  ...classes: Array<
    string | undefined | false
  >
): string {
  return classes
    .filter(Boolean)
    .join(" ");
}

function ActionLink({
  action,
  className,
}: {
  action: CtaAsideAction;
  className: string;
}) {
  const commonClassName =
    joinClasses(
      "inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
      className,
    );

  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        className={commonClassName}
      >
        {action.label}
      </a>
    );
  }

  return (
    <Link
      href={action.href}
      className={commonClassName}
    >
      {action.label}
    </Link>
  );
}

export function CtaAside({
  eyebrow,
  title,
  description,
  visual,
  primaryAction,
  secondaryAction,
  note,
  tone = "light",
  sticky = true,
  className,
  ...props
}: CtaAsideProps) {
  const toneClasses =
    TONE_CLASSES[tone];

  return (
    <aside
      className={joinClasses(
        sticky
          ? "lg:sticky lg:top-24"
          : "",
        className,
      )}
      {...props}
    >
      <div
        className={joinClasses(
          "overflow-hidden rounded-3xl border p-6 shadow-sm sm:p-7",
          toneClasses.wrapper,
        )}
      >
        {visual ? (
          <div
            className="mb-6 flex min-h-36 items-center justify-center"
            aria-hidden="true"
          >
            {visual}
          </div>
        ) : null}

        {eyebrow ? (
          <p
            className={joinClasses(
              "text-xs font-semibold uppercase tracking-[0.14em]",
              toneClasses.eyebrow,
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h2
          className={joinClasses(
            eyebrow ? "mt-3" : "",
            "text-2xl font-bold tracking-tight",
            toneClasses.title,
          )}
        >
          {title}
        </h2>

        {description ? (
          <div
            className={joinClasses(
              "mt-4 text-sm leading-6",
              toneClasses.description,
            )}
          >
            {description}
          </div>
        ) : null}

        {primaryAction ||
        secondaryAction ? (
          <div className="mt-6 space-y-3">
            {primaryAction ? (
              <ActionLink
                action={primaryAction}
                className={joinClasses(
                  "border-transparent",
                  toneClasses.primaryButton,
                )}
              />
            ) : null}

            {secondaryAction ? (
              <ActionLink
                action={secondaryAction}
                className={
                  toneClasses.secondaryButton
                }
              />
            ) : null}
          </div>
        ) : null}

        {note ? (
          <div
            className={joinClasses(
              "mt-5 border-t border-current/10 pt-4 text-xs leading-5",
              toneClasses.note,
            )}
          >
            {note}
          </div>
        ) : null}
      </div>
    </aside>
  );
}