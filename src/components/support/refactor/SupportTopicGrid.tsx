import Link from "next/link";

import {
  CreditCard,
  PackageSearch,
  QrCode,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  SupportTopicIcon,
  SupportTopicViewModel,
} from "@/types/view-models/support";

const iconMap:
  Record<
    SupportTopicIcon,
    LucideIcon
  > = {
    installation:
      QrCode,

    device:
      Smartphone,

    payment:
      CreditCard,

    order:
      PackageSearch,
  };

export interface SupportTopicGridProps {
  topics:
    readonly SupportTopicViewModel[];
}

export function SupportTopicGrid({
  topics,
}: SupportTopicGridProps) {
  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Tìm câu trả lời"
          title="Bạn cần hỗ trợ về vấn đề gì?"
          description="Chọn nhóm nội dung phù hợp để tìm hướng dẫn nhanh."
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {topics.map(
            (topic) => {
              const Icon =
                iconMap[
                  topic.icon
                ];

              return (
                <Link
                  key={
                    topic.id
                  }
                  href={
                    topic.href
                  }
                  className="group rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-[var(--ysim-color-brand-200)] hover:shadow-[var(--ysim-shadow-card-hover)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                    <Icon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-5 text-lg font-bold text-[var(--ysim-color-text)] group-hover:text-[var(--ysim-color-brand-700)]">
                    {
                      topic.title
                    }
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    {
                      topic.description
                    }
                  </p>
                </Link>
              );
            },
          )}
        </div>
      </Container>
    </Section>
  );
}
