import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeGuideSection } from "@/components/home/HomeGuideSection";
import { HomeValueRow } from "@/components/home/HomeValueRow";
import { PopularDestinations } from "@/components/home/PopularDestinations";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TravelGuidesSection } from "@/components/home/TravelGuidesSection";
import { FooterBenefits } from "@/components/layout/FooterBenefits";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/footer/Footer";
import { getProducts } from "@/lib/woocommerce/products";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";

export default async function HomePage() {
  let products: WooCommerceProduct[] = [];
  let catalogError = false;

  try {
    products = await getProducts({
      perPage: 8,
      locale: "vi",
    });
  } catch (error) {
    catalogError = true;
    console.error("Cannot load localized products:", error);
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main>
        <HeroSection />
        <PopularDestinations />
        <HomeValueRow />
        <HomeGuideSection />

        {catalogError ? (
          <section className="bg-white px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
              Danh sách sản phẩm đang tạm thời không khả dụng. Vui lòng thử lại
              sau.
            </div>
          </section>
        ) : (
          <FeaturedProducts products={products} />
        )}

        <TestimonialsSection />
        <TravelGuidesSection />
        <FooterBenefits />
      </main>

      <Footer />
    </>
  );
}
