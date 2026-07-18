"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import {
  BookOpen,
  CircleHelp,
  MonitorSmartphone,
  Video,
} from "lucide-react";

import type {
  GuidesTabItem,
  GuidesTabKey,
} from "./types";

export interface GuidesTabsProps {
  items: GuidesTabItem[];

  activeTab?: GuidesTabKey;

  renderIcon?: (
    item: GuidesTabItem,
    active: boolean,
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

function DefaultTabIcon({
  tabKey,
}: {
  tabKey: GuidesTabKey;
}) {
  switch (tabKey) {
    case "device-check":
      return (
        <MonitorSmartphone className="h-5 w-5" />
      );

    case "faq":
      return (
        <CircleHelp className="h-5 w-5" />
      );

    case "videos":
      return <Video className="h-5 w-5" />;

    case "installation":
    default:
      return (
        <BookOpen className="h-5 w-5" />
      );
  }
}

export function GuidesTabs({
  items,
  activeTab = "installation",
  renderIcon,
  className,
}: GuidesTabsProps) {
  return (
    <nav
      aria-label="Danh mục hướng dẫn"
      className={joinClasses(
        "border-t border-slate-200 bg-white",
        className,
      )}
    >
      <div className="grid gap-2 p-3 sm:p-4 lg:grid-cols-4 lg:gap-0 lg:p-0">
        {items.map((item) => {
          const active =
            item.key === activeTab;

          const icon =
            renderIcon?.(item, active) ??
            item.icon ?? (
              <DefaultTabIcon
                tabKey={item.key}
              />
            );

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={joinClasses(
                "group flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700",
                "lg:justify-center lg:rounded-none lg:border-r lg:border-slate-200 lg:last:border-r-0",
                active
                  ? "bg-green-700 text-white shadow-sm lg:bg-green-700"
                  : "bg-white text-slate-700 hover:bg-green-50 hover:text-green-700",
              )}
            >
              <span
                aria-hidden="true"
                className={joinClasses(
                  "flex h-6 w-6 shrink-0 items-center justify-center",
                  active
                    ? "text-white"
                    : "text-slate-500 group-hover:text-green-700",
                )}
              >
                {icon}
              </span>

              <span className="min-w-0 truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}