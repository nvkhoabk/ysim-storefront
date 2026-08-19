import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const readSource = (relativePath) =>
  readFile(path.join(repositoryRoot, relativePath), "utf8");

const [
  destinationRouteSource,
  esimRouteSource,
  serviceSource,
  fallbackSource,
  inlinePageSource,
  inlineExperienceSource,
  catalogSource,
  taxonomySource,
  runtimeSource,
] = await Promise.all([
  readSource("src/app/destinations/[slug]/page.tsx"),
  readSource("src/app/esim/page.tsx"),
  readSource("src/lib/storefront/integration/secondary-routes/service.ts"),
  readSource(
    "src/components/destination-products/DestinationProductsFallbackPage.tsx",
  ),
  readSource("src/components/catalog/EsimInlineQuickFilterPage.tsx"),
  readSource("src/components/catalog/EsimInlineQuickCatalogExperience.tsx"),
  readSource("src/components/catalog/EsimQuickProductCatalog.tsx"),
  readSource(
    "src/lib/storefront/catalog/woocommerce-category-taxonomy.ts",
  ),
  readSource("scripts/test-f08-dev-runtime-smoke.mjs"),
]);

assert.match(
  serviceSource,
  /createSecondaryCatalogSelectionQuery[\s\S]*selection\.kind === "destination"[\s\S]*destination: selection\.id[\s\S]*category: selection\.id/u,
);
assert.match(
  serviceSource,
  /getProducts\(\{[\s\S]*\.\.\.createSecondaryCatalogSelectionQuery\(selection\)/u,
);
assert.match(
  destinationRouteSource,
  /loadCatalog\(request\.shell\.locale, resolvedSelection\)/u,
);
assert.match(
  destinationRouteSource,
  /matchingProductCount = catalog\.products\.length/u,
);
assert.match(destinationRouteSource, /selectionApplied/u);
assert.match(
  esimRouteSource,
  /loadCatalog\(request\.shell\.locale, initialSelection\)/u,
);
assert.match(
  esimRouteSource,
  /selectionApplied=\{initialSelection\.kind !== "all"\}/u,
);
assert.match(fallbackSource, /createEsimQuickFilterUrl\(selection\)/u);
assert.match(fallbackSource, /selectionApplied=\{selectionApplied\}/u);
assert.match(
  inlinePageSource,
  /key=\{`\$\{initialSelection\.kind\}:\$\{initialSelection\.id\}`\}/u,
);
assert.match(inlinePageSource, /selectionApplied/);
assert.match(
  inlineExperienceSource,
  /router\.push\(\s*localizeShellHref\(createEsimQuickFilterUrl\(localized\), locale\),\s*\)/u,
);
assert.match(inlineExperienceSource, /selectionApplied=\{selectionApplied\}/u);
assert.match(
  catalogSource,
  /selectionApplied\s*\?\s*products\s*:\s*products\.filter/u,
);
assert.match(catalogSource, /taxonomy-authoritative-v3/u);
assert.match(
  taxonomySource,
  /destinationContinents\.size === 1[\s\S]*destinationContinents\.has\(continent\)/u,
);
assert.match(
  taxonomySource,
  /const continent = requestedContinent\(category\)[\s\S]*productMatchesContinent\(product, continent, taxonomy\)/u,
);

for (const semanticFilter of [
  "continent:asia",
  "continent:europe",
  "continent:north-america",
  "continent:south-america",
  "continent:africa",
  "continent:oceania",
  "global:global",
]) {
  assert.ok(
    runtimeSource.includes(`filter: "${semanticFilter}"`),
    `Runtime smoke is missing semantic contract ${semanticFilter}`,
  );
}

for (const runtimeRoute of [
  "/vi/esim?continent=asia",
  "/vi/esim?continent=europe",
  "/vi/esim?continent=north-america",
  "/vi/esim?continent=south-america",
  "/vi/esim?continent=africa",
  "/vi/esim?continent=oceania",
  "/vi/esim?type=global",
]) {
  assert.ok(
    runtimeSource.includes(runtimeRoute),
    `Runtime smoke is missing full-catalog route ${runtimeRoute}`,
  );
}

for (const observedFalsePositive of [
  "eSIM Châu Âu",
  "eSIM Nga",
  "eSIM Châu Á",
  "eSIM Nam Mỹ",
]) {
  assert.ok(
    runtimeSource.includes(observedFalsePositive),
    `Runtime smoke is missing observed false-positive guard: ${observedFalsePositive}`,
  );
}

console.log("COLLECTION_QUERY_DISPATCH=PASS");
console.log("DESTINATION_AND_FULL_CATALOG_PREFILTER=PASS");
console.log("COLLECTION_PREFILTER_BYPASS=PASS");
console.log("COLLECTION_RUNTIME_SEMANTIC_CONTRACTS=PASS_14_OF_14");
console.log("F08_COLLECTION_SEMANTIC_FILTER_RESULT=PASS");
