"use client";

import { useState } from "react";
import Image from "next/image";

import type {
  ProductDetailViewModel,
} from "@/types/view-models/product-detail";

import { cn } from "@/lib/ui/cn";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductDetailViewModel["gallery"];
  productName: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id ?? "");
  const active = images.find((image) => image.id === activeId) ?? images[0];

  if (!active) {
    return <div className="aspect-[4/3] rounded-[var(--ysim-radius-xl)] border" />;
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] shadow-[var(--ysim-shadow-sm)]">
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          priority
          sizes="(max-width: 1024px) 94vw, 48vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image) => {
            const selected = image.id === active.id;

            return (
              <button
                key={image.id}
                type="button"
                aria-pressed={selected}
                aria-label={`Xem ảnh ${image.alt}`}
                onClick={() => setActiveId(image.id)}
                className={cn(
                  "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--ysim-radius-md)] border-2",
                  selected
                    ? "border-[var(--ysim-color-brand-700)]"
                    : "border-transparent hover:border-[var(--ysim-color-brand-200)]",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
