import {
  HeroContent,
  HeroMedia,
  HeroShell,
} from "@/components/hero";

import {
  PageShell,
} from "@/components/layout";

import type {
  SupportPageViewModel,
} from "@/types/view-models/support";

import {
  DeviceCompatibilityChecker,
} from "./DeviceCompatibilityChecker";

import {
  FaqAccordion,
} from "./FaqAccordion";

import {
  SupportContactChannels,
} from "./SupportContactChannels";

import {
  SupportTopicGrid,
} from "./SupportTopicGrid";

export interface SupportPageCompositionProps {
  page:
    SupportPageViewModel;
  cartCount?: number;
}

export function SupportPageComposition({
  page,
  cartCount = 0,
}: SupportPageCompositionProps) {
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

      <SupportTopicGrid
        topics={
          page.topics
        }
      />

      <DeviceCompatibilityChecker
        devices={
          page.devices
        }
        manualChecks={
          page.manualChecks
        }
      />

      <FaqAccordion
        items={
          page.faqs
        }
      />

      <SupportContactChannels
        channels={
          page.contacts
        }
      />
    </PageShell>
  );
}
