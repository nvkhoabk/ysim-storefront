import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  normalizeProductDescriptionHtml,
  normalizeProductDescriptionText,
} from "../src/lib/storefront/content/product-description.ts";

const normalized = normalizeProductDescriptionText(`
  <p>China Mobile , tốc độ cao mỗi ngày .</p>
  <p>500MB &amp;#8211; 30GB/ngày &amp; hỗ trợ hotspot.</p>
  <script>alert("unsafe")</script>
`);

assert.equal(
  normalized,
  "China Mobile, tốc độ cao mỗi ngày.\n\n500MB – 30GB/ngày & hỗ trợ hotspot.",
);

const formatted = normalizeProductDescriptionHtml(`
  <h3>Mô tả sản phẩm</h3>
  <p>China Mobile , <strong>tốc độ cao</strong> &amp;#8211; ổn định.</p>
  <ul><li><strong>Dung lượng:</strong> 30GB/ngày</li></ul>
  <script>alert("unsafe")</script>
  <a href="javascript:alert('unsafe')" onclick="alert('unsafe')">Liên kết</a>
`);
assert.match(formatted, /<h3>Mô tả sản phẩm<\/h3>/u);
assert.match(formatted, /<strong>tốc độ cao<\/strong> &#8211; ổn định\./u);
assert.match(formatted, /<ul><li><strong>Dung lượng:<\/strong>/u);
assert.doesNotMatch(formatted, /<script|onclick|javascript:/iu);
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
assert.match(componentSource, /dangerouslySetInnerHTML/u);
assert.match(componentSource, /max-h-28 overflow-hidden/u);
assert.match(componentSource, /\[&_figure\]:hidden/u);
assert.match(componentSource, /\[&_ul\]:list-disc/u);
assert.match(componentSource, /\[&_strong\]:font-bold/u);
assert.match(componentSource, /\[&_table\]:my-5/u);
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
console.log("PRODUCT_DESCRIPTION_RICH_HTML_PRESERVATION=PASS");
console.log("PRODUCT_DESCRIPTION_ACTIVE_MARKUP_REMOVAL=PASS");
console.log("PRODUCT_DESCRIPTION_COLLAPSE_CONTROL=PASS");
console.log("PRODUCT_DESCRIPTION_I18N=PASS_3_OF_3");
console.log("F08_PRODUCT_DESCRIPTION_PRESENTATION=PASS");
