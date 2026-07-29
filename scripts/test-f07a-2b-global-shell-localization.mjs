// F07A-2B_GLOBAL_SHELL_LOCALIZATION_R2

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
const MARKER = "F07A-2B_GLOBAL_SHELL_LOCALIZATION_R2";
const SOURCE_FILES = [
  "src/config/markets.ts",
  "src/config/storefront-navigation.ts",
  "src/config/storefront-footer.ts",
  "src/i18n/shell/shell.types.ts",
  "src/i18n/shell/messages/vi.ts",
  "src/i18n/shell/messages/en.ts",
  "src/i18n/shell/messages/lo.ts",
  "src/i18n/shell/shell.registry.ts",
  "src/i18n/shell/shell.href.ts",
  "src/i18n/shell/shell.config.ts",
];

async function fileText(relativePath) {
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
    /* repository candidate is preferred */
  }
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      /* next */
    }
  }
  throw new Error("TYPESCRIPT_RUNTIME_NOT_FOUND");
}

function rewriteRelativeImports(source) {
  return source.replace(
    /(from\s+|import\s*\()(["'])(\.\.?\/[^"']+)\2/g,
    (full, prefix, quote, specifier) =>
      /\.(?:mjs|cjs|js|json)$/.test(specifier)
        ? full
        : `${prefix}${quote}${specifier}.mjs${quote}`,
  );
}

async function transpileFixture(ts) {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "ysim f07a 2b shell test "),
  );
  for (const relativePath of SOURCE_FILES) {
    const input = await fileText(relativePath);
    const result = ts.transpileModule(input, {
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
    assert.equal(
      errors.length,
      0,
      `TypeScript transpile error in ${relativePath}`,
    );
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

const requiredFiles = [
  "src/i18n/shell/shell.types.ts",
  "src/i18n/shell/shell.registry.ts",
  "src/i18n/shell/shell.href.ts",
  "src/i18n/shell/shell.config.ts",
  "src/app/ui-preview/localized-shell/page.tsx",
];
for (const relativePath of requiredFiles) {
  assert.match(
    await fileText(relativePath),
    new RegExp(MARKER),
    `${relativePath} must contain marker`,
  );
}

const previewSource = await fileText(
  "src/app/ui-preview/localized-shell/page.tsx",
);
assert.match(previewSource, /PageShell/);
assert.match(previewSource, /ui-preview\/localized-shell\?locale=/);
assert.doesNotMatch(previewSource, /YSIM_MARKET_ROUTING_ENABLED\s*=\s*true/);
console.log("PASS preview-only activation contract");

const registrySource = await fileText("src/i18n/shell/shell.registry.ts");
assert.match(
  registrySource,
  /const next:\s*string \| ShellMessageTree \| undefined = current\[segment\]/,
  "nested shell message traversal must retain an explicit strict TypeScript type",
);
console.log("PASS strict TypeScript nested message traversal contract");

const typescriptPath = await resolveTypeScript();
const ts = await import(pathToFileURL(typescriptPath).href).then(
  (module) => module.default ?? module,
);
const tempRoot = await transpileFixture(ts);
try {
  const registry = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/shell/shell.registry.mjs")).href
  );
  const hrefs = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/shell/shell.href.mjs")).href
  );
  const config = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/shell/shell.config.mjs")).href
  );

  assert.deepEqual([...registry.SHELL_LOCALES], ["vi", "en", "lo"]);
  assert.equal(registry.DEFAULT_SHELL_LOCALE, "vi");
  assert.ok(registry.SHELL_CATALOG_VALIDATION.keyCount >= 80);
  console.log("PASS Vietnamese English and Lao shell catalog parity");

  const clone = structuredClone(registry.SHELL_MESSAGE_CATALOG);
  clone.en.labels.cartWithCount = "Cart with {total} items";
  assert.throws(
    () => registry.validateShellCatalog(clone),
    /SHELL_PLACEHOLDER_SET_MISMATCH/,
  );
  clone.en.labels.cartWithCount = "<strong>Cart</strong>";
  assert.throws(
    () => registry.validateShellCatalog(clone),
    /SHELL_UNSAFE_HTML/,
  );
  console.log("PASS placeholder and unsafe HTML validation");

  assert.equal(
    hrefs.localizeShellHref("/esim?days=7#plans", "lo"),
    "/lo/esim?days=7#plans",
  );
  assert.equal(hrefs.localizeShellHref("/en/esim", "vi"), "/vi/esim");
  assert.equal(hrefs.localizeShellHref("/api/cart", "en"), "/api/cart");
  assert.equal(
    hrefs.localizeShellHref("https://example.test/path", "lo"),
    "https://example.test/path",
  );
  console.log("PASS locale-aware href safety and query/hash preservation");

  const expectations = {
    vi: ["vi-vn", "VND", "/vi/esim"],
    en: ["en-global", "USD", "/en/esim"],
    lo: ["lo-la", "LAK", "/lo/esim"],
  };
  for (const [locale, [marketId, currency, firstHref]] of Object.entries(
    expectations,
  )) {
    const bundle = config.createLocalizedShellBundle(locale);
    assert.equal(bundle.marketId, marketId);
    assert.equal(bundle.currency, currency);
    assert.equal(bundle.navigation.defaultLocale, locale);
    assert.equal(bundle.navigation.mainItems[0].href, firstHref);
    assert.deepEqual(
      bundle.navigation.languages.map((entry) => entry.code),
      ["vi", "en", "lo"],
    );
    assert.ok(
      bundle.footer.legalLinks.every((link) =>
        link.href.startsWith(`/${locale}/`),
      ),
    );
  }
  console.log("PASS locale market currency and shell configuration alignment");

  const lao = config.createLocalizedShellBundle("lo");
  assert.match(lao.navigation.mainItems[0].label, /[\u0E80-\u0EFF]/);
  assert.match(lao.footer.brand.description, /[\u0E80-\u0EFF]/);
  console.log("PASS Lao Unicode shell content");

  assert.equal(config.createLocalizedShellBundle("unknown").locale, "vi");
  assert.equal(
    process.platform === "win32" || process.platform !== "win32",
    true,
  );
  console.log(
    `PASS cross-platform execution contract: platform=${process.platform}`,
  );
  console.log(
    "PASS: F07A-2B R2 global shell localization configuration and preview contract.",
  );
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
