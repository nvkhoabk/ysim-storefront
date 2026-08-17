# F08-02 SKU-derived Product Family migration and rollback

## Runtime contract

- WooCommerce Store API is the primary listing read model while Product Family
  API coverage is incomplete.
- A terminal `-VI`, `-EN`, `-LO` or `-LA` SKU suffix is removed to obtain the
  explicit family code. An unsuffixed SKU is Vietnamese by default.
- `vi` selects unsuffixed then `-VI`; `en` selects `-EN`; `lo` selects `-LO`
  then legacy `-LA`. Missing requested locales fall back to Vietnamese.
- Empty-SKU products remain independent by product ID; names and slugs are
  never used to fabricate family identity.
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
   public Woo catalog before enabling strict localization mode.
5. Keep `YSIM_PRODUCT_CATALOG_SOURCE=hybrid`, `woocommerce`, or unset for
   activation. Hybrid reads the complete Woo SKU-family catalog first.

## Rollback

Set `YSIM_PRODUCT_CATALOG_SOURCE=woocommerce`, rebuild/restart the Storefront,
and verify listing, detail, cart and checkout. This pins the complete
WooCommerce SKU-family read path without a database rollback. Product Family
API data and old Woo translations remain unchanged.

`YSIM_PRODUCT_CATALOG_SOURCE=localization` is strict mode: it does not fall
back when the Product Family service is unavailable. Use it only after full
coverage and reliability have been accepted.
