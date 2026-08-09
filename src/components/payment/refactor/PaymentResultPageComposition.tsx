import type {
  ReactNode,
} from "react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  PaymentResultPageViewModel,
} from "@/types/view-models/payment-result";

import {
  PaymentResultCard,
} from "./PaymentResultCard";

import {
  PaymentTimeline,
} from "./PaymentTimeline";

export interface PaymentResultPageCompositionProps {
  page:
    PaymentResultPageViewModel;
  previewControls?:
    ReactNode;
}

export function PaymentResultPageComposition({
  page,
  previewControls,
}: PaymentResultPageCompositionProps) {
  return (
    <PageShell
      cartCount={0}
    >
      {previewControls ? (
        <Section
          variant="subtle"
          spacing="sm"
        >
          <Container>
            {
              previewControls
            }
          </Container>
        </Section>
      ) : null}

      <Section spacing="lg">
        <Container size="content">
          <PaymentResultCard
            result={
              page.result
            }
          />
        </Container>
      </Section>

      <Section variant="subtle">
        <Container size="content">
          <SectionHeader
            eyebrow="Trạng thái đơn hàng"
            title="Tiến trình xử lý"
            description="Timeline preview cho trạng thái thanh toán và chuẩn bị eSIM."
          />

          <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)]">
            <PaymentTimeline
              items={
                page.result
                  .timeline
              }
            />
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
