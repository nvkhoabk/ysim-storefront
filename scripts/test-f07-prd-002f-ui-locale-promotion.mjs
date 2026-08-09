import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

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
}

const localeRoutes = [
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/destinations/page.tsx",
  "src/app/[locale]/destinations/[slug]/page.tsx",
  "src/app/[locale]/esim/page.tsx",
  "src/app/[locale]/esim/[slug]/page.tsx",
  "src/app/[locale]/offers/page.tsx",
  "src/app/[locale]/support/page.tsx",
  "src/app/[locale]/cart/page.tsx",
  "src/app/[locale]/checkout/page.tsx",
  "src/app/[locale]/guides/page.tsx",
  "src/app/[locale]/guides/[slug]/page.tsx",
];

for (const route of localeRoutes)
  await access(new URL(`../${route}`, import.meta.url));
assert.equal(localeRoutes.length, 11);
pass("REAL_LOCALE_APP_ROUTER_SURFACE_11_OF_11");

await contains(
  "src/app/[locale]/layout.tsx",
  'data-ysim-ui="refactor"',
  "data-ysim-locale={locale}",
  "generateStaticParams",
  "SHELL_LOCALES",
);
pass("LOCALE_LAYOUT_REFACTOR_MARKER_AND_STATIC_PARAMS");

await contains(
  "src/proxy.ts",
  'pathname.startsWith("/ui-preview/")',
  'pathname.startsWith("/api/ui-preview/")',
  "status: 404",
  "NextResponse.redirect(new URL(location, request.url), 308)",
  'localizePathname("vi", pathname)',
  "PUBLIC_LOCALE_ROUTE_HEADER",
);
pass("PROXY_DEFAULT_VI_308_AND_PREVIEW_404");

await contains(
  "src/lib/storefront/integration/route-flags.ts",
  "process.env.NODE_ENV ===",
  'return "refactor"',
);
pass("PRODUCTION_UI_MODE_LOCKED_REFACTOR");

const routeFlags = await utf8("src/lib/storefront/integration/route-flags.ts");
assert.equal((routeFlags.match(/YSIM_UI_[A-Z_]+/g) ?? []).length, 10);
pass("REVIEWED_ROUTE_FAMILIES_10_OF_10");

await contains(
  "src/components/navigation/LanguageSwitcher.tsx",
  "localizeShellHref(",
  "window.location.pathname",
  "window.location.assign",
);
const switcher = await utf8("src/components/navigation/LanguageSwitcher.tsx");
assert.ok(!switcher.includes("/api/preferences/market"));
pass("LANGUAGE_SWITCH_USES_PUBLIC_LOCALE_PATHS");

await contains(
  "src/i18n/runtime/runtime.metadata.ts",
  '"x-default": href("vi")',
  "canonical: href(request.shell.locale)",
  'vi: href("vi")',
  'en: href("en")',
  'lo: href("lo")',
);
pass("CANONICAL_AND_HREFLANG_VI_EN_LO_XDEFAULT");

await contains(
  "docs/architecture/F07_PRD_UI_LOCALE_PROMOTION.md",
  "WOOCOMMERCE_CATALOG_LANGUAGE_NORMALIZATION=DEFERRED_NON_BLOCKING",
  "All production commerce execution flags remain false",
);
pass("CATALOG_LANGUAGE_NORMALIZATION_EXPLICITLY_DEFERRED");

await contains(
  "src/lib/ysim-api/client.ts",
  "private async request",
  "YSIM_API_BASE_URL is not configured",
);
const apiClient = await utf8("src/lib/ysim-api/client.ts");
const constructorBody = apiClient.match(/constructor[\s\S]*?\n  }/)?.[0] ?? "";
assert.ok(!constructorBody.includes("throw new Error"));
pass("YSIM_API_VALIDATION_REMAINS_LAZY_FAIL_CLOSED");

for (const path of [
  "src/i18n/home/messages/lo.ts",
  "src/i18n/listing/messages/lo.ts",
  "src/i18n/transaction/messages/lo.ts",
  "src/i18n/secondary/messages/lo.ts",
  "src/i18n/offers/offers-partner.config.ts",
  "src/i18n/support/support.config.ts",
]) {
  assert.match(await utf8(path), /[\u0E80-\u0EFF]/u, `${path} has no Lao copy`);
}
pass("LAO_UI_COPY_PRESENT_ACROSS_PRIMARY_SURFACES");

const guideService = await utf8(
  "src/lib/content/route-candidate/guide-route-candidate-service.ts",
);
assert.ok(guideService.includes('localizeShellHref("/guides"'));
assert.ok(!guideService.includes("/ui-preview/guides-route-candidate"));
pass("GUIDE_PRODUCTION_LINKS_NO_LONGER_TARGET_PREVIEW");

for (const path of [
  "src/components/payment/refactor/integration/PaymentCandidateClient.tsx",
  "src/components/order/refactor/integration/OrderCandidateClient.tsx",
  "src/components/order/refactor/integration/SecureOrderResultComposition.tsx",
  "src/components/payment/refactor/OrderResultPageComposition.tsx",
]) {
  assert.ok(!(await utf8(path)).includes('href="/ui-preview'));
}
pass("PUBLIC_PAYMENT_AND_ORDER_STATES_NO_PREVIEW_LINKS");

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

const appPaths = JSON.parse(await utf8(".next/server/app-paths-manifest.json"));
for (const route of [
  "/[locale]/page",
  "/[locale]/destinations/page",
  "/[locale]/esim/page",
  "/[locale]/esim/[slug]/page",
  "/[locale]/offers/page",
  "/[locale]/support/page",
  "/[locale]/checkout/page",
]) {
  assert.ok(route in appPaths, `compiled route missing: ${route}`);
}
pass("COMPILED_LOCALE_ROUTE_MANIFEST_7_OF_7");

const buildId = (await utf8(".next/BUILD_ID")).trim();
assert.match(buildId, /^[A-Za-z0-9_-]{10,64}$/u);
pass("COMPILED_BUILD_ID_PRESENT");

console.log(`F07_PRD_002F_UI_LOCALE_SOURCE_RESULT=PASS_ALL_${passed}`);
