// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

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
const MARKER = "F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3";
const SHELL_RUNTIME_FILES = [
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
const ACTIVATED_COMPONENTS = [
  "src/components/layout/PageShell.tsx",
  "src/components/navigation/AnnouncementBar.tsx",
  "src/components/navigation/BrandLogo.tsx",
  "src/components/navigation/CartLink.tsx",
  "src/components/navigation/DesktopNavigation.tsx",
  "src/components/navigation/Footer.tsx",
  "src/components/navigation/Header.tsx",
  "src/components/navigation/LanguageSwitcher.tsx",
  "src/components/navigation/MobileHeader.tsx",
  "src/components/navigation/MobileMenuDrawer.tsx",
  "src/components/navigation/QuickAccessBar.tsx",
  "src/components/navigation/TrustFeatureRow.tsx",
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

async function transpileRuntimeFixture(ts) {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "ysim f07a 2b functional shell test "),
  );
  for (const relativePath of SHELL_RUNTIME_FILES) {
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

for (const relativePath of [
  ...ACTIVATED_COMPONENTS,
  "src/i18n/shell/shell.defaults.ts",
  "src/i18n/shell/shell.types.ts",
  "src/app/ui-preview/localized-shell/page.tsx",
]) {
  assert.match(
    await fileText(relativePath),
    new RegExp(MARKER),
    `${relativePath} must contain activation marker`,
  );
}

const allComponentSource = (
  await Promise.all(ACTIVATED_COMPONENTS.map(fileText))
).join("\n");
for (const literal of [
  "Bỏ qua điều hướng",
  "Điều hướng phụ",
  "Thông tin bổ sung",
  "Điều hướng chính",
  "Điểm đến truy cập nhanh",
  "Phổ biến",
  "Cam kết dịch vụ",
  "Mạng xã hội",
  "Ứng dụng YSim",
  "Sắp ra mắt",
  "Tải xuống",
  "Thanh toán an toàn",
  "Chính sách",
  "Chọn ngôn ngữ",
  "Ngôn ngữ",
  "Giỏ hàng",
  "Mở menu",
  "Đóng menu",
  "Điều hướng mobile",
  "Đóng thông báo",
  "Trang chủ",
]) {
  assert.equal(
    allComponentSource.includes(literal),
    false,
    `shared shell component retains Vietnamese literal: ${literal}`,
  );
}
console.log(
  "PASS no Vietnamese shell literals remain outside message catalogs",
);

const pageShellSource = await fileText("src/components/layout/PageShell.tsx");
assert.match(pageShellSource, /shellLabels\?: LocalizedShellLabels/);
assert.match(pageShellSource, /labels=\{shellLabels\}/);
assert.match(pageShellSource, /locale=\{locale\}/);
assert.match(pageShellSource, /languageSwitch=\{languageSwitch\}/);
assert.match(pageShellSource, /shellLabels\.skipNavigation/);
console.log("PASS PageShell receives and propagates localized labels");

const cartSource = await fileText("src/components/navigation/CartLink.tsx");
assert.match(cartSource, /labels\.cartWithCount\.replace\("\{count\}"/);
assert.match(cartSource, /\{labels\.cart\}/);
console.log("PASS cart visible and accessibility labels follow locale");

const quickAccessSource = await fileText(
  "src/components/navigation/QuickAccessBar.tsx",
);
assert.match(quickAccessSource, /labels\.quickAccessNavigation/);
assert.match(quickAccessSource, /labels\.quickAccessPopular/);
console.log("PASS quick-access title and accessibility label follow locale");

const announcementSource = await fileText(
  "src/components/navigation/AnnouncementBar.tsx",
);
assert.match(announcementSource, /labels\.announcementClose/);
console.log("PASS announcement close label follows locale");

const mobileSource = `${await fileText(
  "src/components/navigation/MobileHeader.tsx",
)}\n${await fileText("src/components/navigation/MobileMenuDrawer.tsx")}`;
for (const property of [
  "openMenu",
  "closeMenu",
  "mobileMenuDialog",
  "mobileNavigation",
]) {
  assert.match(mobileSource, new RegExp(`labels\\.${property}`));
}
console.log("PASS mobile shell labels follow locale");

const footerSource = await fileText("src/components/navigation/Footer.tsx");
for (const property of [
  "applicationTitle",
  "comingSoon",
  "download",
  "paymentTitle",
  "socialNavigation",
  "legalNavigation",
  "serviceCommitments",
]) {
  assert.match(footerSource, new RegExp(`labels\\.${property}`));
}
console.log("PASS footer visible and accessibility labels follow locale");

const languageSource = await fileText(
  "src/components/navigation/LanguageSwitcher.tsx",
);
assert.match(languageSource, /value=\{selectedLocale\}/);
assert.doesNotMatch(languageSource, /defaultValue=/);
assert.match(languageSource, /switchConfig\.mode === "preview"/);
assert.match(languageSource, /fetch\("\/api\/preferences\/market"/);
assert.match(languageSource, /MARKET_CONFIGS\.find/);
console.log("PASS language selector is controlled and market-ready");

const previewSource = await fileText(
  "src/app/ui-preview/localized-shell/page.tsx",
);
assert.match(previewSource, /shellLabels=\{shell\.labels\}/);
assert.match(previewSource, /locale=\{shell\.locale\}/);
assert.match(previewSource, /mode: "preview"/);
assert.match(previewSource, /previewPath: "\/ui-preview\/localized-shell"/);
assert.doesNotMatch(previewSource, /YSIM_MARKET_ROUTING_ENABLED\s*=\s*true/);
console.log("PASS preview activation remains isolated from production routing");

for (const brand of [
  "YSim",
  "App Store",
  "Google Play",
  "Visa",
  "Mastercard",
  "NAPAS",
  "GPay",
  "OnePay",
]) {
  const candidateSource = `${await fileText(
    "src/i18n/shell/shell.config.ts",
  )}\n${allComponentSource}`;
  assert.match(candidateSource, new RegExp(brand.replace(" ", "\\s*")));
}
console.log("PASS branded application and payment names remain unchanged");

const registrySource = await fileText("src/i18n/shell/shell.registry.ts");
assert.match(
  registrySource,
  /const next:\s*string \| ShellMessageTree \| undefined = current\[segment\]/,
);
console.log("PASS strict TypeScript nested message traversal contract");

const typescriptPath = await resolveTypeScript();
const ts = await import(pathToFileURL(typescriptPath).href).then(
  (module) => module.default ?? module,
);
const tempRoot = await transpileRuntimeFixture(ts);
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
  assert.match(lao.labels.cart, /[\u0E80-\u0EFF]/);
  assert.match(lao.labels.applicationTitle, /[\u0E80-\u0EFF]/);
  assert.match(lao.navigation.languages[2].label, /[\u0E80-\u0EFF]/);
  console.log("PASS Lao visible shell labels and selector content");

  assert.equal(config.createLocalizedShellBundle("unknown").locale, "vi");
  console.log(
    `PASS cross-platform execution contract: platform=${process.platform}`,
  );
  console.log(
    "PASS: F07A-2B R2 functional shared-shell localization activation contract.",
  );
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
