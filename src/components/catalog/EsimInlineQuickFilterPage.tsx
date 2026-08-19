import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import type {
  EsimQuickFilterSelection,
} from "@/types/view-models/esim-quick-filter";

import type {
  SecondaryProductViewModel,
} from "@/types/view-models/secondary-routes";

import {
  EsimInlineQuickCatalogExperience,
} from "./EsimInlineQuickCatalogExperience";

export function EsimInlineQuickFilterPage({
  products,
  initialSelection,
  selectionApplied = false,
}: {
  products:
    readonly SecondaryProductViewModel[];
  initialSelection:
    EsimQuickFilterSelection;
  selectionApplied?: boolean;
}) {
  return (
    <PageShell
      cartCount={0}
    >
      <main
        data-ysim-route="esim-inline-quick-filter-v1"
        data-catalog-product-count={
          products.length
        }
      >
        <Section
          variant="subtle"
          spacing="lg"
        >
          <Container>
            <EsimInlineQuickCatalogExperience
              key={`${initialSelection.kind}:${initialSelection.id}`}
              products={
                products
              }
              initialSelection={
                initialSelection
              }
              selectionApplied={selectionApplied}
            />
          </Container>
        </Section>
      </main>
    </PageShell>
  );
}
