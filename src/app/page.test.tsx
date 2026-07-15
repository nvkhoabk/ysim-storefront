import Image from "next/image";

import { getProducts } from "@/lib/woocommerce/products";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";

function formatProductPrice(product: WooCommerceProduct): string {
  const {
    price,
    currency_code,
    currency_minor_unit,
  } = product.prices;

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Liên hệ";
  }

  const actualPrice =
    numericPrice / Math.pow(10, currency_minor_unit);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency_code || "VND",
    maximumFractionDigits: currency_minor_unit,
  }).format(actualPrice);
}

export default async function HomePage() {
  let products: WooCommerceProduct[] = [];
  let errorMessage: string | null = null;

  try {
    products = await getProducts({
      perPage: 8,
    });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể kết nối với WooCommerce.";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">
          YSim Storefront
        </h1>

        <p className="mt-2 text-slate-600">
          Kiểm tra kết nối với WooCommerce Store API.
        </p>

        {errorMessage ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Không thể tải sản phẩm
            </p>

            <p className="mt-2 break-words text-sm">
              {errorMessage}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            WooCommerce chưa trả về sản phẩm đã xuất bản.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const primaryImage = product.images?.[0];

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {primaryImage ? (
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      <Image
                        src={primaryImage.src}
                        alt={primaryImage.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw,
                               (max-width: 1024px) 50vw,
                               25vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm text-slate-500">
                      Chưa có ảnh sản phẩm
                    </div>
                  )}

                  <div className="p-5">
                    <h2 className="font-semibold text-slate-900">
                      {product.name}
                    </h2>

                    {product.sku ? (
                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {product.sku}
                      </p>
                    ) : null}

                    <p className="mt-3 text-lg font-bold text-green-700">
                      {formatProductPrice(product)}
                    </p>

                    <p className="mt-2 text-sm">
                      {product.is_in_stock ? (
                        <span className="text-green-700">
                          Còn hàng
                        </span>
                      ) : (
                        <span className="text-red-600">
                          Tạm hết hàng
                        </span>
                      )}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}