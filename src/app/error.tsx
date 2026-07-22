"use client";

/* YSIM_PACKAGE_35_BOUNDARY:route-error */

import {
  useEffect,
} from "react";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  GlobalErrorState,
} from "@/components/global-states/GlobalErrorState";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error:
    Error & {
      digest?: string;
    };
  reset:
    () => void;
}) {
  useEffect(
    () => {
      console.error(
        "YSim route error boundary:",
        error,
      );
    },
    [
      error,
    ],
  );

  return (
    <PageShell
      cartCount={0}
    >
      <Section spacing="lg">
        <Container>
          <GlobalErrorState
            onRetry={
              reset
            }
            detail={
              error.digest
                ? `Mã tham chiếu: ${error.digest}`
                : undefined
            }
          />
        </Container>
      </Section>
    </PageShell>
  );
}
