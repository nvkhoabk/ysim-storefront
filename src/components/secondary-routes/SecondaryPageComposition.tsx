import {
  AlertTriangle,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  PolicyPageViewModel,
  SecondaryDiagnostic,
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

import styles from "./PolicyRichContent.module.css";

import {
  SecondaryProductGrid,
} from "./SecondaryProductGrid";

function Diagnostics({
  diagnostics,
}: {
  diagnostics: readonly SecondaryDiagnostic[];
}) {
  return (
    <aside className="fixed bottom-4 right-4 z-[70] w-[min(26rem,calc(100vw-2rem))] rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-white/95 p-4 shadow-[var(--ysim-shadow-lg)]">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
        Secondary route candidate
      </p>
      <div className="mt-3 space-y-2">
        {diagnostics.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border)] p-3"
          >
            <strong className="text-xs">{item.label}</strong>
            <p className="mt-1 text-[11px] text-[var(--ysim-color-text-muted)]">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function ProductListingComposition({
  title,
  description,
  products,
  diagnostics,
  searchable = true,
}: {
  title: string;
  description: string;
  products: readonly SecondaryProductViewModel[];
  diagnostics: readonly SecondaryDiagnostic[];
  searchable?: boolean;
}) {
  return (
    <PageShell cartCount={0}>
      <Section variant="subtle" spacing="lg">
        <Container>
          <SectionHeader
            eyebrow="YSim"
            title={title}
            description={description}
          />
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <SecondaryProductGrid
            products={products}
            searchable={searchable}
          />
        </Container>
      </Section>

      <Diagnostics diagnostics={diagnostics} />
    </PageShell>
  );
}

export function PolicyComposition({
  page,
  diagnostics,
}: {
  page: PolicyPageViewModel;
  diagnostics: readonly SecondaryDiagnostic[];
}) {
  return (
    <PageShell cartCount={0}>
      <Section variant="subtle" spacing="lg">
        <Container size="content">
          <SectionHeader
            eyebrow="Policy"
            title={page.title}
            description={page.description}
          />
        </Container>
      </Section>

      <Section spacing="lg">
        <Container size="content">
          {page.requiresLegalReview ? (
            <div className="mb-6 rounded-[var(--ysim-radius-lg)] border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-start gap-3 text-sm font-semibold text-amber-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                Nội dung fallback chỉ dùng để review UI, chưa được phê duyệt pháp lý.
              </p>
            </div>
          ) : null}

          {page.html ? (
            <article
              className={`${styles.content} rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] sm:p-8`}
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          ) : (
            <article className="space-y-4 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-7">
              {page.fallbackParagraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-7 text-[var(--ysim-color-text-muted)]"
                >
                  {paragraph}
                </p>
              ))}
            </article>
          )}
        </Container>
      </Section>

      <Diagnostics diagnostics={diagnostics} />
    </PageShell>
  );
}
