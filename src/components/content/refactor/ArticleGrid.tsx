import type { ArticleCardViewModel } from "@/types/view-models/content";

import { ArticleCard } from "./ArticleCard";

export interface ArticleGridProps {
  articles: readonly ArticleCardViewModel[];
  actionLabel?: string;
}

export function ArticleGrid({ articles, actionLabel }: ArticleGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article, index) => (
        <ArticleCard
          key={`${article.familyCode}-${article.locale}`}
          article={article}
          priority={index < 3}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
}
