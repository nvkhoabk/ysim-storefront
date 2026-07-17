import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import {
  PageBreadcrumbs,
  SiteContainer,
} from "../primitives";

import type {
  BreadcrumbItem,
} from "../primitives";

export type PageHeroTone =
  | "green"
  | "light"
  | "white";

export type PageHeroAlign =
  | "left"
  | "center";

export interface PageHeroProps
  extends Omit<
    HTMLAttributes<HTMLElement>,
    "title"
  > {
  breadcrumbs?: BreadcrumbItem[];

  eyebrow?: string;

  title: ReactNode;

  description?: ReactNode;

  actions?: ReactNode;

  visual?: ReactNode;

  tone?: PageHeroTone;

  align?: PageHeroAlign;

  container?: "default" | "narrow" | "wide";
}

const TONE_CLASSES: Record<
  PageHeroTone,
  {
    section: string;
    eyebrow: string;
    title: string;
    description: string;
    breadcrumbWrapper: string;
  }
> = {
  green: {
    section:
      "bg-gradient-to-br from-green-700 via-green-650 to-emerald-800 text-white",

    eyebrow:
      "text-green-100",

    title:
      "text-white",

    description:
      "text-green-50/90",

    breadcrumbWrapper:
      "[&_a]:text-green-100 [&_a:hover]:text-white [&_span]:text-green-50 [&_svg]:text-green-200",
  },

  light: {
    section:
      "bg-gradient-to-br from-green-50 via-white to-emerald-50",

    eyebrow:
      "text-green-700",

    title:
      "text-slate-950",

    description:
      "text-slate-600",

    breadcrumbWrapper:
      "",
  },

  white: {
    section:
      "bg-white",

    eyebrow:
      "text-green-700",

    title:
      "text-slate-950",

    description:
      "text-slate-600",

    breadcrumbWrapper:
      "",
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

export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  description,
  actions,
  visual,
  tone = "light",
  align = "left",
  container = "default",
  className,
  ...props
}: PageHeroProps) {
  const toneClasses =
    TONE_CLASSES[tone];

  const isCentered =
    align === "center";

  return (
    <section
      className={joinClasses(
        "relative overflow-hidden",
        toneClasses.section,
        className,
      )}
      {...props}
    >
      <SiteContainer size={container}>
        <div className="py-10 sm:py-12 lg:py-16">
          {breadcrumbs &&
          breadcrumbs.length > 0 ? (
            <div
              className={joinClasses(
                "mb-8",
                toneClasses.breadcrumbWrapper,
              )}
            >
              <PageBreadcrumbs
                items={breadcrumbs}
              />
            </div>
          ) : null}

          <div
            className={joinClasses(
              visual
                ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:gap-14"
                : "",

              isCentered &&
                !visual
                ? "mx-auto max-w-4xl text-center"
                : "",
            )}
          >
            <div
              className={joinClasses(
                isCentered && visual
                  ? "text-center lg:text-left"
                  : "",
              )}
            >
              {eyebrow ? (
                <p
                  className={joinClasses(
                    "text-sm font-semibold uppercase tracking-[0.16em]",
                    toneClasses.eyebrow,
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}

              <h1
                className={joinClasses(
                  eyebrow ? "mt-4" : "",
                  "text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
                  toneClasses.title,
                )}
              >
                {title}
              </h1>

              {description ? (
                <div
                  className={joinClasses(
                    "mt-6 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8",
                    isCentered &&
                      !visual
                      ? "mx-auto"
                      : "",
                    toneClasses.description,
                  )}
                >
                  {description}
                </div>
              ) : null}

              {actions ? (
                <div
                  className={joinClasses(
                    "mt-8 flex flex-wrap gap-3",
                    isCentered &&
                      !visual
                      ? "justify-center"
                      : "",
                  )}
                >
                  {actions}
                </div>
              ) : null}
            </div>

            {visual ? (
              <div
                className="flex min-h-64 items-center justify-center lg:min-h-80"
                aria-hidden="true"
              >
                {visual}
              </div>
            ) : null}
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}