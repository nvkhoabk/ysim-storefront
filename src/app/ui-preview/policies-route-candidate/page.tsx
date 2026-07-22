import Link from "next/link";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

const policies = [
  ["terms", "Điều khoản sử dụng"],
  ["privacy-policy", "Chính sách riêng tư"],
  ["refund-policy", "Chính sách hoàn tiền"],
] as const;

export default function Page() {
  return (
    <PageShell cartCount={0}>
      <Section variant="subtle" spacing="lg">
        <Container>
          <SectionHeader
            eyebrow="Policies"
            title="Policy route candidates"
          />

          <div className="grid gap-5 md:grid-cols-3">
            {policies.map(([slug, title]) => (
              <Link
                key={slug}
                href={`/ui-preview/policies-route-candidate/${slug}`}
                className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 font-bold shadow-[var(--ysim-shadow-sm)]"
              >
                {title}
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
