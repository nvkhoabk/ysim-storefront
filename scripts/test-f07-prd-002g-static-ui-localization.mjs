import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const utf8 = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

async function contains(path, ...needles) {
  const source = await utf8(path);
  for (const needle of needles) {
    assert.ok(source.includes(needle), `${path} is missing ${needle}`);
  }
  return source;
}

const heroSearch = await contains(
  "src/components/hero/HeroSearch.tsx",
  "useStorefrontLocale",
  "createShellTranslator",
  't("search.placeholder")',
  't("search.destination")',
  't("search.product")',
  't("search.guide")',
);
assert.ok(!heroSearch.includes("Tìm điểm đến, sản phẩm hoặc cẩm nang"));
pass("HERO_SEARCH_RUNTIME_LOCALE_COPY");

await contains(
  "src/components/hero/HeroMedia.tsx",
  "useStorefrontLocale",
  't("heroMedia.coverage")',
  't("heroMedia.ready")',
  't("heroMedia.activation")',
  't("heroMedia.connected")',
);
pass("HERO_MEDIA_FALLBACK_RUNTIME_LOCALE_COPY");

await contains(
  "src/components/catalog/EsimInlineTypeExplorer.tsx",
  "createLocalizedEsimDestinationExplorer",
  'data-ysim-static-copy-scope="esim-explorer"',
  "data-ysim-static-copy-locale={locale}",
);
pass("ESIM_EXPLORER_LOCALIZED_STATIC_CONFIG");

const staticDestination = await contains(
  "src/i18n/listing/static-destination.config.ts",
  "destinationNameCatalog",
  "continentNameCatalog",
  "regionCopyCatalog",
  "createLocalizedEsimDestinationExplorer",
  "localizeEsimQuickFilterSelection",
);
assert.match(staticDestination, /[\u0E80-\u0EFF]/u);
assert.ok(staticDestination.includes("Southeast Asia"));
pass("DESTINATION_CONTINENT_REGION_CATALOG_VI_EN_LO");

await contains(
  "src/components/catalog/EsimInlineQuickCatalogExperience.tsx",
  "localizeEsimQuickFilterSelection",
  "localizeShellHref",
);
pass("ESIM_INTERACTION_SELECTION_LOCALIZED");

for (const path of [
  "src/components/destination/DestinationCard.tsx",
  "src/components/product/refactor/ProductCard.tsx",
  "src/components/destination/DestinationRail.tsx",
  "src/components/product/refactor/ProductRail.tsx",
  "src/components/home/refactor/TestimonialCard.tsx",
  "src/components/home/refactor/TestimonialRail.tsx",
]) {
  await contains(path, "createListingTranslator", "useStorefrontLocale");
}
pass("CARDS_AND_RAILS_RUNTIME_LOCALE_COPY_6_OF_6");

await contains(
  "src/lib/storefront/localization/localize-support-page.ts",
  "replace(/^production-/",
);
pass("SUPPORT_PRODUCTION_CONTACT_ID_LOCALIZED");

const trustRow = await contains(
  "src/components/navigation/TrustFeatureRow.tsx",
  "useOptionalStorefrontLocale",
  "runtime?.footer.trustFeatures",
);
assert.ok(!trustRow.includes("footerContentVi"));
pass("DESTINATIONS_TRUST_ROW_RUNTIME_LOCALE_COPY");

await contains(
  "src/components/product/refactor/integration/ProductDetailCandidateClient.tsx",
  't("product.dataLabel")',
  't("product.durationLabel")',
  't("product.usageTitle")',
);
await contains(
  "src/components/product/refactor/integration/ProductDetailCandidateGallery.tsx",
  't("product.galleryViewImage"',
);
pass("DYNAMIC_PRODUCT_STATIC_CONTROLS_LOCALIZED");

const detailMapper = await contains(
  "src/lib/storefront/integration/product-detail/product-detail-production-mapper.ts",
  "createDetailTranslator(locale)",
  't("product.usageStableWifi")',
  't("product.usageKeepInstalled")',
  't("product.usageEnableAtDestination")',
  't("product.usageUnlockedDevice")',
);
assert.ok(
  !detailMapper.includes('"Cài đặt eSIM khi có kết nối Wi‑Fi ổn định."'),
);
pass("DYNAMIC_PRODUCT_USAGE_NOTES_LOCALIZED");

for (const path of [
  "src/lib/storefront/localization/localize-home-page.ts",
  "src/lib/storefront/localization/localize-destination-page.ts",
]) {
  await contains(path, "localizeDestinationName", "localizeDurationLabel");
}
pass("HOME_AND_DESTINATION_PRESENTERS_LOCALIZED");

const homeLocalizer = await utf8(
  "src/lib/storefront/localization/localize-home-page.ts",
);
const destinationLocalizer = await utf8(
  "src/lib/storefront/localization/localize-destination-page.ts",
);
assert.ok(!/product:\s*\{[\s\S]*?name:/u.test(homeLocalizer));
assert.ok(!/product:\s*\{[\s\S]*?name:/u.test(destinationLocalizer));
pass("WOOCOMMERCE_PRODUCT_NAMES_UNCHANGED_BY_UI_LOCALIZERS");

for (const path of [
  "src/i18n/shell/messages/en.ts",
  "src/i18n/shell/messages/lo.ts",
  "src/i18n/listing/messages/en.ts",
  "src/i18n/listing/messages/lo.ts",
  "src/i18n/detail/messages/en.ts",
  "src/i18n/detail/messages/lo.ts",
]) {
  const source = await utf8(path);
  assert.ok(source.length > 0);
}
pass("STATIC_UI_CATALOGS_PRESENT_EN_LO");

await contains(
  "docs/architecture/F07_PRD_STATIC_UI_LOCALIZATION_CORRECTIVE.md",
  "WOOCOMMERCE_CATALOG_LANGUAGE_NORMALIZATION=DEFERRED_NON_BLOCKING",
  "All 14 production commerce execution flags remain `false`",
  "Six eSIM interaction states",
);
pass("CORRECTIVE_SCOPE_AND_DEFERRED_BOUNDARY_DOCUMENTED");

const gate = await utf8("src/lib/runtime/production-execution-gate.ts");
for (const flag of [
  "PAYMENT_EXECUTION_ENABLED",
  "FULFILLMENT_EXECUTION_ENABLED",
  "CUSTOMER_EMAIL_DELIVERY_ENABLED",
  "SCHEDULER_ENABLED",
  "AGENCY_GATEWAY_TOPUP_ENABLED",
  "YSIM_PAYMENT_OWNER_ENABLED",
]) {
  assert.ok(gate.includes(flag), `execution gate is missing ${flag}`);
}
pass("PRODUCTION_EXECUTION_GATE_PRESERVED");

console.log(`F07_PRD_002G_STATIC_UI_SOURCE_RESULT=PASS_ALL_${passed}`);
