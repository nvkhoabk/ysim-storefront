import type {
  ArticlePageViewModel,
} from "@/types/view-models/content";

export interface ArticleBodyProps {
  article:
    ArticlePageViewModel;
}

/**
 * WordPress returns rendered HTML.
 *
 * Only pass trusted content from the internal YSim CMS.
 * Do not pass customer input or arbitrary external HTML.
 */
export function ArticleBody({
  article,
}: ArticleBodyProps) {
  return (
    <article
      className={[
        "prose prose-slate max-w-none",
        "prose-headings:scroll-mt-28 prose-headings:tracking-[-0.025em]",
        "prose-a:text-[var(--ysim-color-brand-700)]",
        "prose-strong:text-[var(--ysim-color-text)]",
        "prose-img:rounded-[var(--ysim-radius-lg)]",
        "prose-blockquote:border-[var(--ysim-color-brand-500)]",
      ].join(" ")}
      dangerouslySetInnerHTML={{
        __html:
          article.contentHtml,
      }}
    />
  );
}
