import type {
  HTMLAttributes,
} from "react";

import clsx from "clsx";

import {
  SiteContainer,
} from "./SiteContainer";

interface PageSectionProps
  extends HTMLAttributes<HTMLElement> {
  container?:
    | "default"
    | "narrow"
    | "wide";

  background?:
    | "white"
    | "gray"
    | "green";

  spacing?:
    | "sm"
    | "md"
    | "lg";
}

const BG = {
  white: "bg-white",

  gray: "bg-slate-50",

  green:
    "bg-gradient-to-b from-green-50 to-white",
};

const SPACING = {
  sm: "py-8",

  md: "py-12",

  lg: "py-20",
};

export function PageSection({
  children,

  className,

  container = "default",

  background = "white",

  spacing = "md",

  ...props
}: PageSectionProps) {
  return (
    <section
      className={clsx(
        BG[background],

        SPACING[spacing],

        className,
      )}
      {...props}
    >
      <SiteContainer size={container}>
        {children}
      </SiteContainer>
    </section>
  );
}