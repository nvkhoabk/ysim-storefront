import {
  HomePageComposition,
} from "@/components/home/refactor";

import {
  storefrontHomeContent,
} from "@/config/storefront-home";

import {
  homePreviewDestinations,
  homePreviewProducts,
} from "@/config/storefront-home-preview";

import {
  homeHero,
  heroSearchPreviewItems,
} from "@/config/storefront-heroes";

import type {
  HomePageViewModel,
} from "@/types/view-models/home";

export const metadata = {
  title:
    "Home Refactor Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

const homePage:
  HomePageViewModel = {
    hero: {
      ...homeHero,

      /*
       * Search là CTA chính trên Home.
       * Loại bỏ button CTA khỏi preview composition
       * để giữ nguyên tắc one-primary-action.
       */
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

export default function HomeRefactorPreviewPage() {
  return (
    <HomePageComposition
      page={
        homePage
      }
      cartCount={2}
    />
  );
}
