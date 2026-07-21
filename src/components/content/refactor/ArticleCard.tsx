import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import type {
  ArticleCardViewModel,
} from "@/types/view-models/content";

import {
  cn,
} from "@/lib/ui/cn";

export interface ArticleCardProps {
  article:
    ArticleCardViewModel;
  className?: string;
  priority?: boolean;
}

export function ArticleCard({
  article,
  className,
  priority = false,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white shadow-[var(--ysim-shadow-sm)]",
        "transition-[transform,box-shadow,border-color] duration-[var(--ysim-duration-normal)]",
        "hover:-translate-y-1 hover:border-[var(--ysim-color-brand-200)] hover:shadow-[var(--ysim-shadow-card-hover)]",
        className,
      )}
    >
      {article.imageUrl ? (
        <Link
          href={
            article.href
          }
          aria-label={`Đọc ${article.title}`}
          className="relative block aspect-[4/3] overflow-hidden bg-[var(--ysim-color-surface-subtle)]"
        >
          <Image
            src={
              article.imageUrl
            }
            alt={
              article.imageAlt ||
              article.title
            }
            fill
            priority={
              priority
            }
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 28vw"
            className="object-cover"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
          {article.category ? (
            <span className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-50)] px-2.5 py-1 text-[var(--ysim-color-brand-800)]">
              {
                article.category
              }
            </span>
          ) : null}

          {article.publishedAtLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />

              {
                article
                  .publishedAtLabel
              }
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-xl font-bold leading-tight tracking-[-0.025em] text-[var(--ysim-color-text)]">
          <Link
            href={
              article.href
            }
            className="hover:text-[var(--ysim-color-brand-700)]"
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
            {
              article.excerpt
            }
          </p>
        ) : null}

        <Link
          href={
            article.href
          }
          className="mt-auto inline-flex min-h-10 items-center gap-2 self-start rounded-[var(--ysim-radius-md)] pt-5 text-sm font-bold text-[var(--ysim-color-brand-700)]"
        >
          Đọc bài viết

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
