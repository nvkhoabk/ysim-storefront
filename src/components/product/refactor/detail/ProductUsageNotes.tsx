import { CheckCircle2 } from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  ProductDetailViewModel,
} from "@/types/view-models/product-detail";

export function ProductUsageNotes({
  notes,
}: {
  notes: ProductDetailViewModel["usageNotes"];
}) {
  return (
    <Section>
      <Container size="content">
        <SectionHeader
          eyebrow="Trước khi mua"
          title="Thông tin cần lưu ý"
        />

        <div className="space-y-4">
          {notes.map((note) => (
            <article
              key={note.title}
              className="flex items-start gap-4 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-5"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold">{note.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                  {note.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
