import {
  DestinationPageComposition,
} from "@/components/destination/refactor";

import {
  destinationCatalogSection,
  destinationCategoryOptions,
  destinationPageHero,
  destinationPopularSection,
  initialDestinationFilters,
} from "@/config/storefront-destination-page";

import {
  destinationCatalogPreviewItems,
  popularDestinationPreviewItems,
} from "@/config/storefront-destination-preview";

import {
  heroSearchPreviewItems,
} from "@/config/storefront-heroes";

import type {
  DestinationPageViewModel,
} from "@/types/view-models/destination-page";

export const metadata = {
  title:
    "Destination Refactor Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

const destinationPage:
  DestinationPageViewModel = {
    hero: {
      ...destinationPageHero,

      /*
       * Search là CTA chính.
       */
      primaryAction:
        undefined,

      secondaryAction:
        undefined,
    },

    heroSearchItems:
      heroSearchPreviewItems,

    popularDestinations:
      popularDestinationPreviewItems,

    popularSection:
      destinationPopularSection,

    catalog: {
      ...destinationCatalogSection,

      categories:
        destinationCategoryOptions,

      initialFilters:
        initialDestinationFilters,

      items:
        destinationCatalogPreviewItems,
    },
  };

export default function DestinationRefactorPreviewPage() {
  return (
    <DestinationPageComposition
      page={
        destinationPage
      }
      cartCount={2}
    />
  );
}
