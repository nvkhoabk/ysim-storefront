import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShoppingCart,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  Header,
} from "@/components/navigation";

import {
  Badge,
  Button,
} from "@/components/ui";

export const metadata = {
  title:
    "Navigation Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

const principles = [
  {
    icon:
      Globe2,
    title:
      "Header phục vụ bán hàng",
    description:
      "Điều hướng tập trung vào Mua eSIM, Điểm đến, Ưu đãi, Cẩm nang và Hỗ trợ.",
  },
  {
    icon:
      ShoppingCart,
    title:
      "Guest Checkout First",
    description:
      "Không có Login trên Header. Cart luôn hiện và có badge.",
  },
  {
    icon:
      CheckCircle2,
    title:
      "Config-driven",
    description:
      "Announcement và Quick Access có thể bật hoặc tắt bằng Next.js Config.",
  },
];

export default function NavigationPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--ysim-color-background)] text-[var(--ysim-color-text)]">
      <Header cartCount={2} />

      <Section
        variant="highlighted"
        spacing="lg"
      >
        <Container>
          <Badge>
            Package 02
          </Badge>

          <h1 className="mt-5 max-w-4xl text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.045em]">
            Global Navigation
            Shell
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ysim-color-text-muted)]">
            Kiểm tra Announcement
            Bar, sticky Header,
            Mega Menu, Language
            Switcher, Cart Badge và
            Mobile Menu Drawer.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              trailingIcon={
                <ArrowRight className="h-4 w-4" />
              }
            >
              Chọn gói
            </Button>

            <Button
              variant="outline"
              size="lg"
            >
              Xem điểm đến
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Navigation principles"
            title="Đúng các quyết định đã thống nhất"
            description="Package này chưa thay thế Header production. Nó tạo shell song song để review trước khi tích hợp."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {principles.map(
              (principle) => {
                const Icon =
                  principle.icon;

                return (
                  <article
                    key={
                      principle.title
                    }
                    className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] transition-[transform,box-shadow] duration-[var(--ysim-duration-normal)] hover:-translate-y-1 hover:shadow-[var(--ysim-shadow-card-hover)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                      <Icon className="h-5 w-5" />
                    </span>

                    <h2 className="mt-5 text-lg font-bold">
                      {
                        principle.title
                      }
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                      {
                        principle.description
                      }
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </Container>
      </Section>

      <Section variant="subtle">
        <Container size="content">
          <SectionHeader
            eyebrow="Responsive audit"
            title="Kiểm tra Desktop và Mobile"
            description="Thu nhỏ trình duyệt để kiểm tra Mobile Header, Drawer và việc Quick Access cuộn ngang."
          />

          <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-brand-200)] bg-[var(--ysim-color-brand-50)] p-6 leading-relaxed text-[var(--ysim-color-brand-900)]">
            Search không xuất hiện
            trong Header. Search sẽ là
            CTA chính trong Hero ở
            package tiếp theo.
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="h-[35vh] rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] bg-white" />
        </Container>
      </Section>
    </main>
  );
}
