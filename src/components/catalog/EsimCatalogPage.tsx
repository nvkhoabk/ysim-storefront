import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  EsimChoiceGuide,
} from "./EsimChoiceGuide";

import {
  EsimTypeExplorer,
} from "./EsimTypeExplorer";

export function EsimCatalogPage({
  products = [],
}: {
  products?:
    readonly unknown[];
}) {
  return (
    <PageShell
      cartCount={0}
    >
      <main
        data-ysim-route="esim-destination-explorer-v2"
        data-catalog-product-count={
          products.length
        }
      >
        <Section
          variant="subtle"
          spacing="lg"
        >
          <Container>
            <EsimTypeExplorer />

            <EsimChoiceGuide />
          </Container>
        </Section>
      </main>
    </PageShell>
  );
}
