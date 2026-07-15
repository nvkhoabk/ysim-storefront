import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroSection } from "@/components/home/HeroSection";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { getProducts } from "@/lib/woocommerce/products";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";

export default async function HomePage() {
  let products: WooCommerceProduct[] = [];
  let catalogError = false;

  try {
    products = await getProducts({
      perPage: 8,
    });
  } catch (error) {
    catalogError = true;
    console.error("Cannot load WooCommerce products:", error);
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main>
        <HeroSection />

        {catalogError ? (
          <section className="bg-white px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
              Danh sách sản phẩm đang tạm thời không khả dụng.
              Vui lòng thử lại sau.
            </div>
          </section>
        ) : (
          <FeaturedProducts products={products} />
        )}
      </main>
    </>
  );
}