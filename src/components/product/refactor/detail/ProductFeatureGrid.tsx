import {
  Clock3,
  Headphones,
  RadioTower,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  ProductDetailViewModel,
  ProductFeatureIcon,
} from "@/types/view-models/product-detail";

const iconMap: Record<ProductFeatureIcon, LucideIcon> = {
  network: RadioTower,
  hotspot: Wifi,
  activation: Clock3,
  support: Headphones,
};

export function ProductFeatureGrid({
  features,
}: {
  features: ProductDetailViewModel["features"];
}) {
  return (
    <Section variant="subtle">
      <Container>
        <SectionHeader
          eyebrow="Điểm nổi bật"
          title="Kết nối đơn giản và linh hoạt"
          align="center"
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];

            return (
              <article
                key={feature.title}
                className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6 text-center"
              >
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-lg font-bold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
