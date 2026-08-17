import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const footerSource = await readFile(
  new URL("../src/components/navigation/Footer.tsx", import.meta.url),
  "utf8",
);
const shellConfigSource = await readFile(
  new URL("../src/i18n/shell/shell.config.ts", import.meta.url),
  "utf8",
);

const duplicateTermsTargets = shellConfigSource.match(
  /localizedLink\(locale, t\("footer\.[^"]+"\), "\/terms"\)/g,
);

assert.equal(
  duplicateTermsTargets?.length,
  2,
  "The legal navigation fixture must retain the two distinct labels that share /terms.",
);
assert.match(
  footerSource,
  /key=\{`\$\{link\.href\}-\$\{link\.label\}`\}/,
  "Legal-link keys must include both href and label.",
);
assert.doesNotMatch(
  footerSource,
  /<FooterNavLink\s+key=\{link\.href\}/,
  "A legal link must not use href alone as its React key.",
);

console.log("DUPLICATE_LEGAL_HREF_FIXTURE=PASS");
console.log("LEGAL_LINK_KEY_USES_HREF_AND_LABEL=PASS");
console.log("F08_FOOTER_LEGAL_LINK_KEY_TESTS_PASSED=2");
