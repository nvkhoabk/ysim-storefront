import Link from "next/link";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

export const dynamic =
  "force-dynamic";

function delay(
  milliseconds: number,
): Promise<void> {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

export default async function SlowBoundaryTestPage() {
  await delay(
    2500,
  );

  return (
    <PageShell
      cartCount={0}
    >
      <Section spacing="lg">
        <Container size="content">
          <div className="rounded-[var(--ysim-radius-xl)] border border-emerald-200 bg-emerald-50 p-8 text-center">
            <h1 className="text-3xl font-bold text-emerald-950">
              Slow route đã tải xong
            </h1>

            <p className="mt-3 text-sm font-semibold text-emerald-900">
              Loading boundary nên xuất hiện khi điều hướng từ dashboard tới route này.
            </p>

            <Link
              href="/ui-preview/global-boundary-activation"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--ysim-radius-md)] bg-emerald-800 px-5 text-sm font-bold text-white"
            >
              Quay lại dashboard
            </Link>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
