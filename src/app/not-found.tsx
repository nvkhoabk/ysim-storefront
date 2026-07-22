/* YSIM_PACKAGE_35_BOUNDARY:not-found */
import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  GlobalNotFoundState,
} from "@/components/global-states/GlobalNotFoundState";

export default function NotFound() {
  return (
    <PageShell
      cartCount={0}
    >
      <Section spacing="lg">
        <Container>
          <GlobalNotFoundState />
        </Container>
      </Section>
    </PageShell>
  );
}
