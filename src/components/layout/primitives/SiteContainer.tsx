import type { HTMLAttributes } from "react";
import clsx from "clsx";

type SiteContainerSize =
  | "default"
  | "narrow"
  | "wide";

interface SiteContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  size?: SiteContainerSize;
}

const SIZE_CLASS: Record<
  SiteContainerSize,
  string
> = {
  default: "max-w-7xl",

  narrow: "max-w-5xl",

  wide: "max-w-[1440px]",
};

export function SiteContainer({
  size = "default",
  className,
  children,
  ...props
}: SiteContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}