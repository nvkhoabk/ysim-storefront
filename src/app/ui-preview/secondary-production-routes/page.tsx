import Link from "next/link";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

const routes = [
  [
    "offers",
    "Ưu đãi eSIM",
  ],
  [
    "terms",
    "Điều khoản sử dụng",
  ],
  [
    "privacy-policy",
    "Chính sách quyền riêng tư",
  ],
  [
    "refund-policy",
    "Chính sách hoàn tiền",
  ],
] as const;

export const metadata = {
  title:
    "Secondary Production Routes | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function Page() {
  return (
    <PageShell
      cartCount={0}
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <SectionHeader
            eyebrow="Package 39"
            title="Offers & Policy production candidates"
            description="Review các composition production không có diagnostic overlay và không dùng legal fallback."
          />
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2">
            {
              routes.map(
                (
                  [
                    slug,
                    title,
                  ],
                ) => (
                  <Link
                    key={
                      slug
                    }
                    href={`/ui-preview/secondary-production-routes/${slug}`}
                    className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] transition hover:border-[var(--ysim-color-brand-300)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-brand-700)]">
                      Preview
                    </p>

                    <h2 className="mt-2 text-lg font-bold text-[var(--ysim-color-text)]">
                      {
                        title
                      }
                    </h2>
                  </Link>
                ),
              )
            }
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
