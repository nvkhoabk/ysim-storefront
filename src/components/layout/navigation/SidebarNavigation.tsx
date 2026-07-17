import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import Link from "next/link";

export interface SidebarNavigationItem {
  label: string;

  href: string;

  description?: string;

  active?: boolean;

  icon?: ReactNode;

  disabled?: boolean;
}

export interface SidebarNavigationGroup {
  title?: string;

  items: SidebarNavigationItem[];
}

export interface SidebarNavigationProps
  extends HTMLAttributes<HTMLElement> {
  title?: string;

  description?: string;

  groups?: SidebarNavigationGroup[];

  items?: SidebarNavigationItem[];

  sticky?: boolean;
}

function joinClasses(
  ...classes: Array<
    string | undefined | false
  >
): string {
  return classes
    .filter(Boolean)
    .join(" ");
}

function NavigationItem({
  item,
}: {
  item: SidebarNavigationItem;
}) {
  const content = (
    <>
      {item.icon ? (
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {item.icon}
        </span>
      ) : null}

      <span className="min-w-0">
        <span
          className={joinClasses(
            "block text-sm font-semibold",
            item.active
              ? "text-green-800"
              : "text-slate-800",
          )}
        >
          {item.label}
        </span>

        {item.description ? (
          <span
            className={joinClasses(
              "mt-1 block text-xs leading-5",
              item.active
                ? "text-green-700"
                : "text-slate-500",
            )}
          >
            {item.description}
          </span>
        ) : null}
      </span>
    </>
  );

  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        className="flex cursor-not-allowed gap-3 rounded-xl px-4 py-3 opacity-50"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={
        item.active
          ? "page"
          : undefined
      }
      className={joinClasses(
        "group flex gap-3 rounded-xl border px-4 py-3 transition",

        item.active
          ? "border-green-200 bg-green-50 shadow-sm"
          : "border-transparent hover:border-slate-200 hover:bg-slate-50",
      )}
    >
      {content}
    </Link>
  );
}

export function SidebarNavigation({
  title,
  description,
  groups,
  items,
  sticky = true,
  className,
  ...props
}: SidebarNavigationProps) {
  const normalizedGroups =
    groups && groups.length > 0
      ? groups
      : [
          {
            items: items ?? [],
          },
        ];

  return (
    <nav
      aria-label={
        title ?? "Điều hướng trang"
      }
      className={joinClasses(
        sticky
          ? "lg:sticky lg:top-24"
          : "",
        className,
      )}
      {...props}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {title || description ? (
          <div className="border-b border-slate-100 px-2 pb-4">
            {title ? (
              <h2 className="text-base font-bold text-slate-950">
                {title}
              </h2>
            ) : null}

            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          className={joinClasses(
            title || description
              ? "pt-4"
              : "",
            "space-y-5",
          )}
        >
          {normalizedGroups.map(
            (group, groupIndex) => (
              <div
                key={
                  group.title ??
                  `group-${groupIndex}`
                }
              >
                {group.title ? (
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {group.title}
                  </p>
                ) : null}

                <div className="space-y-1">
                  {group.items.map(
                    (item) => (
                      <NavigationItem
                        key={item.href}
                        item={item}
                      />
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </nav>
  );
}