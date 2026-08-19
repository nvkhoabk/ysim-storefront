"use client";

import { useState } from "react";
import { getImageProps } from "next/image";

import {
  storefrontDestinationHeroFallback,
  type StorefrontDestinationHeroAsset,
} from "@/config/storefront-destination-heroes";

export interface DestinationCountryHeroProps {
  asset: StorefrontDestinationHeroAsset;
  alt: string;
}

export function DestinationCountryHero({
  asset: initialAsset,
  alt,
}: DestinationCountryHeroProps) {
  const [asset, setAsset] = useState(initialAsset);
  const desktopImage = getImageProps({
    src: asset.desktop.src,
    alt,
    title: alt,
    width: asset.desktop.width,
    height: asset.desktop.height,
    sizes: "(max-width: 1023px) 100vw, 50vw",
    quality: 82,
    priority: true,
  });
  const mobileImage = getImageProps({
    src: asset.mobile.src,
    alt,
    width: asset.mobile.width,
    height: asset.mobile.height,
    sizes: "100vw",
    quality: 82,
  });

  return (
    <div className="relative min-h-72 overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface)] shadow-sm sm:min-h-80 lg:min-h-[26rem]">
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet={mobileImage.props.srcSet}
          sizes={mobileImage.props.sizes}
        />
        <img
          {...desktopImage.props}
          alt={alt}
          title={alt}
          onError={() => {
            if (
              asset.desktop.src !==
              storefrontDestinationHeroFallback.desktop.src
            ) {
              setAsset(storefrontDestinationHeroFallback);
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: asset.focus }}
        />
      </picture>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5"
      />
    </div>
  );
}
