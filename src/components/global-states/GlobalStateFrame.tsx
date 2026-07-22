import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  GlobalStateActionViewModel,
  GlobalStateTone,
} from "@/types/view-models/global-state";

const toneClasses:
  Record<
    GlobalStateTone,
    {
      icon: string;
      eyebrow: string;
      panel: string;
    }
  > = {
    neutral: {
      icon:
        "bg-slate-100 text-slate-700",
      eyebrow:
        "text-slate-600",
      panel:
        "border-[var(--ysim-color-border)]",
    },
    brand: {
      icon:
        "bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]",
      eyebrow:
        "text-[var(--ysim-color-brand-700)]",
      panel:
        "border-[var(--ysim-color-brand-200)]",
    },
    warning: {
      icon:
        "bg-amber-50 text-amber-800",
      eyebrow:
        "text-amber-800",
      panel:
        "border-amber-200",
    },
    danger: {
      icon:
        "bg-red-50 text-red-700",
      eyebrow:
        "text-red-700",
      panel:
        "border-red-200",
    },
  };

const actionClasses:
  Record<
    GlobalStateActionViewModel["variant"],
    string
  > = {
    primary:
      "border-transparent bg-[var(--ysim-color-brand-700)] text-white hover:bg-[var(--ysim-color-brand-800)]",
    outline:
      "border-[var(--ysim-color-brand-700)] bg-white text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]",
    ghost:
      "border-transparent bg-transparent text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]",
  };

function StateLink({
  action,
}: {
  action:
    GlobalStateActionViewModel;
}) {
  if (!action.href) {
    return null;
  }

  return (
    <Link
      href={
        action.href
      }
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] border px-5 text-sm font-bold transition ${actionClasses[action.variant]}`}
    >
      {
        action.label
      }

      <ArrowRight
        aria-hidden="true"
        className="h-4 w-4"
      />
    </Link>
  );
}

export function GlobalStateFrame({
  tone,
  icon,
  eyebrow,
  title,
  description,
  detail,
  primaryAction,
  secondaryAction,
  customPrimaryAction,
  role,
  ariaLive,
  children,
}: {
  tone:
    GlobalStateTone;
  icon:
    ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  detail?: string;
  primaryAction?:
    GlobalStateActionViewModel;
  secondaryAction?:
    GlobalStateActionViewModel;
  customPrimaryAction?:
    ReactNode;
  role?:
    "alert" |
    "status";
  ariaLive?:
    "assertive" |
    "polite";
  children?:
    ReactNode;
}) {
  const classes =
    toneClasses[
      tone
    ];

  return (
    <div
      role={
        role
      }
      aria-live={
        ariaLive
      }
      aria-atomic={
        ariaLive
          ? true
          : undefined
      }
      className={`mx-auto w-full max-w-3xl rounded-[var(--ysim-radius-xl)] border bg-white p-7 text-center shadow-[var(--ysim-shadow-sm)] sm:p-10 ${classes.panel}`}
    >
      <span
        aria-hidden="true"
        className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[var(--ysim-radius-lg)] ${classes.icon}`}
      >
        {
          icon
        }
      </span>

      {
        eyebrow
          ? (
              <p className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${classes.eyebrow}`}>
                {
                  eyebrow
                }
              </p>
            )
          : null
      }

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[var(--ysim-color-text)] sm:text-4xl">
        {
          title
        }
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--ysim-color-text-muted)] sm:text-base">
        {
          description
        }
      </p>

      {
        detail
          ? (
              <p className="mx-auto mt-3 max-w-2xl text-xs font-semibold leading-6 text-[var(--ysim-color-text-soft)]">
                {
                  detail
                }
              </p>
            )
          : null
      }

      {
        children
          ? (
              <div className="mt-7">
                {
                  children
                }
              </div>
            )
          : null
      }

      {
        customPrimaryAction ||
        primaryAction ||
        secondaryAction
          ? (
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                {
                  customPrimaryAction
                }

                {
                  primaryAction
                    ? (
                        <StateLink
                          action={
                            primaryAction
                          }
                        />
                      )
                    : null
                }

                {
                  secondaryAction
                    ? (
                        <StateLink
                          action={
                            secondaryAction
                          }
                        />
                      )
                    : null
                }
              </div>
            )
          : null
      }
    </div>
  );
}
