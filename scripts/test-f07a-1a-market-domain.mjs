// F07A-1A_MARKET_DOMAIN_V1

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");

function resolveTypeScript() {
  const candidates = [];

  if (process.env.TYPESCRIPT_PATH) {
    candidates.push(path.resolve(process.env.TYPESCRIPT_PATH));
  }

  candidates.push(
    path.join(repoRoot, "node_modules", "typescript", "lib", "typescript.js"),
  );

  if (process.cwd() !== repoRoot) {
    candidates.push(
      path.join(
        process.cwd(),
        "node_modules",
        "typescript",
        "lib",
        "typescript.js",
      ),
    );
  }

  const errors = [];
  for (const candidate of [...new Set(candidates)]) {
    try {
      return createRequire(import.meta.url)(candidate);
    } catch (error) {
      errors.push(
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  throw new Error(
    [
      "TYPESCRIPT_RUNTIME_NOT_FOUND",
      "Run the test from the ysim-storefront repository after npm ci, or set TYPESCRIPT_PATH to node_modules/typescript/lib/typescript.js.",
      ...errors,
    ].join("\n"),
  );
}

const ts = resolveTypeScript();
const tempRoot = mkdtempSync(path.join(tmpdir(), "ysim f07a 1a market test "));

function compile(relativePath) {
  const sourcePath = path.join(repoRoot, relativePath);
  const source = readFileSync(sourcePath, "utf8");
  const result = ts.transpileModule(source, {
    fileName: sourcePath,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      esModuleInterop: true,
      strict: true,
    },
  });

  const errors = (result.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors.length > 0) {
    throw new Error(
      errors
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        )
        .join("\n"),
    );
  }

  const outputPath = path.join(tempRoot, relativePath.replace(/\.ts$/, ".js"));
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, result.outputText, "utf8");
}

const sourceFiles = [
  "src/lib/market/market.types.ts",
  "src/config/markets.ts",
  "src/lib/market/market.registry.ts",
  "src/lib/market/market.resolve.ts",
  "src/lib/market/market.cookie.ts",
  "src/lib/market/money.ts",
];

