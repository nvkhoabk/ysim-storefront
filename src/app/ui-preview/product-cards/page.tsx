import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  ProductCard,
  ProductCardSkeleton,
  ProductRail,
} from "@/components/product/refactor";

import {
  featuredProductFamilyCodes,
  productCardPresentation,
} from "@/config/storefront-product-cards";

import {
  createProductCardViewModel,
} from "@/features/catalog/product-card-presenter";

import type {
  ProductSource,
} from "@/types/view-models/product-card";

export const metadata = {
  title:
    "Product Cards Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

const productFixtures:
  readonly ProductSource[] = [
    {
      id:
        201,
      familyCode:
        "GIGA-JP",
      slug:
        "esim-nhat-ban",
      name:
        "eSIM Nhật Bản",
      imageUrl:
        "/ui-preview/products/japan-esim.svg",
      imageAlt:
        "eSIM Nhật Bản",
      attributes: {
        "Dung lượng":
          [
            "3GB/ngày",
            "5GB/ngày",
          ],
        "Số ngày":
          [
            "3 ngày",
            "7 ngày",
            "15 ngày",
          ],
      },
      variations: [
        {
          id:
            2001,
          sku:
            "GIGA-JP-D3GB-03",
          price:
            169000,
          regularPrice:
            199000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            "dung-luong":
              "3GB/ngày",
            "so-ngay":
              "3 ngày",
          },
        },
        {
          id:
            2002,
          sku:
            "GIGA-JP-D5GB-07",
          price:
            299000,
          regularPrice:
            329000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            "dung-luong":
              "5GB/ngày",
            "so-ngay":
              "7 ngày",
          },
        },
      ],
    },
    {
      id:
        202,
      familyCode:
        "GIGA-KR",
      slug:
        "esim-han-quoc",
      name:
        "eSIM Hàn Quốc",
      imageUrl:
        "/ui-preview/products/korea-esim.svg",
      imageAlt:
        "eSIM Hàn Quốc",
      variations: [
        {
          id:
            2101,
          sku:
            "GIGA-KR-D3GB-05",
          price:
            149000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            data:
              "3GB/ngày",
            duration:
              "5 ngày",
          },
        },
        {
          id:
            2102,
          sku:
            "GIGA-KR-D5GB-10",
          price:
            289000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            data:
              "5GB/ngày",
            duration:
              "10 ngày",
          },
        },
      ],
    },
    {
      id:
        203,
      familyCode:
        "GIGA-TH",
      slug:
        "esim-thai-lan",
      name:
        "eSIM Thái Lan",
      imageUrl:
        "/ui-preview/products/thailand-esim.svg",
      imageAlt:
        "eSIM Thái Lan",
      variations: [
        {
          id:
            2201,
          sku:
            "GIGA-TH-D2GB-03",
          price:
            99000,
          regularPrice:
            129000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            "data-amount":
              "2GB/ngày",
            "duration-days":
              "3 ngày",
          },
        },
      ],
    },
    {
      id:
        204,
      familyCode:
        "GIGA-GLB",
      slug:
        "esim-toan-cau",
      name:
        "eSIM Toàn cầu",
      imageUrl:
        "/ui-preview/products/global-esim.svg",
      imageAlt:
        "eSIM Toàn cầu",
      variations: [
        {
          id:
            2301,
          sku:
            "GIGA-GLB-D10GB-15",
          price:
            499000,
          purchasable:
            true,
          inStock:
            true,
          attributes: {
            data_amount:
              "10GB",
            duration_days:
              "15 ngày",
          },
        },
      ],
    },
  ];

const products =
  productFixtures.map(
    (product) => {
      const presentation =
        productCardPresentation[
          product.familyCode
        ];

      if (!presentation) {
        throw new Error(
          `Missing product card presentation for ${product.familyCode}`,
        );
      }

      return createProductCardViewModel(
        product,
        presentation,
      );
    },
  );

const featuredProducts =
  featuredProductFamilyCodes
    .map(
      (familyCode) =>
        products.find(
          (product) =>
            product.familyCode ===
            familyCode,
        ),
    )
    .filter(
      (
        product,
      ): product is
        (typeof products)[number] =>
        Boolean(product),
    );

export default function ProductCardsPreviewPage() {
  return (
    <PageShell cartCount={2}>
      <ProductRail
        eyebrow="Gói eSIM nổi bật"
        title="Chọn gói phù hợp với hành trình"
        description="Giá được lấy từ variation purchasable còn hàng có mức giá thấp nhất."
        products={
          featuredProducts
        }
      />

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="Grid preview"
            title="Product Card ViewModel"
            description="Ảnh bên trái trên desktop, tên, giá, dung lượng, duration và CTA Xem chi tiết."
          />

          <div className="grid gap-5 xl:grid-cols-2">
            {products.map(
              (
                product,
                index,
              ) => (
                <ProductCard
                  key={
                    product.familyCode
                  }
                  product={
                    product
                  }
                  priority={
                    index < 2
                  }
                />
              ),
            )}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Loading state"
            title="Product card skeleton"
            description="Skeleton duy trì cấu trúc card trong lúc adapter lấy Product và Variation."
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
