import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  normalizeStorefrontSearchText,
  rankStorefrontSuggestions,
} from "#storefront-search-core";

const root = resolve(import.meta.dirname, "..");
let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

function destination({
  slug,
  vi,
  en,
  lo,
  priority,
  aliases = {},
  keywords = [],
}) {
  return {
    id: `destination-${slug}`,
    canonicalKey: `destination:${slug}`,
    type: "destination",
    label: en,
    href: `/en/esim?destination=${slug}`,
    localizedTerms: { vi: [vi], en: [en], lo: [lo] },
    aliases,
    keywords,
    priority,
    countryCode: slug.slice(0, 2),
    flagUrl: `/assets/storefront/flags/${slug.slice(0, 2)}.svg`,
  };
}

const items = [
  destination({
    slug: "vietnam",
    vi: "Việt Nam",
    en: "Vietnam",
    lo: "ຫວຽດນາມ",
    priority: { vi: 6, en: 0, lo: 1 },
    aliases: { vi: ["Viet Nam"], en: ["Viet Nam"] },
    keywords: ["Hanoi", "Ha Noi", "Saigon"],
  }),
  destination({
    slug: "japan",
    vi: "Nhật Bản",
    en: "Japan",
    lo: "ຍີ່ປຸ່ນ",
    priority: { vi: 0, en: 1, lo: 3 },
    aliases: { vi: ["Nhat Ban"], en: ["Nippon"] },
    keywords: ["Tokyo", "Osaka"],
  }),
  destination({
    slug: "korea",
    vi: "Hàn Quốc",
    en: "South Korea",
    lo: "ເກົາຫຼີໃຕ້",
    priority: { vi: 1, en: 2, lo: 4 },
    aliases: { vi: ["Han Quoc"], en: ["Korea"] },
    keywords: ["Seoul", "Busan"],
  }),
  destination({
    slug: "thailand",
    vi: "Thái Lan",
    en: "Thailand",
    lo: "ໄທ",
    priority: { vi: 2, en: 3, lo: 0 },
    keywords: ["Bangkok", "Phuket"],
  }),
  destination({
    slug: "singapore",
    vi: "Singapore",
    en: "Singapore",
    lo: "ສິງກະໂປ",
    priority: { vi: 3, en: 4, lo: 5 },
  }),
  destination({
    slug: "china",
    vi: "Trung Quốc",
    en: "China",
    lo: "ຈີນ",
    priority: { vi: 4, en: 5, lo: 2 },
    keywords: ["Beijing", "Shanghai"],
  }),
  destination({
    slug: "usa",
    vi: "Hoa Kỳ",
    en: "United States",
    lo: "ສະຫະລັດອາເມລິກາ",
    priority: { vi: 5, en: 6, lo: 6 },
    aliases: { vi: ["My", "Hoa Ky"], en: ["USA", "America"] },
  }),
];

assert.equal(normalizeStorefrontSearchText("  NHẬT-BẢN  "), "nhat ban");
assert.equal(normalizeStorefrontSearchText("Đà Nẵng"), "da nang");
pass("NORMALIZATION_HANDLES_CASE_PUNCTUATION_AND_VIETNAMESE_DIACRITICS");

assert.equal(
  rankStorefrontSuggestions(items, "en", "")[0]?.canonicalKey,
  "destination:vietnam",
);
assert.equal(
  rankStorefrontSuggestions(items, "vi", "")[0]?.canonicalKey,
  "destination:japan",
);
assert.equal(
  rankStorefrontSuggestions(items, "lo", "")[0]?.canonicalKey,
  "destination:thailand",
);
pass("EMPTY_QUERY_USES_LOCALE_TRAVEL_PRIORITY_AND_ENGLISH_VIETNAM_FIRST");

assert.equal(
  rankStorefrontSuggestions(items, "vi", "nhat ban")[0]?.canonicalKey,
  "destination:japan",
);
assert.equal(
  rankStorefrontSuggestions(items, "en", "Kor")[0]?.canonicalKey,
  "destination:korea",
);
assert.equal(
  rankStorefrontSuggestions(items, "lo", "ຈີ")[0]?.canonicalKey,
  "destination:china",
);
pass("EXACT_PREFIX_AND_LAO_MATCHES_RANK_FIRST");

