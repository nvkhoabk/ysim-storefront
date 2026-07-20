import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
} from "lucide-react";

import type {
  NavigationItem,
} from "@/config/storefront-navigation";

export interface MegaMenuProps {
  item: NavigationItem;
}

export function MegaMenu({
  item,
}: MegaMenuProps) {
  if (
    !item.groups ||
    item.groups.length === 0
  ) {
    return null;
  }

  return (
    <details className="group relative">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-1.5 rounded-[var(--ysim-radius-md)] px-3 text-sm font-semibold text-[var(--ysim-color-text)] transition-colors hover:bg-[var(--ysim-color-surface-subtle)] [&::-webkit-details-marker]:hidden">
        {item.label}

        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-[var(--ysim-duration-fast)] group-open:rotate-180"
        />
      </summary>

      <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-[var(--ysim-z-dropdown)] w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-md)]">
        <div className="grid gap-5 md:grid-cols-2">
          {item.groups.map(
            (group) => (
              <div
                key={
                  group.label
                }
              >
                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
                  {
                    group.label
                  }
                </p>

                <div className="space-y-1">
                  {group.links.map(
                    (link) => (
                      <Link
                        key={
                          link.href
                        }
                        href={
                          link.href
                        }
                        className="group/link flex items-start justify-between gap-4 rounded-[var(--ysim-radius-md)] px-3 py-2.5 transition-colors hover:bg-[var(--ysim-color-brand-50)]"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-[var(--ysim-color-text)]">
                            {
                              link.label
                            }
                          </span>

                          {link.description ? (
                            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--ysim-color-text-muted)]">
                              {
                                link.description
                              }
                            </span>
                          ) : null}
                        </span>

                        <ArrowRight
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)] opacity-0 transition-[opacity,transform] group-hover/link:translate-x-0.5 group-hover/link:opacity-100"
                        />
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </details>
  );
}
