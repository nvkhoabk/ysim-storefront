import {
  notFound,
} from "next/navigation";

import type {
  Metadata,
} from "next";

import {
  ArticlePageComposition,
} from "@/components/content/refactor";

import {
  createGuideMetadata,
  loadGuideArticle,
  parseContentLocale,
} from "@/lib/content/integration";

export const dynamic =
  "force-dynamic";

interface GuideArticlePageProps {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    locale?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: GuideArticlePageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const query =
    await searchParams;

  const locale =
    parseContentLocale(
      query.locale,
    );

  const result =
    await loadGuideArticle({
      locale,
      slug,
    });

  if (!result) {
    return {
      title:
        "Không tìm thấy Guide | YSim",

      robots: {
        index:
          false,
        follow:
          false,
      },
    };
  }

  return {
    ...createGuideMetadata(
      result.page.article,
    ),

    robots: {
      index:
        false,
      follow:
        false,
    },
  };
}

export default async function GuideArticlePage({
  params,
  searchParams,
}: GuideArticlePageProps) {
  const {
    slug,
  } =
    await params;

  const query =
    await searchParams;

  const locale =
    parseContentLocale(
      query.locale,
    );

  const result =
    await loadGuideArticle({
      locale,
      slug,
    });

  if (!result) {
    notFound();
  }

  return (
    <ArticlePageComposition
      page={
        result.page
      }
      cartCount={2}
    />
  );
}
