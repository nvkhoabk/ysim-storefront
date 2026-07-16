"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Wifi } from "lucide-react";
import { useRef } from "react";

import { formatWooCommercePrice } from "@/lib/currency";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";

interface FeaturedProductsProps {
  products: WooCommerceProduct[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: "left" | "right") {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector<HTMLElement>(
      "[data-product-card]",
    );

    const cardWidth = firstCard?.offsetWidth ?? 280;

    carousel.scrollBy({
      left: direction === "right" ? cardWidth + 12 : -(cardWidth + 12),
      behavior: "smooth",
    });
  }

  return (
    <section className="bg-white px-5 pt-0 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-[17px] leading-6 font-bold text-slate-950">
            Gói eSIM nổi bật
          </h2>

          <div className="flex items-center gap-2">
            <Link
              href="/esim"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 transition hover:text-green-700"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {products.length > 1 ? (
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  aria-label="Xem sản phẩm trước"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-700 hover:bg-green-700 hover:text-white focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  aria-label="Xem sản phẩm tiếp theo"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-700 hover:bg-green-700 hover:text-white focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Chưa có sản phẩm WooCommerce được xuất bản.
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="-mx-5 grid snap-x snap-mandatory [scrollbar-width:none] auto-cols-[84%] grid-flow-col gap-3 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:auto-cols-[48%] sm:px-6 lg:mx-0 lg:auto-cols-[calc((100%-36px)/4)] lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => {
              const image = product.images?.[0];

              return (
                <Link
                  key={product.id}
                  data-product-card
                  href={`/esim/${product.slug}`}
                  className="group flex h-[132px] min-w-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <div className="relative h-full w-[98px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {image ? (
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        fill
                        sizes="98px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-slate-500">
                        Chưa có ảnh
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

                    <span className="absolute top-2 left-2 rounded bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-green-700 shadow-sm">
                      eSIM
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col pl-3">
                    <h3 className="line-clamp-2 text-[12px] leading-4 font-bold text-slate-950">
                      {product.name}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] leading-4 text-slate-500">
                      <Wifi className="h-3.5 w-3.5 shrink-0 text-green-700" />
                      <span className="truncate">Kích hoạt nhanh</span>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] leading-3 text-slate-500">
                          Giá từ
                        </p>

                        <p className="truncate text-[14px] leading-5 font-bold text-green-700">
                          {formatWooCommercePrice(product.prices)}
                        </p>
                      </div>

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition group-hover:border-green-700 group-hover:bg-green-700 group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
