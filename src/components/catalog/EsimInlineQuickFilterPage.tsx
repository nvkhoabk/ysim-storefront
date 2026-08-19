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
  esimQuickFilterSelectionKey,
} from "@/lib/storefront/catalog/esim-quick-filter";

import {
  EsimInlineQuickCatalogExperience,
} from "./EsimInlineQuickCatalogExperience";

export function EsimInlineQuickFilterPage({
  products,
  initialSelection,
}: {
  products:
    readonly SecondaryProductViewModel[];
  initialSelection:
    EsimQuickFilterSelection;
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
              prefilteredSelectionKey={
                esimQuickFilterSelectionKey(
                  initialSelection,
                )
              }
            />
          </Container>
        </Section>
      </main>
    </PageShell>
  );
}
