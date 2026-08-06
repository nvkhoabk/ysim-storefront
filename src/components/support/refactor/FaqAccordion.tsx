"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { Container, Section, SectionHeader } from "@/components/layout";

import type { SupportFaqViewModel } from "@/types/view-models/support";

import { cn } from "@/lib/ui/cn";
import { useStorefrontLocale } from "@/i18n/runtime";
import { createSupportUiCopy } from "@/i18n/support/support.config";

export interface FaqAccordionProps {
  items: readonly SupportFaqViewModel[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const { locale } = useStorefrontLocale();
  const copy = createSupportUiCopy(locale);

  const [openId, setOpenId] = useState<string | undefined>(items[0]?.id);

  return (
    <Section id="faq">
      <Container size="content">
        <SectionHeader
          eyebrow={copy.sections.faqEyebrow}
          title={copy.sections.faqTitle}
          description={copy.sections.faqDescription}
        />

        <div className="space-y-3">
          {items.map((item) => {
            const open = openId === item.id;

            const panelId = `support-faq-${item.id}`;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? undefined : item.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-[var(--ysim-color-text)]">
                    {item.question}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-[var(--ysim-color-brand-700)] transition-transform",
                      open ? "rotate-180" : "",
                    )}
                  />
                </button>

                {open ? (
                  <div
                    id={panelId}
                    className="border-t border-[var(--ysim-color-border)] px-5 py-4 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]"
                  >
                    {item.answer}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
