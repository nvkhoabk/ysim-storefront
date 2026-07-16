import Image from "next/image";

import type { WooCommerceImage } from "@/lib/woocommerce/types";

interface ProductGalleryProps {
  images: WooCommerceImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const primaryImage = images[0];
  const secondaryImages = images.slice(1, 5);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {primaryImage ? (
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Sản phẩm chưa có ảnh
          </div>
        )}
      </div>

      {secondaryImages.length > 0 ? (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {secondaryImages.map((image) => (
            <div
              key={image.id || image.src}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <Image
                src={image.src}
                alt={image.alt || productName}
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
