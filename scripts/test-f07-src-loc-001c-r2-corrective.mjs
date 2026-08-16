// F07-SRC-LOC-001C-R2_CORRECTIVE_REVIEW_CONTRACT

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

async function source(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

const proxy = await source("src/proxy.ts");
const requestRuntime = await source("src/i18n/runtime/runtime.request.ts");
const marketRequest = await source("src/lib/market/market.request.ts");

assert.match(proxy, /stripUntrustedYsimHeaders\(request\.headers\)/);
assert.match(proxy, /marketInternalToken\(\)/);
assert.match(proxy, /continueWithSanitizedHeaders\(sanitizedHeaders\)/);
assert.match(requestRuntime, /hasTrustedMarketHeaders/);
assert.match(marketRequest, /name\.toLowerCase\(\)\.startsWith\("x-ysim-"\)/);
assert.match(marketRequest, /received === expected/);
console.log(
  "PASS Proxy and App Router share a fail-closed x-ysim trust boundary",
);

const routeContracts = {
  "src/app/page.tsx": [
    /getStorefrontLocaleRequest/,
    /localizeHomePageViewModel/,
    /mode ===[\s\S]*"legacy" &&[\s\S]*!request\.localized/,
  ],
  "src/app/esim/page.tsx": [
    /createListingTranslator/,
    /withLocalizedAlternates/,
  ],
  "src/app/destinations/page.tsx": [
    /localizeDestinationPageViewModel/,
    /!request\.localized/,
  ],
  "src/app/esim/[slug]/page.tsx": [
    /request\.localized/,
    /request\.shell\.locale/,
  ],
  "src/app/cart/page.tsx": [
    /createTransactionTranslator/,
    /checkoutCandidatePath: "\/checkout"/,
  ],
  "src/app/checkout/page.tsx": [
    /createTransactionTranslator/,
    /CheckoutContent/,
  ],
  "src/app/checkout/success/page.tsx": [
    /createTransactionTranslator/,
    /localizeShellHref/,
  ],
};

for (const [relativePath, patterns] of Object.entries(routeContracts)) {
  const content = await source(relativePath);
  for (const pattern of patterns) {
    assert.match(
      content,
      pattern,
      `ordinary route contract missing: ${relativePath}`,
    );
  }
}
console.log(
  "PASS Home Catalog Destination Product Cart and Checkout ordinary routes consume locale catalogs",
);

const bodyComponents = [
  "src/components/catalog/EsimInlineTypeExplorer.tsx",
  "src/components/catalog/EsimQuickProductCatalog.tsx",
  "src/components/catalog/EsimChoiceGuide.tsx",
  "src/components/destination/refactor/DestinationCatalog.tsx",
  "src/components/destination-products/DestinationProductsFallbackPage.tsx",
  "src/components/product/refactor/integration/ProductDetailCandidateClient.tsx",
  "src/components/cart/refactor/integration/CartCandidateClient.tsx",
  "src/components/checkout/CheckoutForm.tsx",
  "src/components/checkout/CheckoutOrderSummary.tsx",
  "src/components/checkout/VirtualAccountPaymentPanel.tsx",
];

for (const relativePath of bodyComponents) {
  const content = await source(relativePath);
  assert.match(
    content,
    /create(?:Home|Listing|Detail|Transaction)Translator|useTransactionTranslations/,
    `body locale catalog missing: ${relativePath}`,
  );
}
console.log(
  "PASS ordinary commerce body components use reviewed vi en lo catalogs",
);

const changedContractSource = (
  await Promise.all(
    [...Object.keys(routeContracts), ...bodyComponents, "src/proxy.ts"].map(
      source,
    ),
  )
).join("\n");
assert.doesNotMatch(
  changedContractSource,
  /fetch\([^)]*(?:gpay|onepay|gigago)|sendMail|fulfillOrder|createGigagoOrder/i,
);
assert.doesNotMatch(
  changedContractSource,
  /YSIM_MARKET_ROUTING_ENABLED\s*=\s*(?:true|["']1["'])/,
);
console.log(
  "PASS corrective UI paths do not activate routing or execute providers",
);
console.log("PASS: F07-SRC-LOC-001C-R2 corrective localization contract.");
