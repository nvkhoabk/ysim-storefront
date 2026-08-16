import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  DestinationCard,
  DestinationCardSkeleton,
  DestinationRail,
} from "@/components/destination";

import {
  destinationPresentation,
  popularDestinationSlugs,
} from "@/config/storefront-destinations";

import {
  createDestinationCardViewModel,
} from "@/features/destination/destination-presenter";

import type {
  DestinationCategorySource,
  DestinationCommerceSummary,
} from "@/types/view-models/destination";

export const metadata = {
  title:
    "Destination Cards Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

const categoryFixtures:
  readonly DestinationCategorySource[] = [
    {
      id:
        101,
      slug:
        "japan",
      name:
        "Nhật Bản",
      description:
        "Kết nối ổn định tại Tokyo, Osaka, Kyoto và nhiều thành phố khác.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        12,
    },
    {
      id:
        102,
      slug:
        "korea",
      name:
        "Hàn Quốc",
      description:
        "Data tốc độ cao cho Seoul, Busan và toàn Hàn Quốc.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        9,
    },
    {
      id:
        103,
      slug:
        "thailand",
      name:
        "Thái Lan",
      description:
        "Online thuận tiện tại Bangkok, Phuket và Chiang Mai.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        8,
    },
    {
      id:
        104,
      slug:
        "singapore",
      name:
        "Singapore",
      description:
        "Kết nối nhanh ngay khi hạ cánh tại Singapore.",
      parentSlug:
        "asia",
      parentName:
        "Châu Á",
      productCount:
        6,
    },
    {
      id:
        105,
      slug:
        "usa",
      name:
        "Hoa Kỳ",
      description:
        "Phủ sóng cho các hành trình công tác và du lịch tại Hoa Kỳ.",
      parentSlug:
        "north-america",
      parentName:
        "Bắc Mỹ",
      productCount:
        10,
    },
    {
      id:
        106,
      slug:
        "europe",
      name:
        "Châu Âu",
      description:
        "Một eSIM cho nhiều quốc gia trong hành trình Châu Âu.",
      parentSlug:
        "coverage",
      parentName:
        "Đa quốc gia",
      productCount:
        15,
    },
  ];

const commerceFixtures:
  readonly DestinationCommerceSummary[] = [
    {
      destinationSlug:
        "japan",
      minPurchasablePrice:
        169000,
      minDurationDays:
        3,
      maxDurationDays:
        30,
      purchasableProductCount:
        12,
    },
    {
      destinationSlug:
        "korea",
      minPurchasablePrice:
        149000,
      minDurationDays:
        3,
      maxDurationDays:
        30,
      purchasableProductCount:
        9,
    },
    {
      destinationSlug:
        "thailand",
      minPurchasablePrice:
        99000,
      minDurationDays:
        3,
      maxDurationDays:
        15,
      purchasableProductCount:
        8,
    },
    {
      destinationSlug:
        "singapore",
      minPurchasablePrice:
        109000,
      minDurationDays:
        3,
      maxDurationDays:
        15,
      purchasableProductCount:
        6,
    },
    {
      destinationSlug:
        "usa",
      minPurchasablePrice:
        199000,
      minDurationDays:
        5,
      maxDurationDays:
        30,
      purchasableProductCount:
        10,
    },
    {
      destinationSlug:
        "europe",
      minPurchasablePrice:
        249000,
      minDurationDays:
        7,
      maxDurationDays:
        30,
      purchasableProductCount:
        15,
    },
  ];

const destinations =
  categoryFixtures.map(
    (category) => {
      const commerce =
        commerceFixtures.find(
          (item) =>
            item.destinationSlug ===
            category.slug,
        );

      const presentation =
        destinationPresentation[
          category.slug
        ];

      if (
        !commerce ||
        !presentation
      ) {
        throw new Error(
          `Missing destination preview data for ${category.slug}`,
        );
      }

      return createDestinationCardViewModel(
        category,
        commerce,
        presentation,
      );
    },
  );

const popularDestinations =
  popularDestinationSlugs
    .map(
      (slug) =>
        destinations.find(
          (destination) =>
            destination.slug ===
            slug,
        ),
    )
    .filter(
      (
        destination,
      ): destination is
        (typeof destinations)[number] =>
        Boolean(destination),
    );

export default function DestinationCardsPreviewPage() {
  return (
    <PageShell cartCount={2}>
      <DestinationRail
        eyebrow="Điểm đến nổi bật"
        title="Chọn nơi bạn sắp đến"
        description="Giá được tổng hợp từ gói còn purchasable; hình ảnh và flag đến từ Next.js Presentation Config."
        destinations={
          popularDestinations
        }
      />

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="Grid preview"
            title="Tất cả destination cards"
            description="Kiểm tra card border, country image, flag SVG, green badge, giá “Từ…”, duration và CTA."
          />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {destinations.map(
              (
                destination,
                index,
              ) => (
                <DestinationCard
                  key={
                    destination.slug
                  }
                  destination={
                    destination
                  }
                  priority={
                    index < 3
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
            title="Destination card skeleton"
            description="Skeleton giữ nguyên tỷ lệ visual và cấu trúc card trong lúc adapter tải dữ liệu."
          />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <DestinationCardSkeleton />
            <DestinationCardSkeleton />
            <DestinationCardSkeleton />
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
