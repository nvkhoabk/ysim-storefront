"use client";

import {
  useState,
} from "react";

import Image from "next/image";

import type {
  ProductDetailImageViewModel,
} from "@/types/view-models/product-detail-route-candidate";

import {
  cn,
} from "@/lib/ui/cn";

export function ProductDetailCandidateGallery({
  images,
}: {
  images:
    readonly ProductDetailImageViewModel[];
}) {
  const [
    activeId,
    setActiveId,
  ] =
    useState(
      images[0]?.id,
    );

  const active =
    images.find(
      (image) =>
        image.id ===
        activeId,
    ) ||
    images[0];

  if (!active) {
    return null;
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)]">
        <Image
          src={
            active.src
          }
          alt={
            active.alt
          }
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length >
      1 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map(
            (image) => (
              <button
                key={
                  image.id
                }
                type="button"
                aria-label={
                  `Xem ${image.alt}`
                }
                aria-pressed={
                  image.id ===
                  active.id
                }
                onClick={() =>
                  setActiveId(
                    image.id,
                  )
                }
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--ysim-radius-md)] border-2 bg-white",
                  image.id ===
                  active.id
                    ? "border-[var(--ysim-color-brand-700)]"
                    : "border-[var(--ysim-color-border)]",
                )}
              >
                <Image
                  src={
                    image.src
                  }
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
