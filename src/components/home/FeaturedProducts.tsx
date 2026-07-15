import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Wifi } from "lucide-react";

import { formatWooCommercePrice } from "@/lib/currency";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";

interface FeaturedProductsProps {
  products: WooCommerceProduct[];
}

export function FeaturedProducts({
  products,
}: FeaturedProductsProps) {
  return (
    <section className="bg-white px-6 pb-16 pt-14 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Gói eSIM nổi bật
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Chọn kết nối cho hành trình của bạn
            </h2>
          </div>

          <Link
            href="/esim"
            className="hidden items-center gap-2 text-sm font-semibold text-slate-700 hover:text-green-700 sm:flex"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Chưa có sản phẩm WooCommerce được xuất bản.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const image = product.images?.[0];

              return (
                <Link
                  key={product.id}
                  href={`/esim/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {image ? (
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw,
                               (max-width: 1024px) 50vw,
                               25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Chưa có ảnh
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                      eSIM data
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 min-h-12 font-semibold leading-6 text-slate-900">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <Wifi className="h-4 w-4 text-green-700" />
                      Kích hoạt nhanh
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Giá từ
                        </p>

                        <p className="mt-1 text-xl font-bold text-green-700">
                          {formatWooCommercePrice(
                            product.prices,
                          )}
                        </p>
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition group-hover:border-green-700 group-hover:bg-green-700 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
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