import {
  ArrowRight,
  CheckCircle2,
  LayoutTemplate,
  ShieldCheck,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  Badge,
  Button,
} from "@/components/ui";

export const metadata = {
  title:
    "Page Shell Preview | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

const shellBenefits = [
  {
    icon:
      LayoutTemplate,
    title:
      "Global Shell nhất quán",
    description:
      "Announcement, Header, Main và Footer được ghép bằng một PageShell dùng chung.",
  },
  {
    icon:
      ShieldCheck,
    title:
      "Không chạm Payment",
    description:
      "Package không sửa Cart, Checkout, GPay hoặc bất kỳ API route nào.",
  },
  {
    icon:
      CheckCircle2,
    title:
      "Sẵn sàng composition",
    description:
      "Các landing page sau chỉ cần cung cấp nội dung bên trong Main.",
  },
];

export default function PageShellPreviewPage() {
  return (
    <PageShell cartCount={2}>
      <Section
        variant="highlighted"
        spacing="lg"
      >
        <Container>
          <Badge>
            Package 03
          </Badge>

          <h1 className="mt-5 max-w-4xl text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.045em]">
            Footer & Page Shell
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ysim-color-text-muted)]">
            Hoàn thiện cấu trúc
            toàn trang trước khi
            triển khai Hero và các
            landing page mới.
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
            eyebrow="Global shell"
            title="Header và Footer dùng chung"
            description="Cuộn xuống cuối trang để review Trust Feature Row, các cột Footer, App Links, Payment Marks và Legal Links."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {shellBenefits.map(
              (benefit) => {
                const Icon =
                  benefit.icon;

                return (
                  <article
                    key={
                      benefit.title
                    }
                    className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] transition-[transform,box-shadow] duration-[var(--ysim-duration-normal)] hover:-translate-y-1 hover:shadow-[var(--ysim-shadow-card-hover)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-700)]">
                      <Icon className="h-5 w-5" />
                    </span>

                    <h2 className="mt-5 text-lg font-bold">
                      {
                        benefit.title
                      }
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                      {
                        benefit.description
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
            eyebrow="Accessibility"
            title="Kiểm tra Skip Link"
            description="Nhấn Tab ngay sau khi tải lại trang để thấy nút “Bỏ qua điều hướng”, sau đó Enter để chuyển focus tới nội dung chính."
          />

          <div className="min-h-48 rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] bg-white p-8 text-center text-[var(--ysim-color-text-muted)]">
            Khu vực nội dung mẫu
            để kiểm tra khoảng
            cách giữa Header,
            Main và Footer.
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
