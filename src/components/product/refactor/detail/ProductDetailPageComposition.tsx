import { Badge } from "@/components/ui";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  ProductRail,
} from "@/components/product/refactor";

import type {
  ProductDetailPageViewModel,
} from "@/types/view-models/product-detail";

import { ProductFeatureGrid } from "./ProductFeatureGrid";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchasePanel } from "./ProductPurchasePanel";
import { ProductUsageNotes } from "./ProductUsageNotes";

export function ProductDetailPageComposition({
  page,
  cartCount = 0,
}: {
  page: ProductDetailPageViewModel;
  cartCount?: number;
}) {
  const product = page.product;

  return (
    <PageShell cartCount={cartCount}>
      <Section spacing="lg">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:gap-12">
            <ProductGallery
              images={product.gallery}
              productName={product.name}
            />

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
                {product.destinationName}
              </p>

              <h1 className="mt-3 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em]">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.badges.map((badge) => (
                  <Badge key={`${badge.label}-${badge.icon ?? "none"}`}>
                    {badge.label}
                  </Badge>
                ))}
              </div>

              <p className="mt-5 text-base leading-relaxed text-[var(--ysim-color-text-muted)] sm:text-lg">
                {product.shortDescription}
              </p>

              <ProductPurchasePanel product={product} />
            </div>
          </div>
        </Container>
      </Section>

      <ProductFeatureGrid features={product.features} />
      <ProductUsageNotes notes={product.usageNotes} />

      <ProductRail
        eyebrow="Có thể bạn quan tâm"
        title="Khám phá thêm các gói eSIM"
        description="Các lựa chọn phổ biến cho hành trình tiếp theo."
        actionLabel="Xem tất cả"
        actionHref="/esim"
        products={page.relatedProducts}
        variant="subtle"
      />
    </PageShell>
  );
}
