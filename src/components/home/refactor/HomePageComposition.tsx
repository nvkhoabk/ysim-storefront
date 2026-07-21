import {
  ArticleGrid,
} from "@/components/content/refactor";

import {
  DestinationRail,
} from "@/components/destination";

import {
  HeroContent,
  HeroMedia,
  HeroSearch,
  HeroShell,
} from "@/components/hero";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  ProductRail,
} from "@/components/product/refactor";

import type {
  HomePageViewModel,
} from "@/types/view-models/home";

import {
  HowItWorksSection,
} from "./HowItWorksSection";

import {
  PartnerLogoStrip,
} from "./PartnerLogoStrip";

import {
  SelectionAssistantBanner,
} from "./SelectionAssistantBanner";

import {
  TestimonialRail,
} from "./TestimonialRail";

import {
  ValuePropositionSection,
} from "./ValuePropositionSection";

export interface HomePageCompositionProps {
  page:
    HomePageViewModel;
  cartCount?: number;
}

export function HomePageComposition({
  page,
  cartCount = 0,
}: HomePageCompositionProps) {
  const guideSection =
    page.content
      .guideSection;

  const guides =
    page.guides ||
    [];

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
          search={
            <HeroSearch
              items={
                page.heroSearchItems
              }
            />
          }
        />
      </HeroShell>

      <DestinationRail
        eyebrow={
          page.content
            .destinationSection
            .eyebrow
        }
        title={
          page.content
            .destinationSection
            .title
        }
        description={
          page.content
            .destinationSection
            .description
        }
        actionLabel={
          page.content
            .destinationSection
            .actionLabel
        }
        actionHref={
          page.content
            .destinationSection
            .actionHref
        }
        destinations={
          page.destinations
        }
      />

      <SelectionAssistantBanner
        banner={
          page.content
            .selectionAssistant
        }
      />

      <ValuePropositionSection
        section={
          page.content
            .valueProposition
        }
      />

      <HowItWorksSection
        section={
          page.content
            .howItWorks
        }
      />

      <ProductRail
        eyebrow={
          page.content
            .productSection
            .eyebrow
        }
        title={
          page.content
            .productSection
            .title
        }
        description={
          page.content
            .productSection
            .description
        }
        actionLabel={
          page.content
            .productSection
            .actionLabel
        }
        actionHref={
          page.content
            .productSection
            .actionHref
        }
        products={
          page.products
        }
      />

      {guideSection &&
      guides.length >
        0 ? (
        <Section>
          <Container>
            <SectionHeader
              eyebrow={
                guideSection
                  .eyebrow
              }
              title={
                guideSection
                  .title
              }
              description={
                guideSection
                  .description
              }
              action={
                guideSection
                  .actionHref &&
                guideSection
                  .actionLabel ? (
                  <a
                    href={
                      guideSection
                        .actionHref
                    }
                    className="inline-flex min-h-10 items-center rounded-[var(--ysim-radius-md)] px-3 text-sm font-bold text-[var(--ysim-color-brand-700)] hover:bg-[var(--ysim-color-brand-50)]"
                  >
                    {
                      guideSection
                        .actionLabel
                    }
                  </a>
                ) : undefined
              }
            />

            <ArticleGrid
              articles={
                guides
              }
            />
          </Container>
        </Section>
      ) : null}

      <TestimonialRail
        section={
          page.content
            .testimonials
        }
      />

      <PartnerLogoStrip
        section={
          page.content
            .partners
        }
      />
    </PageShell>
  );
}
