// F07A-1B_MARKET_ROUTING_V1

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

  for (const candidate of [...new Set(candidates)]) {
    try {
      return createRequire(import.meta.url)(candidate);
    } catch {
      // Continue.
    }
  }
  throw new Error("TYPESCRIPT_RUNTIME_NOT_FOUND");
}

const ts = resolveTypeScript();
const tempRoot = mkdtempSync(path.join(tmpdir(), "ysim f07a 1b routing test "));

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
  "src/lib/market/market.request.ts",
  "src/lib/market/market.routing.ts",
];

try {
  for (const sourceFile of sourceFiles) compile(sourceFile);
  writeFileSync(path.join(tempRoot, "package.json"), '{"type":"commonjs"}\n');
  const requireFromTemp = createRequire(path.join(tempRoot, "package.json"));
  const requestModule = requireFromTemp("./src/lib/market/market.request.js");
  const routingModule = requireFromTemp("./src/lib/market/market.routing.js");

  const headers = (values = {}) => new Headers(values);
  const decide = routingModule.decideMarketRouting;

  assert.deepEqual(
    decide({ enabled: false, pathname: "/", countryCode: "VN" }),
    { action: "next", reason: "disabled" },
  );
  console.log("PASS feature flag defaults to a no-op contract");

  assert.equal(
    decide({ enabled: true, pathname: "/", countryCode: "VN" }).location,
    "/vi",
  );
  assert.equal(
    decide({ enabled: true, pathname: "/", countryCode: "LA" }).location,
    "/lo",
  );
  assert.equal(
    decide({ enabled: true, pathname: "/", countryCode: "US" }).location,
    "/en",
  );
  assert.equal(
    decide({ enabled: true, pathname: "/", countryCode: "XX" }).location,
    "/vi",
  );
  console.log(
    "PASS country detection routes VN, LA, global and safe-default markets",
  );

  const cookieDecision = decide({
    enabled: true,
    pathname: "/esim",
    cookieValue: "lo-la",
    countryCode: "VN",
  });
  assert.equal(cookieDecision.action, "redirect");
  assert.equal(cookieDecision.location, "/lo/esim");
  assert.equal(cookieDecision.source, "cookie");
  console.log("PASS explicit cookie preference overrides country detection");

  const localizedDecision = decide({
    enabled: true,
    pathname: "/en/esim/japan",
    search: "?days=7",
    cookieValue: "lo-la",
    countryCode: "VN",
  });
  assert.equal(localizedDecision.action, "rewrite");
  assert.equal(localizedDecision.destination, "/esim/japan?days=7");
  assert.equal(localizedDecision.market.id, "en-global");
  console.log(
    "PASS URL locale wins and rewrites to the existing production route",
  );

  for (const pathname of [
    "/api/payments/gpay/webhook",
    "/_next/static/chunk.js",
    "/ui-preview/foundation",
    "/images/hero.webp",
    "/robots.txt",
  ]) {
    assert.equal(
      decide({ enabled: true, pathname, countryCode: "LA" }).action,
      "next",
    );
  }
  assert.deepEqual(
    decide({ enabled: true, pathname: "/vi/api/payments", countryCode: "VN" }),
    { action: "next", reason: "localized-bypass" },
  );
  console.log(
    "PASS API, webhook, preview and static paths are never redirected or aliased",
  );

  assert.equal(
    routingModule.marketSelectionRedirectPath("en-global", "/lo/cart?step=2"),
    "/en/cart?step=2",
  );
  assert.equal(
    routingModule.marketSelectionRedirectPath("lo-la", "https://evil.example"),
    "/lo",
  );
  assert.equal(
    routingModule.marketSelectionRedirectPath("vi-vn", "//evil.example/path"),
    "/vi",
  );
  console.log(
    "PASS explicit market selection preserves safe paths and blocks open redirects",
  );

  assert.equal(
    requestModule.readCountryCodeFromHeaders(
      headers({ "cf-ipcountry": "VN", "x-ysim-test-country": "LA" }),
      { NODE_ENV: "development", YSIM_MARKET_TEST_MODE: "true" },
    ),
    "LA",
  );
  assert.equal(
    requestModule.readCountryCodeFromHeaders(
      headers({ "cf-ipcountry": "VN", "x-ysim-test-country": "LA" }),
      { NODE_ENV: "production", YSIM_MARKET_TEST_MODE: "true" },
    ),
    "VN",
  );
  console.log(
    "PASS test country header is restricted to explicit non-production mode",
  );

  assert.equal(
    requestModule.isSecureMarketRequest(
      "http://127.0.0.1:3000/",
      headers({ "x-forwarded-proto": "https" }),
    ),
    true,
  );
  assert.equal(
    requestModule.isSecureMarketRequest("http://127.0.0.1:3000/", headers()),
    false,
  );
  console.log(
    "PASS preference cookie security follows the effective request protocol",
  );

  const proxySource = readFileSync(path.join(repoRoot, "src/proxy.ts"), "utf8");
  const routeSource = readFileSync(
    path.join(repoRoot, "src/app/api/preferences/market/route.ts"),
    "utf8",
  );
  assert.match(proxySource, /NextResponse\.redirect/);
  assert.match(proxySource, /NextResponse\.rewrite/);
  assert.match(proxySource, /isMarketRoutingEnabled/);
  assert.doesNotMatch(proxySource, /cookies\.set|MARKET_COOKIE_NAME/);
  assert.match(routeSource, /response\.cookies\.set/);
  assert.match(routeSource, /MARKET_ROUTING_DISABLED/);
  assert.match(routeSource, /marketSelectionRedirectPath/);
  assert.doesNotMatch(routeSource, /location\.href|window\./);
  console.log(
    "PASS proxy never writes preference cookies and the explicit API owns persistence",
  );

  const combinedSource = `${proxySource}\n${routeSource}\n${readFileSync(
    path.join(repoRoot, "src/lib/market/market.request.ts"),
    "utf8",
  )}`;
  assert.doesNotMatch(
    combinedSource,
    /ipinfo|ip-api|geoip|request\.ip|x-forwarded-for/,
  );
  console.log("PASS no external geolocation call or client IP persistence");

  console.log(
    `PASS cross-platform Node execution contract: platform=${process.platform}`,
  );
  console.log(
    "PASS: F07A-1B market detection, cookie and locale routing contract.",
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
