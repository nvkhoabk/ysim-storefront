import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { getProducts } from "@/lib/woocommerce/products";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";

export const metadata = {
  title: "Danh sách eSIM",
  description:
    "Khám phá các gói eSIM du lịch quốc tế phù hợp với hành trình của bạn.",
};

export default async function ESimPage() {
  let products: WooCommerceProduct[] = [];
  let hasError = false;

  try {
    products = await getProducts({
      perPage: 24,
    });
  } catch (error) {
    hasError = true;
    console.error("Cannot load WooCommerce products:", error);
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main>
        <section className="bg-gradient-to-r from-green-50 to-sky-50 px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold text-green-700">
              YSim Store
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              eSIM du lịch quốc tế
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Chọn gói data phù hợp với điểm đến và thời gian của
              chuyến đi.
            </p>
          </div>
        </section>

        {hasError ? (
          <section className="px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
              Không thể tải danh sách sản phẩm. Vui lòng thử lại
              sau.
            </div>
          </section>
        ) : (
          <FeaturedProducts products={products} />
        )}
      </main>
    </>
  );
}