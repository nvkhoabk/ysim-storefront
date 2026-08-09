import Image from "next/image";

import {
  CalendarDays,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  ArticlePageCompositionViewModel,
} from "@/types/view-models/content";

import {
  ArticleBody,
} from "./ArticleBody";

import {
  ArticleGrid,
} from "./ArticleGrid";

import {
  ContentCallout,
} from "./ContentCallout";

export interface ArticlePageCompositionProps {
  page:
    ArticlePageCompositionViewModel;
  cartCount?: number;
}

export function ArticlePageComposition({
  page,
  cartCount = 0,
}: ArticlePageCompositionProps) {
  const article =
    page.article;

  return (
    <PageShell
      cartCount={
        cartCount
      }
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container size="content">
          {article.category ? (
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
              {
                article.category
              }
            </p>
          ) : null}

          <h1 className="mt-4 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
            {article.title}
          </h1>

          {article.excerpt ? (
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--ysim-color-text-muted)]">
              {
                article.excerpt
              }
            </p>
          ) : null}

          {article.publishedAtLabel ? (
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
              <CalendarDays className="h-4 w-4" />

              {
                article
                  .publishedAtLabel
              }
            </p>
          ) : null}
        </Container>
      </Section>

      {article.imageUrl ? (
        <Section spacing="sm">
          <Container size="content">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] shadow-[var(--ysim-shadow-sm)]">
              <Image
                src={
                  article.imageUrl
                }
                alt={
                  article.imageAlt ||
                  article.title
                }
                fill
                priority
                sizes="(max-width: 1280px) 92vw, 80rem"
                className="object-cover"
              />
            </div>
          </Container>
        </Section>
      ) : null}

      <Section spacing="sm">
        <Container size="content">
          <ArticleBody
            article={
              article
            }
          />

          {page.callout ? (
            <ContentCallout
              callout={
                page.callout
              }
              className="mt-10"
            />
          ) : null}
        </Container>
      </Section>

      {page.relatedArticles
        .length > 0 ? (
        <Section variant="subtle">
          <Container>
            <SectionHeader
              title={
                page.relatedTitle ||
                "Bài viết liên quan"
              }
            />

            <ArticleGrid
              articles={
                page.relatedArticles
              }
            />
          </Container>
        </Section>
      ) : null}
    </PageShell>
  );
}
