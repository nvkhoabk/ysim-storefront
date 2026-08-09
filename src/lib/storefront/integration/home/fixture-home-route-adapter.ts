import {
  storefrontHomeContent,
} from "@/config/storefront-home";

import {
  homePreviewDestinations,
  homePreviewProducts,
} from "@/config/storefront-home-preview";

import {
  productionHomeGuideSection,
} from "@/config/storefront-production-home";

import {
  contentPreviewArticles,
} from "@/config/storefront-content-preview";

import {
  heroSearchPreviewItems,
  homeHero,
} from "@/config/storefront-heroes";

import type {
  HomePageViewModel,
} from "@/types/view-models/home";

import type {
  HomeRouteDataAdapter,
} from "./home-route-adapter";

export function createFixtureHomeRouteAdapter():
  HomeRouteDataAdapter {
  return {
    id:
      "fixture-home-route-adapter",

    async load():
      Promise<
        HomePageViewModel
      > {
      return {
        hero: {
          ...homeHero,

          primaryAction:
            undefined,

          secondaryAction:
            undefined,
        },

        heroSearchItems:
          heroSearchPreviewItems,

        destinations:
          homePreviewDestinations,

        products:
          homePreviewProducts,

        guides:
          contentPreviewArticles.slice(
            0,
            3,
          ),

        content: {
          ...storefrontHomeContent,

          guideSection:
            productionHomeGuideSection,
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
            "skipped" as const,

          statusLabel:
            "Fixture",

          message:
            "Destination và Product đang dùng fixture đã review.",
        },
        {
          domain:
            "content" as const,

          label:
            "WordPress",

          status:
            "skipped" as const,

          statusLabel:
            "Fixture",

          message:
            "Guide đang dùng fixture đã review.",
        },
      ];
    },
  };
}
