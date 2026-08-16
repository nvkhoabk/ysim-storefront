import {
  HeroContent,
  HeroMedia,
  HeroShell,
} from "@/components/hero";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  ContentLandingViewModel,
} from "@/types/view-models/content";

import {
  ArticleGrid,
} from "./ArticleGrid";

import {
  ContentCallout,
} from "./ContentCallout";

import {
  GuideCategoryNav,
} from "./GuideCategoryNav";

export interface ContentLandingCompositionProps {
  page:
    ContentLandingViewModel;
  cartCount?: number;
}

export function ContentLandingComposition({
  page,
  cartCount = 0,
}: ContentLandingCompositionProps) {
  return (
    <PageShell
      cartCount={
        cartCount
      }
    >
      <HeroShell
        variant={
          page.hero.variant
        }
        alignment={
          page.hero.alignment
        }
        media={
          <HeroMedia
            media={
              page.hero.media
            }
            priority
          />
        }
      >
        <HeroContent
          hero={
            page.hero
          }
        />
      </HeroShell>

      <Section>
        <Container>
          <GuideCategoryNav
            items={
              page.categories
            }
            activeId={
              page.activeCategoryId
            }
          />

          <div className="mt-10">
            <SectionHeader
              eyebrow={
                page.section
                  .eyebrow
              }
              title={
                page.section
                  .title
              }
              description={
                page.section
                  .description
              }
            />

            <ArticleGrid
              articles={
                page.articles
              }
            />
          </div>

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
    </PageShell>
  );
}