assert.equal(
  rankStorefrontSuggestions(items, "en", "Tokyo")[0]?.canonicalKey,
  "destination:japan",
);
assert.equal(
  rankStorefrontSuggestions(items, "vi", "Han Quoc")[0]?.canonicalKey,
  "destination:korea",
);
assert.equal(
  rankStorefrontSuggestions(items, "en", "USA")[0]?.canonicalKey,
  "destination:usa",
);
pass("TRAVEL_KEYWORDS_AND_ALIASES_MATCH_ACROSS_NORMALIZED_FORMS");

const duplicateItems = [
  items[0],
  { ...items[0], id: "duplicate-vietnam" },
  ...items.slice(1),
];
const filled = rankStorefrontSuggestions(duplicateItems, "en", "Tokyo");
assert.equal(filled.length, 5);
assert.equal(
  new Set(filled.map((item) => item.canonicalKey)).size,
  filled.length,
);
assert.equal(filled[0]?.canonicalKey, "destination:japan");
pass("MATCHES_FILL_TO_FIVE_WITHOUT_DUPLICATE_CANONICAL_DESTINATIONS");

const productFamilyItems = [
  {
    id: "product-vi",
    canonicalKey: "product:giga-jp-d3gb",
    type: "product",
    label: "eSIM Nhật Bản",
    href: "/vi/esim/esim-nhat-ban",
    localizedTerms: { vi: ["eSIM Nhật Bản"] },
    keywords: ["GIGA-JP-D3GB", "Japan"],
    priority: { vi: 0 },
  },
  {
    id: "product-en-copy",
    canonicalKey: "product:giga-jp-d3gb",
    type: "product",
    label: "Japan eSIM",
    href: "/en/esim/japan-esim",
    localizedTerms: { en: ["Japan eSIM"] },
    keywords: ["GIGA-JP-D3GB", "Japan"],
    priority: { en: 0 },
  },
];
assert.equal(
  rankStorefrontSuggestions(productFamilyItems, "en", "Japan", {
    minResults: 1,
  }).length,
  1,
);
pass("CANONICAL_PRODUCT_FAMILY_IS_NEVER_SUGGESTED_TWICE");

const noMatch = rankStorefrontSuggestions(items, "en", "unmatched-value");
assert.equal(noMatch.length, 5);
assert.equal(noMatch[0]?.canonicalKey, "destination:vietnam");
assert.ok(
  rankStorefrontSuggestions([...items, ...items], "en", "", { maxResults: 10 })
    .length <= 10,
);
assert.equal(rankStorefrontSuggestions(items.slice(0, 3), "en", "").length, 3);
pass("NO_MATCH_FALLBACK_MAX_TEN_AND_SMALL_DATASET_EXCEPTION");

const heroSearchSource = readFileSync(
  resolve(root, "src/components/hero/HeroSearch.tsx"),
  "utf8",
);
const productSearchSource = readFileSync(
  resolve(root, "src/components/catalog/EsimQuickProductCatalog.tsx"),
  "utf8",
);
const comboboxSource = readFileSync(
  resolve(root, "src/components/search/StorefrontSearchCombobox.tsx"),
  "utf8",
);
const searchConfigSource = readFileSync(
  resolve(root, "src/config/storefront-search.ts"),
  "utf8",
);

assert.match(heroSearchSource, /StorefrontSearchCombobox/);
assert.match(productSearchSource, /StorefrontSearchCombobox/);
assert.match(comboboxSource, /role="combobox"/);
assert.match(comboboxSource, /role="listbox"/);
assert.match(comboboxSource, /aria-activedescendant/);
assert.match(searchConfigSource, /en:\s*\[\s*"vietnam"/u);
assert.match(searchConfigSource, /\/assets\/storefront\/flags\/vn\.svg/u);
assert.match(searchConfigSource, /\/assets\/storefront\/flags\/cn\.svg/u);
pass("SHARED_ACCESSIBLE_COMBOBOX_AND_INTERNAL_PRIORITY_FLAGS_ARE_WIRED");

console.log(`F08_MULTILINGUAL_SEARCH_TESTS_PASSED=${passed}`);
