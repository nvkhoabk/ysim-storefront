# F08-02 SKU-derived Product Family migration and rollback

## Runtime contract

- WooCommerce Store API is the primary listing read model while Product Family
  API coverage is incomplete.
- A terminal `-VI`, `-EN`, `-LO` or `-LA` SKU suffix is removed to obtain the
  explicit family code. An unsuffixed SKU is Vietnamese by default.
- The live legacy Woo records do not consistently follow that suffix contract:
  translated parent copies use numeric tails such as `-15`, `-31`, `-36`, and
  many parents have an empty SKU while the first variation contains the same
  numeric-copy pattern. For those records, the terminal numeric token is
  removed from the parent SKU or first-variation anchor SKU. The stem is only
  accepted as a family when it occurs in multiple locale cohorts.
- A terminal product slug token (`-vi`, `-en`, `-lo`, `-la`) classifies which
  localized copy won selection for legacy numeric records. Slug and product
  name never contribute bytes to the commercial family code.
- `vi` selects unsuffixed then `-VI`; `en` selects `-EN`; `lo` selects `-LO`
  then legacy `-LA`. Missing requested locales fall back to Vietnamese.
- An empty-SKU variable parent uses its first referenced variation SKU as a
  family anchor. Records with neither a parent nor variation SKU remain
  independent by product ID.
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
5. Keep Woo catalog pagination below Next.js' 2 MB per-cache-item ceiling;
   the current read path uses 25 products per cached Store API page.
6. Keep `YSIM_PRODUCT_CATALOG_SOURCE=hybrid`, `woocommerce`, or unset for
   activation. Hybrid reads the complete Woo SKU-family catalog first.

## Rollback

Set `YSIM_PRODUCT_CATALOG_SOURCE=woocommerce`, rebuild/restart the Storefront,
and verify listing, detail, cart and checkout. This pins the complete
WooCommerce SKU-family read path without a database rollback. Product Family
API data and old Woo translations remain unchanged.

`YSIM_PRODUCT_CATALOG_SOURCE=localization` is strict mode: it does not fall
back when the Product Family service is unavailable. Use it only after full
coverage and reliability have been accepted.
