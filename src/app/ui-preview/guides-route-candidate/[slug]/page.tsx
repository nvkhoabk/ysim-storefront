import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  GuideArticleRouteCandidatePage,
} from "@/components/content/refactor/integration";

import {
  createGuideMetadata,
  parseContentLocale,
} from "@/lib/content/integration";

import {
  loadGuideArticleRouteCandidate,
} from "@/lib/content/route-candidate";

export const dynamic = "force-dynamic";

interface PageProps {
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
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const locale = parseContentLocale(query.locale);

  const candidate = await loadGuideArticleRouteCandidate({
    locale,
    slug,
  });

  if (!candidate) {
    return {
      title: "Không tìm thấy Guide | YSim",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    ...createGuideMetadata(candidate.page.article),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function GuideArticleCandidatePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = parseContentLocale(query.locale);

  const candidate = await loadGuideArticleRouteCandidate({
    locale,
    slug,
  });

  if (!candidate) notFound();

  return (
    <GuideArticleRouteCandidatePage
      candidate={candidate}
    />
  );
}
