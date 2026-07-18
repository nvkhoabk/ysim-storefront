import type { ReactNode } from "react";

import { SiteContainer } from "./primitives";

function joinClasses(
  ...classes: Array<string | undefined | false>
): string {
  return classes.filter(Boolean).join(" ");
}

interface PageShellProps {
  sidebar?: ReactNode;

  aside?: ReactNode;

  children: ReactNode;

  container?: "default" | "wide" | "narrow";

  className?: string;

  contentClassName?: string;
}

export function PageShell({
  sidebar,
  aside,
  children,
  container = "default",
  className,
  contentClassName,
}: PageShellProps) {
  return (
    <SiteContainer size={container}>
      <div
        className={joinClasses(
          "grid gap-8 lg:gap-10",

          sidebar && aside
            ? "lg:grid-cols-[260px_minmax(0,1fr)_320px]"
            : undefined,

          sidebar && !aside
            ? "lg:grid-cols-[260px_minmax(0,1fr)]"
            : undefined,

          !sidebar && aside
            ? "lg:grid-cols-[minmax(0,1fr)_320px]"
            : undefined,

          className,
        )}
      >
        {sidebar ? (
          <div className="min-w-0">{sidebar}</div>
        ) : null}

        <main
          className={joinClasses(
            "min-w-0",
            contentClassName,
          )}
        >
          {children}
        </main>

        {aside ? (
          <div className="min-w-0">{aside}</div>
        ) : null}
      </div>
    </SiteContainer>
  );
}