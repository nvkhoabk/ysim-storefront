import {
  DestinationRail,
} from "../DestinationRail";

import {
  HeroContent,
  HeroMedia,
  HeroSearch,
  HeroShell,
} from "@/components/hero";

import {
  PageShell,
} from "@/components/layout";

import {
  TrustFeatureRow,
} from "@/components/navigation";

import {
  storefrontFooter,
} from "@/config/storefront-footer";

import type {
  DestinationPageViewModel,
} from "@/types/view-models/destination-page";

import {
  DestinationCatalog,
} from "./DestinationCatalog";

export interface DestinationPageCompositionProps {
  page:
    DestinationPageViewModel;
  cartCount?: number;
}

export function DestinationPageComposition({
  page,
  cartCount = 0,
}: DestinationPageCompositionProps) {
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
          page.popularSection
            .eyebrow
        }
        title={
          page.popularSection
            .title
        }
        description={
          page.popularSection
            .description
        }
        actionLabel={
          page.popularSection
            .actionLabel
        }
        actionHref={
          page.popularSection
            .actionHref
        }
        destinations={
          page.popularDestinations
        }
      />

      <DestinationCatalog
        section={
          page.catalog
        }
      />

      <TrustFeatureRow
        items={
          storefrontFooter
            .trustFeatures
        }
      />
    </PageShell>
  );
}
