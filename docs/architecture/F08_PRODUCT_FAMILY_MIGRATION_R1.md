# F08-02 Product Family migration and rollback

## Runtime contract

- `YSIM_API_BASE_URL/products` is the primary listing read model.
- Every response item must expose `familyId` or `familyCode`; cards are grouped
  only by that explicit identity, never by localized name or slug.
- The resolved product ID and variation IDs remain the authoritative
  WooCommerce IDs used by cart and checkout.
- Name, description, slug and SEO content come from the requested `vi`, `en`
  or `lo` localization. Price, SKU, stock and variation data come from the
  resolved authoritative product record.
- WooCommerce categories remain the canonical destination taxonomy.

## Migration

1. Keep all existing WooCommerce products published; this release does not
   delete or rewrite them.
2. Backfill one Product Family record for each commercial package and link its
   `vi`, `en` and `lo` translations to the same family identity.
3. Verify Cambodia and every variable product: parent product ID, variation
   IDs, SKU, price and stock must match WooCommerce.
4. Run the catalog diagnostic and compare Product Family coverage with the
   public Woo catalog before Sandbox acceptance.
5. Keep `YSIM_PRODUCT_CATALOG_SOURCE=hybrid` (or unset) for activation.

## Rollback

Set `YSIM_PRODUCT_CATALOG_SOURCE=woocommerce`, rebuild/restart the Storefront,
and verify listing, detail, cart and checkout. This restores the legacy Woo
read path without a database rollback. Product Family data and old Woo
translations are retained for diagnosis and a later corrective release.

`YSIM_PRODUCT_CATALOG_SOURCE=localization` is strict mode: it does not fall
back when the Product Family service is unavailable. Use it only after full
coverage and reliability have been accepted.
