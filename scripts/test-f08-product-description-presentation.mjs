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
assert.match(formatted, /<strong>tốc độ cao<\/strong> – ổn định\./u);
assert.match(formatted, /<ul><li><strong>Dung lượng:<\/strong>/u);
assert.doesNotMatch(formatted, /<script|onclick|javascript:/iu);

for (const attack of [
  '<a href="java&#x73;cript:alert(document.domain)">encoded scheme</a>',
  '<a href="java&#x09;script:alert(1)">encoded whitespace</a>',
  '<a href="&#106;avascript:alert(1)">encoded leading character</a>',
  '<a href="vbscript:msgbox(1)">legacy scheme</a>',
  '<img src="data&#58;text/html,<script>alert(1)</script>">',
  '<svg><a xlink:href="javascript:alert(1)">svg link</a></svg>',
]) {
  const sanitized = normalizeProductDescriptionHtml(attack);
  assert.doesNotMatch(
    sanitized,
    /(?:java\s*script|vbscript|data\s*:|xlink:href|<svg|<script)/iu,
    `Unsafe encoded markup survived sanitization: ${sanitized}`,
  );
  assert.doesNotMatch(
    sanitized,
    /\s(?:href|src)=/iu,
    `Unsafe URL attribute survived sanitization: ${sanitized}`,
  );
}

const validLink = normalizeProductDescriptionHtml(
  '<a href="https://ysim.vn/vi/support" target="_blank">Hỗ trợ</a>',
);
assert.match(validLink, /href="https:\/\/ysim\.vn\/vi\/support"/u);
assert.match(validLink, /rel="noopener noreferrer"/u);
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
assert.match(componentSource, /product\.descriptionPreview/u);
assert.match(componentSource, /line-clamp-4/u);
assert.doesNotMatch(componentSource, /max-h-28 overflow-hidden/u);
assert.match(
  componentSource,
  /hasExpandableDescription && !descriptionExpanded[\s\S]*product\.descriptionPreview[\s\S]*dangerouslySetInnerHTML/u,
);
assert.match(componentSource, /\[&_ul\]:list-disc/u);
assert.match(componentSource, /\[&_strong\]:font-bold/u);
assert.match(componentSource, /\[&_table\]:my-5/u);
assert.match(componentSource, /aria-expanded=\{descriptionExpanded\}/u);
assert.match(componentSource, /product\.descriptionReadMore/u);
assert.match(componentSource, /product\.descriptionReadLess/u);

const mapperSource = await readFile(
  path.join(
    repositoryRoot,
    "src/lib/storefront/integration/product-detail/product-detail-production-mapper.ts",
  ),
  "utf8",
);
const viewModelSource = await readFile(
  path.join(
    repositoryRoot,
    "src/types/view-models/product-detail-route-candidate.ts",
  ),
  "utf8",
);
assert.match(
  mapperSource,
  /descriptionPreview:\s*normalizeProductDescriptionText\(product\.description\)/u,
);
assert.match(viewModelSource, /descriptionPreview:\s*string/u);

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
console.log("PRODUCT_DESCRIPTION_ENCODED_SCHEME_BYPASS_GUARDS=PASS_6_OF_6");
console.log("PRODUCT_DESCRIPTION_NONINTERACTIVE_PREVIEW=PASS");
console.log("PRODUCT_DESCRIPTION_I18N=PASS_3_OF_3");
console.log("F08_PRODUCT_DESCRIPTION_PRESENTATION=PASS");
