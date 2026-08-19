import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  canonicalProductFamilyKey,
  dedupeProductFamilies,
  normalizeStorefrontProductLocale,
  productCatalogAttemptOrder,
  resolveProductCatalogSource,
  selectSkuFamilyMembers,
  selectWooCatalogFamilyMembers,
  skuFamilyIdentity,
  wooCatalogFamilyIdentity,
} from "../src/lib/woocommerce/product-catalog-policy.ts";

const root = resolve(import.meta.dirname, "..");
let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

assert.equal(resolveProductCatalogSource(undefined), "hybrid");
assert.equal(resolveProductCatalogSource("HYBRID"), "hybrid");
assert.deepEqual(productCatalogAttemptOrder("hybrid"), [
  "woocommerce",
  "localization",
]);
assert.deepEqual(productCatalogAttemptOrder("woocommerce"), ["woocommerce"]);
assert.deepEqual(productCatalogAttemptOrder("localization"), ["localization"]);
pass("SKU_FAMILY_IS_DEFAULT_WITH_EXPLICIT_LOCALIZATION_STRICT_MODE");

assert.deepEqual(skuFamilyIdentity(" jp-5gbd-7d-en "), {
  familyCode: "JP-5GBD-7D",
  locale: "en",
  suffix: "EN",
});
assert.deepEqual(skuFamilyIdentity("JP-5GBD-7D-LA"), {
  familyCode: "JP-5GBD-7D",
  locale: "lo",
  suffix: "LA",
});
assert.deepEqual(skuFamilyIdentity("JP-EN-7D"), {
  familyCode: "JP-EN-7D",
  locale: "vi",
  suffix: "",
});
assert.equal(skuFamilyIdentity(""), null);
assert.equal(normalizeStorefrontProductLocale("EN"), "en");
assert.equal(normalizeStorefrontProductLocale("la"), "vi");
pass("SKU_SUFFIX_IS_EXACT_TERMINAL_CASE_INSENSITIVE_IDENTITY");

const skuProducts = [
  { id: 11, sku: "JP-5GBD-7D-LO", name: "Lao" },
  { id: 12, sku: "JP-5GBD-7D-EN", name: "English" },
  { id: 13, sku: "JP-5GBD-7D-VI", name: "Vietnamese explicit" },
  { id: 14, sku: "JP-5GBD-7D", name: "Vietnamese default" },
  { id: 15, sku: "JP-5GBD-7D-LA", name: "Lao legacy" },
  { id: 21, sku: "KH-10D-EN", name: "English only" },
  { id: 31, sku: "", name: "No SKU A" },
  { id: 32, sku: "", name: "No SKU B" },
];

const viProducts = selectSkuFamilyMembers(skuProducts, "vi");
const enProducts = selectSkuFamilyMembers(skuProducts, "en");
const loProducts = selectSkuFamilyMembers(skuProducts, "lo");
assert.deepEqual(viProducts.map((item) => item.id), [14, 21, 31, 32]);
assert.deepEqual(enProducts.map((item) => item.id), [12, 21, 31, 32]);
assert.deepEqual(loProducts.map((item) => item.id), [11, 21, 31, 32]);
assert.equal(enProducts[0]?.sku, "JP-5GBD-7D-EN");
pass("ONE_WOO_RECORD_PER_SKU_FAMILY_AND_REQUESTED_LOCALE_WINS");

const liveJapanCopies = [
  {
    id: 100,
    sku: "GIGA-JP-D3GB-15",
    slug: "esim-nhat-ban",
    name: "eSIM Nhật Bản",
  },
  {
    id: 2834,
    sku: "GIGA-JP-D3GB-31",
    slug: "esim-japan-la",
    name: "Lao copy",
  },
  {
    id: 4722,
    sku: "GIGA-JP-D3GB-36",
    slug: "japan-esim-en",
    name: "Japan eSIM",
  },
];
assert.deepEqual(wooCatalogFamilyIdentity(liveJapanCopies[2]), {
  familyCode: "GIGA-JP-D3GB",
  locale: "en",
  suffix: "",
  derivation: "numeric-copy",
});
assert.deepEqual(
  selectWooCatalogFamilyMembers(liveJapanCopies, "en").map(
    (item) => item.id,
  ),
  [4722],
);
assert.deepEqual(
  selectWooCatalogFamilyMembers(liveJapanCopies, "lo").map(
    (item) => item.id,
  ),
  [2834],
);
assert.deepEqual(
  selectWooCatalogFamilyMembers(liveJapanCopies, "vi").map(
    (item) => item.id,
  ),
  [100],
);
pass("LIVE_NUMERIC_COPY_SKUS_COLLAPSE_TO_REQUESTED_LOCALE");

const emptyParentSkuCopies = [
  {
    id: 545,
    sku: "",
    slug: "esim-australia",
    catalog_family_anchor_sku: "GIGA-AU-T30GB-03",
  },
  {
    id: 3022,
    sku: "",
    slug: "esim-australia-la",
    catalog_family_anchor_sku: "GIGA-AU-T30GB-31",
  },
  {
    id: 4913,
    sku: "",
    slug: "australia-esim-en",
    catalog_family_anchor_sku: "GIGA-AU-T30GB-37",
  },
];
assert.deepEqual(
  selectWooCatalogFamilyMembers(emptyParentSkuCopies, "en").map(
    (item) => item.id,
  ),
  [4913],
);
assert.equal(
  wooCatalogFamilyIdentity(emptyParentSkuCopies[0])?.familyCode,
  "GIGA-AU-T30GB",
);
pass("EMPTY_PARENT_SKU_USES_FIRST_VARIATION_ANCHOR");

