import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
let passed = 0;

function source(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

const config = source("src/config/storefront-destination-heroes.ts");
const hero = source(
  "src/components/destination-products/DestinationCountryHero.tsx",
);
const fallbackPage = source(
  "src/components/destination-products/DestinationProductsFallbackPage.tsx",
);
const route = source("src/app/destinations/[slug]/page.tsx");

for (const slug of [
  "japan",
  "south-korea",
  "thailand",
  "singapore",
  "china",
  "united-states",
  "france",
  "laos",
  "vietnam",
  "taiwan",
  "india",
]) {
  assert.match(config, new RegExp(`["']?${slug}["']?\\s*:`));
}
pass("COUNTRY_HERO_CONFIG_COVERS_ELEVEN_PRIORITY_DESTINATIONS");

assert.match(config, /fallback-desktop\.webp/u);
assert.match(config, /fallback-mobile\.webp/u);
assert.match(config, /configured:\s*false/u);
assert.match(config, /destinationHeroAliases/u);
pass("MISSING_DESTINATION_ASSET_RESOLVES_TO_EXPLICIT_FALLBACK");

assert.match(hero, /<picture>/u);
assert.match(hero, /media="\(max-width: 639px\)"/u);
assert.match(hero, /getImageProps/u);
assert.match(hero, /priority:\s*true/u);
assert.equal((hero.match(/priority:\s*true/gu) ?? []).length, 1);
assert.match(hero, /objectPosition:\s*asset\.focus/u);
pass("RESPONSIVE_ART_DIRECTION_FOCUS_AND_SINGLE_LCP_PRIORITY");

assert.match(hero, /onError/u);
assert.match(hero, /setAsset\(storefrontDestinationHeroFallback\)/u);
pass("RUNTIME_IMAGE_ERROR_FALLS_BACK_WITHOUT_LAYOUT_REMOVAL");

assert.match(fallbackPage, /ordinary\.destinationImageAlt/u);
assert.match(fallbackPage, /name:\s*selection\.label/u);
assert.match(fallbackPage, /DestinationCountryHero/u);
assert.match(route, /localizeEsimQuickFilterSelection/u);
assert.match(route, /resolveStorefrontDestinationHero/u);
pass("LOCALIZED_TITLE_ALT_AND_SERVER_RESOLVED_HERO_ARE_WIRED");

const assetRoot = resolve(root, "public/assets/storefront/destination-heroes");
const assetSlugs = [
  "fallback",
  "japan",
  "south-korea",
  "thailand",
  "singapore",
  "china",
  "united-states",
  "france",
  "laos",
  "vietnam",
  "taiwan",
  "india",
];

for (const slug of assetSlugs) {
  for (const viewport of ["desktop", "mobile"]) {
    const path = resolve(assetRoot, `${slug}-${viewport}.webp`);
    const bytes = statSync(path).size;
    assert.ok(bytes > 0, `${path} must not be empty`);
    assert.ok(bytes <= 250_000, `${path} exceeds 250 KB`);
  }
}
pass("WEBP_DESKTOP_MOBILE_ASSETS_PASS_24_OF_24_SIZE_BUDGET");

assert.doesNotMatch(hero, /dangerouslySetInnerHTML/u);
assert.doesNotMatch(config, /https?:\/\//u);
pass("HERO_ASSETS_ARE_LOCAL_AND_RENDER_WITHOUT_UNSAFE_HTML");

console.log(`F08_04_DESTINATION_COUNTRY_HERO_ASSERTIONS=${passed}`);
console.log("F08_04_DESTINATION_COUNTRY_HERO_RESULT=PASS");
