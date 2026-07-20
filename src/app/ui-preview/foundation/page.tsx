import { ArrowRight, Check, Globe2, Search, Sparkles } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/layout";
import { Badge, Button, Price, Skeleton, TextInput } from "@/components/ui";

export const metadata = {
  title: "UI Foundation Preview | YSim",
  robots: { index: false, follow: false },
};

export default function FoundationPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--ysim-color-background)] text-[var(--ysim-color-text)]">
      <Section variant="highlighted" spacing="lg">
        <Container>
          <Badge icon={<Sparkles />}>Package 01</Badge>
          <h1 className="mt-5 max-w-4xl text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.045em]">
            YSim Foundation Design System
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ysim-color-text-muted)]">
            Primitive UI và layout foundation cho quá trình refactor storefront.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              Chọn gói
            </Button>
            <Button variant="outline" size="lg">
              Xem tài liệu
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="CMP-001"
            title="Button"
            description="Primary, secondary, outline, ghost, link, icon và loading."
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="icon" aria-label="Tìm kiếm">
              <Search className="h-5 w-5" />
            </Button>
            <Button loading>Đang xử lý</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Container>
      </Section>

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="CMP-006 / CMP-007"
            title="Badge & Price"
            description="Green badge system và định dạng giá Việt Nam."
            action={
              <Button variant="link" trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Xem tất cả
              </Button>
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6 shadow-[var(--ysim-shadow-sm)] transition-[transform,box-shadow] duration-[var(--ysim-duration-normal)] hover:-translate-y-1 hover:shadow-[var(--ysim-shadow-card-hover)]">
              <div className="flex flex-wrap gap-2">
                <Badge icon={<Check />}>Phổ biến</Badge>
                <Badge variant="solid">Ưu đãi</Badge>
                <Badge variant="outline" icon={<Globe2 />}>Toàn cầu</Badge>
              </div>
              <div className="mt-8">
                <Price
                  prefix="Từ"
                  amount={169000}
                  originalAmount={199000}
                  discountLabel="-15%"
                  size="large"
                />
              </div>
            </div>

            <div className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-6">
              <Price amount={169000} size="compact" />
              <div className="mt-5">
                <Price prefix="Từ" amount={2199000} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="content">
          <SectionHeader
            eyebrow="CMP-003"
            title="TextInput"
            description="Border input, validation dưới trường và hỗ trợ adornment."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <TextInput
              label="Điểm đến"
              placeholder="Bạn sẽ đi đâu?"
              helperText="Tìm Destination, Product hoặc Guide."
              startAdornment={<Search />}
            />
            <TextInput
              label="Email"
              placeholder="name@example.com"
              defaultValue="email-khong-hop-le"
              error="Vui lòng nhập địa chỉ email hợp lệ."
              required
            />
          </div>
        </Container>
      </Section>

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="CMP-010"
            title="Skeleton"
            description="Loading placeholder cho card, line và avatar."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-5"
              >
                <Skeleton shape="card" className="min-h-36" />
                <Skeleton className="mt-5 w-3/4" />
                <Skeleton className="mt-3 w-1/2" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