const sameLocaleNumericProducts = [
  { id: 801, sku: "PRIVATE-FAMILY-01", slug: "goi-rieng-a" },
  { id: 802, sku: "PRIVATE-FAMILY-02", slug: "goi-rieng-b" },
];
assert.deepEqual(
  selectWooCatalogFamilyMembers(sameLocaleNumericProducts, "vi").map(
    (item) => item.id,
  ),
  [801, 802],
);
pass("NUMERIC_STEM_REQUIRES_MULTIPLE_LOCALE_COHORTS");

const skuVariations = [
  { id: 101, sku: "JP-5GBD-7D-V1" },
  { id: 102, sku: "JP-5GBD-7D-V2-EN" },
  { id: 103, sku: "JP-5GBD-7D-V2-VI" },
  { id: 104, sku: "JP-5GBD-7D-V2-LO" },
];
assert.deepEqual(
  selectSkuFamilyMembers(skuVariations, "en").map((item) => item.id),
  [101, 102],
);
assert.deepEqual(
  selectSkuFamilyMembers(skuVariations, "vi").map((item) => item.id),
  [101, 103],
);
pass("VARIATION_IDS_AND_SKUS_FOLLOW_THE_SAME_EXPLICIT_FAMILY_RULE");

const records = [
  {
    familyId: 101,
    familyCode: "KH-7D",
    requestedLocale: "en",
    resolvedLocale: "vi",
    slug: "esim-campuchia-7-ngay",
    name: "eSIM Campuchia 7 ngày",
  },
  {
    familyId: 101,
    familyCode: "KH-7D",
    requestedLocale: "en",
    resolvedLocale: "en",
    slug: "cambodia-esim-7-days",
    name: "Cambodia eSIM 7 days",
  },
  {
    familyId: 202,
    familyCode: "KH-15D",
    requestedLocale: "en",
    resolvedLocale: "en",
    slug: "cambodia-esim-15-days",
    name: "Cambodia eSIM 7 days",
  },
];
const deduped = dedupeProductFamilies(records);
assert.equal(deduped.length, 2);
assert.equal(deduped[0]?.slug, "cambodia-esim-7-days");
assert.equal(deduped[1]?.familyId, 202);
pass("EXPLICIT_FAMILY_ID_DEDUPES_AND_EXACT_LOCALE_WINS");

assert.equal(
  canonicalProductFamilyKey({ familyId: 0, familyCode: " giga-kh " }),
  "code:GIGA-KH",
);
assert.throws(
  () => canonicalProductFamilyKey({ familyId: 0, familyCode: "" }),
  /PRODUCT_FAMILY_IDENTITY_MISSING/,
);
pass("MISSING_FAMILY_IDENTITY_FAILS_CLOSED");

const productSource = readFileSync(
  resolve(root, "src/lib/woocommerce/products.ts"),
  "utf8",
);
assert.match(productSource, /dedupeProductFamilies\(response\.items\)/);
assert.match(productSource, /selectWooSkuFamilyProducts/);
assert.match(productSource, /attachWooCatalogFamilyAnchors/);
assert.match(productSource, /selectWooCatalogFamilyMembers/);
assert.match(productSource, /selectSkuFamilyMembers\(product\.variations/);
assert.match(productSource, /fetchWooSkuFamilyProductBySlug/);
assert.match(productSource, /catalog_identity:/);
assert.match(productSource, /authoritativeProductId: product\.id/);
pass("CATALOG_AND_DETAIL_PRESERVE_AUTHORITATIVE_COMMERCE_ID");

const catalogPolicySource = readFileSync(
  resolve(root, "src/lib/woocommerce/product-catalog-policy.ts"),
  "utf8",
);
assert.doesNotMatch(catalogPolicySource, /item\.name/);
assert.match(
  catalogPolicySource,
  /slug token is used solely to classify the localized/,
);
assert.match(productSource, /const perPage = 25/);
pass("FAMILY_CODE_EXCLUDES_TRANSLATED_TEXT_AND_LARGE_PAGE_CACHE_OVERFLOW");

const listingRoute = readFileSync(resolve(root, "src/app/esim/page.tsx"), "utf8");
const destinationRoute = readFileSync(
  resolve(root, "src/app/destinations/[slug]/page.tsx"),
  "utf8",
);
assert.match(
  listingRoute,
  /loadCatalog\(request\.shell\.locale,\s*initialSelection\)/,
);
assert.match(
  destinationRoute,
  /loadCatalog\(request\.shell\.locale,\s*resolvedSelection\)/,
);
pass("LISTINGS_REQUEST_CURRENT_LOCALE");

const detailRoute = readFileSync(
  resolve(root, "src/app/esim/[slug]/page.tsx"),
  "utf8",
);
assert.match(detailRoute, /PRODUCT_LOCALES.*\["vi", "en", "lo"\]/);
assert.match(detailRoute, /getProductBySlug\(slug, locale\)/);
assert.match(detailRoute, /"x-default"/);
pass("PRODUCT_DETAIL_EMITS_LOCALIZED_CANONICAL_AND_HREFLANG");

console.log(`F08_CANONICAL_PRODUCT_FAMILY_TESTS_PASSED=${passed}`);
