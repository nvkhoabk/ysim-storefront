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

import type {
  DestinationRouteDataAdapter,
} from "./destination-route-adapter";

export function createFixtureDestinationRouteAdapter():
  DestinationRouteDataAdapter {
  return {
    id:
      "fixture-destination-route-adapter",

    async load():
      Promise<
        DestinationPageViewModel
      > {
      return {
        hero: {
          ...destinationPageHero,
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
    },

    getDiagnostics() {
      return [
        {
          domain:
            "commerce" as const,
          label:
            "WooCommerce",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            "Catalog đang dùng dữ liệu preview Package 08.",
        },
        {
          domain:
            "catalog" as const,
          label:
            "Destination catalog",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            `${destinationCatalogPreviewItems.length} điểm đến đã được review.`,
          itemCount:
            destinationCatalogPreviewItems.length,
        },
        {
          domain:
            "search" as const,
          label:
            "Hero Search",
          status:
            "fixture" as const,
          statusLabel:
            "Fixture",
          message:
            "Search đang dùng fixture tổng hợp.",
          itemCount:
            heroSearchPreviewItems.length,
        },
      ];
    },
  };
}
