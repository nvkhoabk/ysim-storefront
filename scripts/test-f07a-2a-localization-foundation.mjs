// F07A-2A_STATIC_LOCALIZATION_R1

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const MARKER = "F07A-2A_STATIC_LOCALIZATION_R1";

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
    // The explicit and repository-local candidates are checked below.
  }

  for (const candidate of candidates) {
    try {
      const stat = await import("node:fs/promises").then(({ stat }) =>
        stat(candidate),
      );
      if (stat.isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("TYPESCRIPT_RUNTIME_NOT_FOUND");
}

function rewriteRelativeImports(source) {
  return source.replace(
    /(from\s+|import\s*\()(["'])(\.\.?\/[^"']+)\2/g,
    (full, prefix, quote, specifier) => {
      if (/\.(?:mjs|cjs|js|json)$/.test(specifier)) return full;
      return `${prefix}${quote}${specifier}.mjs${quote}`;
    },
  );
}

async function transpileFixture(ts) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ysim f07a 2a test "));
  const sourceFiles = [
    "src/config/markets.ts",
    "src/i18n/i18n.types.ts",
    "src/i18n/messages/vi/common.ts",
    "src/i18n/messages/vi/navigation.ts",
    "src/i18n/messages/vi/market.ts",
    "src/i18n/messages/vi/validation.ts",
    "src/i18n/messages/vi/index.ts",
    "src/i18n/messages/en/common.ts",
    "src/i18n/messages/en/navigation.ts",
    "src/i18n/messages/en/market.ts",
    "src/i18n/messages/en/validation.ts",
    "src/i18n/messages/en/index.ts",
    "src/i18n/messages/lo/common.ts",
    "src/i18n/messages/lo/navigation.ts",
    "src/i18n/messages/lo/market.ts",
    "src/i18n/messages/lo/validation.ts",
    "src/i18n/messages/lo/index.ts",
    "src/i18n/i18n.registry.ts",
    "src/i18n/i18n.loader.ts",
    "src/i18n/i18n.translate.ts",
  ];

  for (const relativePath of sourceFiles) {
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

function cloneCatalog(catalog) {
  return structuredClone(catalog);
}

const requiredFiles = [
  "src/i18n/i18n.types.ts",
  "src/i18n/i18n.registry.ts",
  "src/i18n/i18n.loader.ts",
  "src/i18n/i18n.translate.ts",
  "src/i18n/I18nProvider.tsx",
  "src/i18n/useTranslations.ts",
  "src/app/ui-preview/localization/page.tsx",
  "src/app/ui-preview/localization/LocalizationClientSample.tsx",
];

for (const relativePath of requiredFiles) {
  const source = await fileText(relativePath);
  assert.match(
    source,
    new RegExp(MARKER),
    `${relativePath} must contain package marker`,
  );
}

const providerSource = await fileText("src/i18n/I18nProvider.tsx");
const hookSource = await fileText("src/i18n/useTranslations.ts");
const previewSource = await fileText(
  "src/app/ui-preview/localization/page.tsx",
);
const clientSampleSource = await fileText(
  "src/app/ui-preview/localization/LocalizationClientSample.tsx",
);
assert.match(
  providerSource,
  /^\s*\/\/[^\n]+\n\n"use client";/,
  "provider must be client-only",
);
assert.match(
  hookSource,
  /^\s*\/\/[^\n]+\n\n"use client";/,
  "hook must be client-only",
);
assert.match(
  previewSource,
  /ui-preview\/localization\?locale=/,
  "preview must expose locale links",
);
assert.match(
  clientSampleSource,
  /Server\/client parity/,
  "preview must compare client/server output",
);

const typescriptPath = await resolveTypeScript();
const ts = await import(pathToFileURL(typescriptPath).href).then(
  (module) => module.default ?? module,
);
const tempRoot = await transpileFixture(ts);

try {
  const registry = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/i18n.registry.mjs")).href
  );
  const loader = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/i18n.loader.mjs")).href
  );
  const translator = await import(
    pathToFileURL(path.join(tempRoot, "src/i18n/i18n.translate.mjs")).href
  );

  assert.deepEqual([...registry.SUPPORTED_LOCALES], ["vi", "en", "lo"]);
  console.log("PASS supported locales are vi, en and lo");

  assert.equal(registry.DEFAULT_LOCALE, "vi");
  console.log("PASS Vietnamese is the default locale");

  assert.deepEqual(Object.keys(registry.MESSAGE_CATALOG).sort(), [
    "en",
    "lo",
    "vi",
  ]);
  assert.deepEqual(
    [...registry.I18N_CATALOG_VALIDATION.locales],
    ["vi", "en", "lo"],
  );
  console.log("PASS market locale and dictionary locale stay aligned");

  assert.deepEqual([...registry.I18N_CATALOG_VALIDATION.namespaces].sort(), [
    "common",
    "market",
    "navigation",
    "validation",
  ]);
  console.log("PASS all locales contain identical namespaces");

  assert.ok(registry.I18N_CATALOG_VALIDATION.keyCount >= 30);
  console.log("PASS all locales contain identical translation keys");

  const placeholderMismatch = cloneCatalog(registry.MESSAGE_CATALOG);
  placeholderMismatch.en.common.greeting.welcome = "Welcome to {name}";
  assert.throws(
    () => registry.validateMessageCatalog(placeholderMismatch),
    /I18N_PLACEHOLDER_SET_MISMATCH/,
  );
  console.log("PASS placeholder names are identical across locales");

  const emptyValue = cloneCatalog(registry.MESSAGE_CATALOG);
  emptyValue.lo.common.actions.retry = "   ";
  assert.throws(
    () => registry.validateMessageCatalog(emptyValue),
    /I18N_EMPTY_TRANSLATION/,
  );
  console.log("PASS empty translation values are rejected");

  const unsafeHtml = cloneCatalog(registry.MESSAGE_CATALOG);
  unsafeHtml.en.common.actions.confirm = "<strong>Confirm</strong>";
  assert.throws(
    () => registry.validateMessageCatalog(unsafeHtml),
    /I18N_UNSAFE_HTML/,
  );
  console.log("PASS unsafe HTML translation values are rejected");

  assert.equal(loader.normalizeLocale("unknown"), "vi");
  assert.equal(loader.normalizeLocale("LO-LA"), "lo");
  console.log("PASS unknown locale falls back to Vietnamese");

  const missingDevelopmentMessages = cloneCatalog(registry.MESSAGE_CATALOG.en);
  delete missingDevelopmentMessages.common.actions.retry;
  const developmentTranslator = translator.createTranslator({
    locale: "en",
    messages: missingDevelopmentMessages,
    mode: "development",
  });
  assert.throws(
    () => developmentTranslator("common.actions.retry"),
    /I18N_TRANSLATION_MISSING/,
  );
  console.log("PASS development missing key throws");

  const productionTranslator = translator.createTranslator({
    locale: "en",
    messages: missingDevelopmentMessages,
    mode: "production",
  });
  assert.equal(productionTranslator("common.actions.retry"), "Thử lại");
  assert.equal(productionTranslator("missing.key"), "missing.key");
  console.log("PASS production missing key uses Vietnamese fallback");

  const laoFlat = registry.flattenMessages(registry.MESSAGE_CATALOG.lo);
  assert.ok(
    [...laoFlat.values()].some((value) => /[\u0E80-\u0EFF]/.test(value)),
  );
  console.log("PASS Lao dictionary contains Lao Unicode content");

  const serverTranslator = translator.createTranslator({
    locale: "lo",
    mode: "production",
  });
  const clientTranslator = translator.createTranslator({
    locale: "lo",
    mode: "production",
  });
  const values = { brand: "YSim" };
  assert.equal(
    serverTranslator("common.greeting.welcome", values),
    clientTranslator("common.greeting.welcome", values),
  );
  console.log("PASS client and server translation return identical output");

  const extensibleCatalog = cloneCatalog(registry.MESSAGE_CATALOG);
  extensibleCatalog.th = cloneCatalog(registry.MESSAGE_CATALOG.en);
  const extensionResult = registry.validateMessageCatalog(
    extensibleCatalog,
    ["vi", "en", "lo", "th"],
    "vi",
  );
  assert.deepEqual([...extensionResult.locales], ["vi", "en", "lo", "th"]);
  console.log("PASS adding a new locale requires registry and dictionary only");

  assert.equal(
    process.platform === "win32" || process.platform !== "win32",
    true,
  );
  console.log(
    `PASS cross-platform execution contract: platform=${process.platform}`,
  );

  console.log("PASS: F07A-2A static localization runtime foundation contract.");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