try {
  for (const sourceFile of sourceFiles) compile(sourceFile);
  writeFileSync(path.join(tempRoot, "package.json"), '{"type":"commonjs"}\n');
  const requireFromTemp = createRequire(path.join(tempRoot, "package.json"));

  const config = requireFromTemp("./src/config/markets.js");
  const registryModule = requireFromTemp("./src/lib/market/market.registry.js");
  const resolveModule = requireFromTemp("./src/lib/market/market.resolve.js");
  const cookieModule = requireFromTemp("./src/lib/market/market.cookie.js");
  const moneyModule = requireFromTemp("./src/lib/market/money.js");

  const { MARKET_CONFIGS } = config;
  const { buildMarketRegistry, marketRegistry } = registryModule;
  const { resolveMarket, resolveMarketWithRegistry } = resolveModule;

  assert.equal(marketRegistry.defaultMarket.id, "vi-vn");
  assert.equal(marketRegistry.globalFallbackMarket.id, "en-global");
  assert.deepEqual(
    marketRegistry.markets.map((market) => [
      market.id,
      market.locale,
      market.currency,
    ]),
    [
      ["vi-vn", "vi", "VND"],
      ["en-global", "en", "USD"],
      ["lo-la", "lo", "LAK"],
    ],
  );
  console.log("PASS registry: Vietnamese/VND, English/USD and Lao/LAK");

  assert.equal(resolveMarket({ countryCode: "VN" }).market.id, "vi-vn");
  assert.equal(resolveMarket({ countryCode: "LA" }).market.id, "lo-la");
  assert.equal(resolveMarket({ countryCode: "US" }).market.id, "en-global");
  assert.equal(resolveMarket({ countryCode: "FR" }).market.id, "en-global");
  assert.equal(resolveMarket({ countryCode: "XX" }).market.id, "vi-vn");
  assert.equal(resolveMarket({ countryCode: "T1" }).market.id, "vi-vn");
  assert.equal(resolveMarket({}).market.id, "vi-vn");
  console.log("PASS country resolution and safe default");

  const cookieWins = resolveMarket({ cookieValue: "lo-la", countryCode: "VN" });
  assert.equal(cookieWins.market.id, "lo-la");
  assert.equal(cookieWins.source, "cookie");
  const pathWins = resolveMarket({
    pathLocale: "en",
    cookieValue: "lo-la",
    countryCode: "VN",
  });
  assert.equal(pathWins.market.id, "en-global");
  assert.equal(pathWins.source, "path");
  assert.equal(
    resolveMarket({ cookieValue: "invalid", countryCode: "VN" }).market.id,
    "vi-vn",
  );
  console.log("PASS precedence: path > cookie > country > fallback");

  const thaiRegistry = buildMarketRegistry([
    ...MARKET_CONFIGS,
    {
      id: "th-th",
      locale: "th",
      htmlLang: "th",
      intlLocale: "th-TH",
      currency: "THB",
      currencyMinorUnit: 2,
      countryCodes: ["TH"],
      nativeLabel: "ภาษาไทย · THB",
      englishLabel: "Thai · THB",
      direction: "ltr",
    },
  ]);
  assert.equal(
    resolveMarketWithRegistry({ countryCode: "TH" }, thaiRegistry).market.id,
    "th-th",
  );
  console.log("PASS new market automatically adds country recognition");

  assert.throws(
    () =>
      buildMarketRegistry([
        ...MARKET_CONFIGS,
        {
          id: "duplicate-vn",
          locale: "xx",
          htmlLang: "xx",
          intlLocale: "xx-XX",
          currency: "XXX",
          currencyMinorUnit: 2,
          countryCodes: ["VN"],
          nativeLabel: "Duplicate",
          englishLabel: "Duplicate",
          direction: "ltr",
        },
      ]),
    /MARKET_CONFIG_DUPLICATE_COUNTRY/,
  );
  assert.throws(
    () =>
      buildMarketRegistry(
        MARKET_CONFIGS.map((market) => ({ ...market, isDefault: false })),
      ),
    /MARKET_CONFIG_DEFAULT_COUNT:0/,
  );
  console.log("PASS registry rejects ambiguous or incomplete configuration");

  const serialized = cookieModule.serializeMarketCookie("lo-la", {
    secure: true,
  });
  assert.match(serialized, /^ysim_market=lo-la;/);
  assert.match(serialized, /Path=\//);
  assert.match(serialized, /Max-Age=31536000/);
  assert.match(serialized, /SameSite=Lax/);
  assert.match(serialized, /Secure/);
  assert.equal(
    cookieModule.readMarketCookie(`foo=bar; ${serialized.split(";")[0]}`),
    "lo-la",
  );
  assert.equal(cookieModule.readMarketCookie("ysim_market=invalid"), null);
  console.log("PASS explicit preference cookie contract");

  const usdRate = {
    numerator: BigInt(1),
    denominator: BigInt(25000),
    source: "ysim-admin",
    version: "test-1",
    effectiveAt: "2026-07-29T00:00:00Z",
  };
  assert.equal(
    moneyModule.convertMinorAmount(BigInt(100000), 0, 2, usdRate),
    BigInt(400),
  );
  assert.equal(
    moneyModule.convertMinorAmount(BigInt(12500), 0, 2, usdRate),
    BigInt(50),
  );
  assert.equal(
    moneyModule.convertMinorAmount(BigInt(-12500), 0, 2, usdRate),
    BigInt(-50),
  );
  assert.equal(
    moneyModule.minorAmountToDecimalString(BigInt(12345), 2),
    "123.45",
  );
  assert.equal(
    moneyModule.minorAmountToDecimalString(BigInt(95000), 0),
    "95000",
  );
  assert.equal(
    moneyModule.formatMoneyMinor(BigInt(12345), "USD", "en-US", 2),
    "$123.45",
  );
  assert.match(
    moneyModule.formatMoneyMinor(BigInt(95000), "VND", "vi-VN", 0),
    /95[.\s]?000/,
  );
  assert.doesNotThrow(() =>
    moneyModule.convertMinorAmount(BigInt("900719925474099312345"), 0, 0, {
      numerator: BigInt(86315789),
      denominator: BigInt(100000000),
      source: "ysim-admin",
      version: "large-value",
      effectiveAt: "2026-07-29T00:00:00Z",
    }),
  );
  console.log("PASS exact integer money conversion and formatting contract");

  const moneySource = readFileSync(
    path.join(repoRoot, "src/lib/market/money.ts"),
    "utf8",
  );
  assert.doesNotMatch(moneySource, /parseFloat|toFixed|Math\.round/);
  console.log("PASS no floating-point money rounding primitives");

  console.log(
    `PASS cross-platform Node execution contract: platform=${process.platform}`,
  );
  console.log("PASS: F07A-1A market domain foundation contract.");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
