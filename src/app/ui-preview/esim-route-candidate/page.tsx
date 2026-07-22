import Link from "next/link";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

export const metadata = {
  title:
    "Product Detail Candidate | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function ProductDetailCandidateIndexPage() {
  const slug =
    process.env
      .YSIM_PRODUCT_DETAIL_DEFAULT_SLUG
      ?.trim() ||
    "japan-5gb-day-7-days";

  return (
    <PageShell
      cartCount={0}
    >
      <Section spacing="lg">
        <Container size="content">
          <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-8 text-center shadow-[var(--ysim-shadow-sm)]">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
              Product Detail Candidate
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[var(--ysim-color-text)]">
              Mở sản phẩm mặc định
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
              Slug:{" "}
              <code>
                {slug}
              </code>
            </p>

            <Link
              href={
                `/ui-preview/esim-route-candidate/${slug}`
              }
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-6 text-sm font-bold text-white"
            >
              Mở candidate
            </Link>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
