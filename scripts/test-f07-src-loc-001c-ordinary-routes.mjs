// F07-SRC-LOC-001C-R1_ORDINARY_ROUTE_LOCALIZATION

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const RUNTIME_FILES = [
  "src/config/markets.ts",
  "src/lib/market/market.types.ts",
  "src/lib/market/market.cookie.ts",
  "src/lib/market/market.registry.ts",
  "src/lib/market/market.resolve.ts",
  "src/lib/market/market.request.ts",
  "src/i18n/shell/shell.types.ts",
  "src/i18n/shell/messages/vi.ts",
  "src/i18n/shell/messages/en.ts",
  "src/i18n/shell/messages/lo.ts",
  "src/i18n/shell/shell.registry.ts",
  "src/i18n/shell/shell.href.ts",
  "src/i18n/shell/shell.config.ts",
  "src/i18n/runtime/runtime.types.ts",
  "src/i18n/runtime/runtime.request.ts",
  "src/i18n/runtime/runtime.metadata.ts",
];

async function source(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

async function resolveTypeScript() {
  const candidates = [
    process.env.TYPESCRIPT_PATH,
    path.join(ROOT, "node_modules", "typescript", "lib", "typescript.js"),
  ].filter(Boolean);
  const require = createRequire(import.meta.url);
  try {
    candidates.push(require.resolve("typescript"));
  } catch {
    // The repository dependency is preferred.
  }
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the next deterministic candidate.
    }
  }
  throw new Error("TYPESCRIPT_RUNTIME_NOT_FOUND");
}

function rewriteRelativeImports(output) {
  return output.replace(
    /(from\s+|import\s*\()(["'])(\.\.?\/[^"']+)\2/g,
    (full, prefix, quote, specifier) =>
      /\.(?:mjs|cjs|js|json)$/.test(specifier)
        ? full
        : `${prefix}${quote}${specifier}.mjs${quote}`,
  );
}

async function transpileFixture(ts) {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "ysim f07 src loc ordinary routes "),
  );
  for (const relativePath of RUNTIME_FILES) {
    const result = ts.transpileModule(await source(relativePath), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        isolatedModules: true,
        verbatimModuleSyntax: false,
      },
      fileName: relativePath,
      reportDiagnostics: true,
    });
    const errors = (result.diagnostics ?? []).filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    );
    assert.equal(errors.length, 0, `transpile failed: ${relativePath}`);
    const outputPath = path.join(
      tempRoot,
      relativePath.replace(/\.ts$/, ".mjs"),
    );
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      rewriteRelativeImports(result.outputText),
      "utf8",
    );
  }
  return tempRoot;
}

const typescriptPath = await resolveTypeScript();
const ts = await import(pathToFileURL(typescriptPath).href).then(
  (module) => module.default ?? module,
);
const tempRoot = await transpileFixture(ts);
const TRUST_ENV = {
  YSIM_MARKET_INTERNAL_TOKEN: "f07-src-loc-r2-qa-token-not-a-secret-0001",
};

try {
  const requestRuntime = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/runtime/runtime.request.mjs"))
      .href
  );
  const metadataRuntime = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/runtime/runtime.metadata.mjs"))
      .href
  );
  const marketRequest = await import(
    pathToFileURL(path.join(tempRoot, "src/lib/market/market.request.mjs")).href
  );

  const disabled = requestRuntime.resolveStorefrontLocaleRequest(new Headers());
  assert.equal(disabled.localized, false);
  assert.equal(disabled.shell.locale, "vi");
  assert.equal(disabled.shell.marketId, "vi-vn");
  assert.equal(disabled.shell.currency, "VND");
  assert.equal(metadataRuntime.localizedAlternates(disabled), undefined);
  console.log(
    "PASS disabled routing preserves Vietnamese default without alternates",
  );

  const spoofed = requestRuntime.resolveStorefrontLocaleRequest(
    new Headers({
      "x-ysim-locale": "en",
      "x-ysim-public-pathname": "/en/esim",
      "x-ysim-market-internal-rewrite": "1",
    }),
    TRUST_ENV,
  );
  assert.equal(spoofed.localized, false);
  assert.equal(
    marketRequest.isInternalMarketRewrite(
      new Headers({ "x-ysim-market-internal-rewrite": "1" }),
      TRUST_ENV,
    ),
    false,
  );
  const sanitized = marketRequest.stripUntrustedYsimHeaders(
    new Headers({
      "x-ysim-locale": "lo",
      "x-ysim-public-pathname": "//evil.example",
      "x-ysim-arbitrary": "attacker",
      accept: "text/html",
    }),
  );
  assert.equal(sanitized.get("x-ysim-locale"), null);
  assert.equal(sanitized.get("x-ysim-public-pathname"), null);
  assert.equal(sanitized.get("x-ysim-arbitrary"), null);
  assert.equal(sanitized.get("accept"), "text/html");
  console.log("PASS spoofed x-ysim headers are ignored and stripped");

  const cases = {
    vi: ["vi-vn", "VND", "/vi/esim/japan"],
    en: ["en-global", "USD", "/en/esim/japan"],
    lo: ["lo-la", "LAK", "/lo/esim/japan"],
  };
  for (const [locale, [marketId, currency, publicPathname]] of Object.entries(
    cases,
  )) {
    const request = requestRuntime.resolveStorefrontLocaleRequest(
      new Headers({
        "x-ysim-locale": locale,
        "x-ysim-public-pathname": publicPathname,
        "x-ysim-market-internal-token": TRUST_ENV.YSIM_MARKET_INTERNAL_TOKEN,
      }),
      TRUST_ENV,
    );
    assert.equal(request.localized, true);
    assert.equal(request.shell.locale, locale);
    assert.equal(request.shell.htmlLang, locale);
    assert.equal(request.shell.marketId, marketId);
    assert.equal(request.shell.currency, currency);
    const alternates = metadataRuntime.localizedAlternates(request);
    assert.equal(alternates.canonical, publicPathname);
    assert.deepEqual(alternates.languages, {
      vi: "/vi/esim/japan",
      en: "/en/esim/japan",
      lo: "/lo/esim/japan",
      "x-default": "/vi/esim/japan",
    });
  }
  console.log(
    "PASS vi en lo request locale market currency and hreflang matrix",
  );

  const unsafePath = requestRuntime.resolveStorefrontLocaleRequest(
    new Headers({
      "x-ysim-locale": "en",
      "x-ysim-public-pathname": "https://evil.example/path",
      "x-ysim-market-internal-token": TRUST_ENV.YSIM_MARKET_INTERNAL_TOKEN,
    }),
    TRUST_ENV,
  );
  assert.equal(unsafePath.publicPathname, "/");
  console.log(
    "PASS public pathname header cannot create an external canonical",
  );
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

