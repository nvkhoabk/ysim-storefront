import {
  storefrontHomeContent,
} from "@/config/storefront-home";

import {
  homePreviewDestinations,
  homePreviewProducts,
} from "@/config/storefront-home-preview";

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

        content:
          storefrontHomeContent,
      };
    },
  };
}
