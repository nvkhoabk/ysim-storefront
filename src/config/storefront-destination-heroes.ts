export interface StorefrontDestinationHeroSource {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface StorefrontDestinationHeroAsset {
  readonly desktop: StorefrontDestinationHeroSource;
  readonly mobile: StorefrontDestinationHeroSource;
  readonly focus: string;
  readonly configured: boolean;
}

const heroRoot = "/assets/storefront/destination-heroes";

function generatedHero(
  slug: string,
  focus = "50% 50%",
): StorefrontDestinationHeroAsset {
  return {
    desktop: {
      src: `${heroRoot}/${slug}-desktop.webp`,
      width: 1440,
      height: 810,
    },
    mobile: {
      src: `${heroRoot}/${slug}-mobile.webp`,
      width: 768,
      height: 960,
    },
    focus,
    configured: true,
  };
}

function existingHero(
  slug: string,
  focus = "50% 50%",
): StorefrontDestinationHeroAsset {
  return {
    desktop: {
      src: `${heroRoot}/${slug}-desktop.webp`,
      width: 800,
      height: 450,
    },
    mobile: {
      src: `${heroRoot}/${slug}-mobile.webp`,
      width: 480,
      height: 600,
    },
    focus,
    configured: true,
  };
}

export const storefrontDestinationHeroFallback = {
  desktop: {
    src: `${heroRoot}/fallback-desktop.webp`,
    width: 1440,
    height: 810,
  },
  mobile: {
    src: `${heroRoot}/fallback-mobile.webp`,
    width: 768,
    height: 960,
  },
  focus: "50% 50%",
  configured: false,
} as const satisfies StorefrontDestinationHeroAsset;

const destinationHeroAliases: Readonly<Record<string, string>> = {
  korea: "south-korea",
  usa: "united-states",
};

export const storefrontDestinationHeroAssets = {
  japan: existingHero("japan", "50% 48%"),
  "south-korea": existingHero("south-korea", "54% 48%"),
  thailand: existingHero("thailand", "51% 50%"),
  singapore: existingHero("singapore", "52% 50%"),
  china: existingHero("china", "52% 50%"),
  "united-states": existingHero("united-states", "52% 50%"),
  france: existingHero("france", "53% 50%"),
  laos: generatedHero("laos", "55% 50%"),
  vietnam: generatedHero("vietnam", "56% 50%"),
  taiwan: generatedHero("taiwan", "56% 48%"),
  india: generatedHero("india", "57% 50%"),
} as const satisfies Readonly<Record<string, StorefrontDestinationHeroAsset>>;

export function resolveStorefrontDestinationHero(
  slugInput: string,
): StorefrontDestinationHeroAsset {
  const normalizedSlug = slugInput.trim().toLocaleLowerCase("en");
  const canonicalSlug =
    destinationHeroAliases[normalizedSlug] ?? normalizedSlug;

  return (
    storefrontDestinationHeroAssets[
      canonicalSlug as keyof typeof storefrontDestinationHeroAssets
    ] ?? storefrontDestinationHeroFallback
  );
}