const layout = await source("src/app/layout.tsx");
assert.match(layout, /lang=\{request\.shell\.htmlLang\}/);
assert.match(layout, /dir=\{request\.shell\.direction\}/);
assert.match(layout, /StorefrontLocaleProvider shell=\{request\.shell\}/);
assert.doesNotMatch(layout, /<html[^>]+lang="en"/);
console.log(
  "PASS root document consumes request locale and Lao-safe direction",
);

const proxy = await source("src/proxy.ts");
assert.match(proxy, /MARKET_REQUEST_HEADERS\.publicPathname/);
assert.match(proxy, /api\|_next\/static\|_next\/image\|ui-preview/);
assert.doesNotMatch(
  proxy,
  /YSIM_MARKET_ROUTING_ENABLED\s*=\s*(?:true|["']1["'])/,
);
console.log(
  "PASS Proxy carries public path while activation remains environment-gated",
);

for (const route of [
  "src/app/esim/page.tsx",
  "src/app/esim/[slug]/page.tsx",
  "src/app/destinations/page.tsx",
  "src/app/destinations/[slug]/page.tsx",
  "src/app/cart/page.tsx",
  "src/app/checkout/page.tsx",
]) {
  assert.match(
    await source(route),
    /localizeMetadata|withLocalizedAlternates|generateMetadata/,
    `localized metadata missing: ${route}`,
  );
}
console.log("PASS ordinary commerce routes participate in localized metadata");

const productRoutes = `${await source("src/app/esim/[slug]/page.tsx")}\n${await source("src/app/esim/[slug]/legacy-page.tsx")}`;
assert.match(productRoutes, /request\.shell\.locale/);
assert.doesNotMatch(productRoutes, /const DEFAULT_LOCALE = "vi"/);
console.log(
  "PASS product content request uses the resolved ordinary-route locale",
);

const globalMessages = await source(
  "src/i18n/runtime/global-state.messages.ts",
);
assert.match(globalMessages, /[\u0E80-\u0EFF]/u);
for (const component of [
  "src/components/global-states/GlobalLoadingState.tsx",
  "src/components/global-states/GlobalNotFoundState.tsx",
  "src/components/global-states/GlobalErrorState.tsx",
  "src/components/global-states/GlobalErrorDocument.tsx",
]) {
  assert.match(await source(component), /globalStateMessages/);
}
console.log(
  "PASS loading error not-found and emergency states use locale catalogs",
);

const packageSource = (
  await Promise.all(
    [
      ...RUNTIME_FILES,
      "src/i18n/runtime/runtime.server.ts",
      "src/i18n/runtime/StorefrontLocaleProvider.tsx",
      "src/app/layout.tsx",
    ].map(source),
  )
).join("\n");
assert.doesNotMatch(
  packageSource,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|api[_-]?key\s*[:=]|customer_email|LPA:/i,
);
assert.doesNotMatch(
  packageSource,
  /fetch\([^)]*(?:gpay|onepay|gigago)|sendMail|createOrder/i,
);
console.log(
  "PASS runtime integration contains no secret PII provider or email execution",
);
console.log("PASS: F07-SRC-LOC-001C-R1 ordinary-route localization contract.");
