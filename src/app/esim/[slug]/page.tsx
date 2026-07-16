import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { ProductAttributes } from "@/components/product/ProductAttributes";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSummary } from "@/components/product/ProductSummary";
import { stripHtml } from "@/lib/html";
import { getProductBySlug } from "@/lib/woocommerce/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    stripHtml(product.short_description || product.description || "").slice(
      0,
      160,
    ) || `Thông tin và giá gói ${product.name} tại YSim.`;

  const primaryImage = product.images?.[0]?.src;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/esim/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="bg-white">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-4 text-sm text-slate-500 lg:px-8">
            <Link href="/" className="transition hover:text-green-700">
              Trang chủ
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link href="/esim" className="transition hover:text-green-700">
              eSIM
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="max-w-[280px] truncate font-medium text-slate-700 sm:max-w-none">
              {product.name}
            </span>
          </div>
        </div>

        <section className="px-6 py-10 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <ProductGallery
              images={product.images ?? []}
              productName={product.name}
            />

            <ProductSummary product={product} />
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 px-6 py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              <article>
                <p className="text-sm font-semibold text-green-700">
                  Thông tin sản phẩm
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Mô tả chi tiết
                </h2>

                {product.description ? (
                  <div
                    className="product-description mt-6 text-base leading-7 text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: product.description,
                    }}
                  />
                ) : (
                  <p className="mt-6 text-slate-500">
                    Sản phẩm chưa có mô tả chi tiết.
                  </p>
                )}
              </article>

              <aside>
                <p className="text-sm font-semibold text-green-700">
                  Thông số gói
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Thuộc tính eSIM
                </h2>

                <div className="mt-6">
                  <ProductAttributes attributes={product.attributes ?? []} />
                </div>

                {product.categories && product.categories.length > 0 ? (
                  <div className="mt-7">
                    <p className="text-sm font-semibold text-slate-800">
                      Danh mục
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {product.tags && product.tags.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-800">
                      Thẻ sản phẩm
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
