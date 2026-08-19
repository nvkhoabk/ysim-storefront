import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const detailPage = await readFile(
  "src/app/destinations/[slug]/page.tsx",
  "utf8",
);
const localizedRoute = await readFile(
  "src/app/[locale]/destinations/[slug]/page.tsx",
  "utf8",
);
const fallbackPage = await readFile(
  "src/components/destination-products/DestinationProductsFallbackPage.tsx",
  "utf8",
);
const runtimeSmoke = await readFile(
  "scripts/test-f08-dev-runtime-smoke.mjs",
  "utf8",
);

assert.match(
  fallbackPage,
  /useStorefrontLocale\(\)/,
  "DestinationProductsFallbackPage must remain explicitly locale-aware.",
);
assert.match(
  detailPage,
  /import\s*\{\s*StorefrontLocaleProvider\s*\}\s*from\s*["']@\/i18n\/runtime["']/,
  "The shared destination detail page must import the locale provider.",
);
assert.match(
  detailPage,
  /<StorefrontLocaleProvider\s+shell=\{request\.shell\}>[\s\S]*<PageShell>[\s\S]*<DestinationProductsFallbackPage[\s\S]*<\/PageShell>[\s\S]*<\/StorefrontLocaleProvider>/,
  "The provider must enclose PageShell and the destination fallback client component.",
);
assert.match(
  localizedRoute,
  /from\s+["']\.\.\/\.\.\/\.\.\/destinations\/\[slug\]\/page["']/,
  "The localized destination route must continue using the protected shared page.",
);
assert.match(
  runtimeSmoke,
  /\/vi\/destinations\/korea/,
  "Runtime smoke coverage must retain the live legacy Korea alias.",
);
assert.match(
  runtimeSmoke,
  /STOREFRONT_LOCALE_PROVIDER_REQUIRED/,
  "Runtime smoke coverage must reject the reproduced provider error signature.",
);

console.log("DESTINATION_CLIENT_COMPONENT_REMAINS_LOCALE_AWARE=PASS");
console.log("SHARED_DESTINATION_PAGE_OWNS_LOCALE_PROVIDER_BOUNDARY=PASS");
console.log("LOCALIZED_AND_ROOT_DESTINATION_ROUTES_SHARE_PROTECTED_PAGE=PASS");
console.log("KOREA_ALIAS_RUNTIME_PROVIDER_ERROR_REGRESSION=PASS");
console.log("F08_DESTINATION_LOCALE_PROVIDER_ASSERTIONS=PASS_6_OF_6");
