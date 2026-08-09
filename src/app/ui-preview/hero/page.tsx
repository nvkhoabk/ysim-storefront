import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  HeroContent,
  HeroMedia,
  HeroSearch,
  HeroShell,
} from "@/components/hero";

import {
  homeHero,
  heroSearchPreviewItems,
} from "@/config/storefront-heroes";

export const metadata = {
  title:
    "Hero System Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

export default function HeroPreviewPage() {
  return (
    <PageShell cartCount={2}>
      <HeroShell
        variant={
          homeHero.variant
        }
        alignment={
          homeHero.alignment
        }
        media={
          <HeroMedia
            media={
              homeHero.media
            }
            priority
          />
        }
      >
        <HeroContent
          hero={
            homeHero
          }
          search={
            <HeroSearch
              items={
                heroSearchPreviewItems
              }
            />
          }
        />
      </HeroShell>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Package 04"
            title="Hero System có thể tái sử dụng"
            description="Cùng một bộ component có thể dùng cho Home, Destination, Guide, Promotion và Support bằng cách thay ViewModel và media."
          />

          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6">
              <h2 className="font-bold">
                Config-driven
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                Hero copy, CTA, benefits và visual được khai báo qua ViewModel/config.
              </p>
            </article>

            <article className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6">
              <h2 className="font-bold">
                Search realtime
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                Tìm thử “Nhật”, “5GB”, “thiết bị” hoặc “toàn cầu”.
              </p>
            </article>

            <article className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6">
              <h2 className="font-bold">
                Adapter-ready
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                HeroSearch chỉ nhận item ViewModel và không gọi trực tiếp WooCommerce hoặc WordPress.
              </p>
            </article>
          </div>
        </Container>
      </Section>

      <Section variant="subtle">
        <Container size="content">
          <SectionHeader
            eyebrow="Responsive audit"
            title="Kiểm tra desktop, tablet và mobile"
            description="Trên mobile, Hero chuyển về một cột, Search full-width và visual nằm phía dưới nội dung."
          />
        </Container>
      </Section>
    </PageShell>
  );
}
