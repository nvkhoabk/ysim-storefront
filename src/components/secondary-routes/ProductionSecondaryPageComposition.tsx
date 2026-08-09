import {
  Clock3,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  GlobalErrorState,
} from "@/components/global-states/GlobalErrorState";

import type {
  PolicyPageViewModel,
} from "@/types/view-models/secondary-routes";

import styles from "./PolicyRichContent.module.css";

import {
  OffersPartnerLanding,
} from "./OffersPartnerLanding";

function formattedDate(
  value:
    string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      dateStyle:
        "long",
    },
  )
    .format(
      date,
    );
}

export function ProductionOffersComposition() {
  return (
    <PageShell
      cartCount={0}
    >
      <main
        data-ysim-route="offers-partner-program-v2"
      >
        <Section
          variant="subtle"
          spacing="lg"
        >
          <Container>
            <OffersPartnerLanding />
          </Container>
        </Section>
      </main>
    </PageShell>
  );
}

export function ProductionPolicyComposition({
  page,
}: {
  page:
    PolicyPageViewModel;
}) {
  const live =
    page.source ===
      "wordpress" &&
    !page.requiresLegalReview &&
    Boolean(
      page.html
        ?.trim(),
    );

  const updatedAt =
    formattedDate(
      page.updatedAt,
    );

  return (
    <PageShell
      cartCount={0}
    >
      <main
        data-ysim-route="policy-production-v1"
        data-ysim-policy={
          page.key
        }
        data-ysim-policy-source={
          live
            ? "wordpress"
            : "unavailable"
        }
      >
        <Section
          variant="subtle"
          spacing="lg"
        >
          <Container size="content">
            <SectionHeader
              eyebrow="Thông tin pháp lý"
              title={
                page.title
              }
              description={
                page.description
              }
            />

            {
              updatedAt
                ? (
                    <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                      <Clock3
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                      Cập nhật {
                        updatedAt
                      }
                    </p>
                  )
                : null
            }
          </Container>
        </Section>

        <Section spacing="lg">
          <Container size="content">
            {
              live
                ? (
                    <article
                      className={`${styles.content} rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] sm:p-8`}
                      dangerouslySetInnerHTML={{
                        __html:
                          page.html ||
                          "",
                      }}
                    />
                  )
                : (
                    <GlobalErrorState
                      title="Nội dung đang được cập nhật"
                      description="YSim chưa thể tải bản Policy đã được xuất bản từ WordPress. Nội dung dự phòng không được sử dụng trên route production."
                      detail="Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ."
                    />
                  )
            }
          </Container>
        </Section>
      </main>
    </PageShell>
  );
}
