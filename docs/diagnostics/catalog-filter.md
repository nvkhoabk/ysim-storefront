# Catalog filter diagnostic

This diagnostic compares the three layers involved in storefront country filtering:

1. Public WooCommerce Store API products.
2. Product families resolved by the YSim Localization API.
3. Results returned for different destination values such as `KR`, `kr`, `south-korea`, or `han-quoc`.

The storefront currently loads product listings through `YSIM_API_BASE_URL/products`; it does not read the WooCommerce product list directly. Therefore, products can exist in WooCommerce but remain absent from the storefront when synchronization, product-family mapping, localization, publication status, or destination mapping is incomplete.

## Run from the project root

Using Node.js 22 and an existing `.env.local`:

```bash
node --env-file=.env.local scripts/diagnose-catalog.mjs \
  --destination=KR \
  --aliases=KR,kr,south-korea,han-quoc \
  --expected-woo=32
```

For Japan:

```bash
node --env-file=.env.local scripts/diagnose-catalog.mjs \
  --destination=JP \
  --aliases=JP,jp,japan,nhat-ban \
  --expected-woo=32
```

The required variables are:

```dotenv
NEXT_PUBLIC_WOOCOMMERCE_URL=https://shop.ysim.vn
YSIM_API_BASE_URL=https://your-ysim-api.example.com
```

A complete JSON report is written to `artifacts/catalog-diagnostic-<timestamp>.json`.

## Read the result

- `WOO_PUBLIC_COUNT_BELOW_EXPECTED`: WooCommerce Admin may contain 32 products, but some are draft, private, hidden from catalog/search, or otherwise excluded from Store API.
- `LOCALIZATION_COUNT_BELOW_WOO`: WooCommerce contains more public products than the Localization API. Check importer/sync jobs, product-family creation, locale records, and whether both systems point to the same environment.
- `WOO_PRODUCTS_MISSING_FROM_LOCALIZATION`: the report lists exact Woo product IDs/SKUs absent from Localization API.
- `DESTINATION_ALIAS_CONTRACT_MISMATCH`: one value such as `KR` works while `south-korea` does not, or vice versa. Align the UI filter value with the backend contract.
- `DESTINATION_FILTER_REMOVES_ALL_PRODUCTS`: unfiltered products exist but every tested country value returns zero. Inspect destination attributes/categories stored during Woo-to-YSim synchronization.
- `WOO_PRODUCTS_WITHOUT_DESTINATION_HINT`: public Store API data exposes no recognizable destination/category/attribute for those products.

## Run on Debian sandbox

```bash
cd /var/www/sandbox.ysim.vn/storefront
git apply --check ysim-catalog-filter-diagnostic.patch
git apply ysim-catalog-filter-diagnostic.patch
npm run typecheck

node --env-file=.env.local scripts/diagnose-catalog.mjs \
  --destination=KR \
  --aliases=KR,kr,south-korea,han-quoc \
  --expected-woo=32
```

Do not publish the generated JSON report publicly if product metadata or internal API hostnames are considered sensitive.
