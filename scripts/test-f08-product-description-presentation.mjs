import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { normalizeProductDescriptionText } from "../src/lib/storefront/content/product-description.ts";

const normalized = normalizeProductDescriptionText(`
  <p>China Mobile , tốc độ cao mỗi ngày .</p>
  <p>500MB &amp;#8211; 30GB/ngày &amp; hỗ trợ hotspot.</p>
  <script>alert("unsafe")</script>
`);

assert.equal(
  normalized,
  "China Mobile, tốc độ cao mỗi ngày.\n\n500MB – 30GB/ngày & hỗ trợ hotspot.",
);
assert.equal(
  normalizeProductDescriptionText("&#x2022; QR &nbsp; eSIM &#8212; nhanh"),
  "• QR eSIM — nhanh",
);

const repositoryRoot = process.cwd();
const componentSource = await readFile(
  path.join(
    repositoryRoot,
    "src/components/product/refactor/integration/ProductDetailCandidateClient.tsx",
  ),
  "utf8",
);
assert.match(componentSource, /line-clamp-4/u);
assert.match(componentSource, /aria-expanded=\{descriptionExpanded\}/u);
assert.match(componentSource, /product\.descriptionReadMore/u);
assert.match(componentSource, /product\.descriptionReadLess/u);

for (const locale of ["vi", "en", "lo"]) {
  const messages = await readFile(
    path.join(repositoryRoot, `src/i18n/detail/messages/${locale}.ts`),
    "utf8",
  );
  assert.match(messages, /"product\.descriptionReadMore"/u);
  assert.match(messages, /"product\.descriptionReadLess"/u);
}

console.log("PRODUCT_DESCRIPTION_ENTITY_DECODING=PASS");
console.log("PRODUCT_DESCRIPTION_PUNCTUATION_NORMALIZATION=PASS");
console.log("PRODUCT_DESCRIPTION_COLLAPSE_CONTROL=PASS");
console.log("PRODUCT_DESCRIPTION_I18N=PASS_3_OF_3");
console.log("F08_PRODUCT_DESCRIPTION_PRESENTATION=PASS");
