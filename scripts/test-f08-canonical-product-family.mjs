import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  canonicalProductFamilyKey,
  dedupeProductFamilies,
  productCatalogAttemptOrder,
  resolveProductCatalogSource,
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
  "localization",
  "woocommerce",
]);
assert.deepEqual(productCatalogAttemptOrder("woocommerce"), ["woocommerce"]);
pass("PRODUCT_FAMILY_IS_DEFAULT_WITH_EXPLICIT_WOO_ROLLBACK");

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
assert.match(productSource, /catalog_identity:/);
assert.match(productSource, /authoritativeProductId: product\.id/);
assert.doesNotMatch(
  readFileSync(
    resolve(root, "src/lib/woocommerce/product-catalog-policy.ts"),
    "utf8",
  ),
  /item\.(?:name|slug)/,
);
pass("CATALOG_ADAPTER_PRESERVES_AUTHORITATIVE_COMMERCE_ID");

const listingRoute = readFileSync(resolve(root, "src/app/esim/page.tsx"), "utf8");
const destinationRoute = readFileSync(
  resolve(root, "src/app/destinations/[slug]/page.tsx"),
  "utf8",
);
assert.match(listingRoute, /loadCatalog\(request\.shell\.locale\)/);
assert.match(destinationRoute, /loadCatalog\(request\.shell\.locale\)/);
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
