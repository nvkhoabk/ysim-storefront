/* YSIM_PACKAGE_35_BOUNDARY:loading */
import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  GlobalLoadingState,
} from "@/components/global-states/GlobalLoadingState";

export default function Loading() {
  return (
    <PageShell
      cartCount={0}
    >
      <Section spacing="lg">
        <Container>
          <GlobalLoadingState />
        </Container>
      </Section>
    </PageShell>
  );
}
