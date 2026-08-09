// F07-PRD-002M_OPERATIONAL_AUTH_HEADER_COLLISION_FIX_R2

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const sourcePath = path.join(repoRoot, "src/lib/market/market.request.ts");
const source = readFileSync(sourcePath, "utf8");
const typescript = createRequire(import.meta.url)(
  path.join(repoRoot, "node_modules/typescript/lib/typescript.js"),
);
const tempRoot = mkdtempSync(
  path.join(tmpdir(), "f07-prd-002m-auth-header-test-"),
);
const sourceFiles = [
  "src/lib/market/market.types.ts",
  "src/config/markets.ts",
  "src/lib/market/market.registry.ts",
  "src/lib/market/market.resolve.ts",
  "src/lib/market/market.cookie.ts",
  "src/lib/market/market.request.ts",
];

for (const relativePath of sourceFiles) {
  const inputPath = path.join(repoRoot, relativePath);
  const compiled = typescript.transpileModule(readFileSync(inputPath, "utf8"), {
    fileName: inputPath,
    reportDiagnostics: true,
    compilerOptions: {
      target: typescript.ScriptTarget.ES2022,
      module: typescript.ModuleKind.CommonJS,
      moduleResolution: typescript.ModuleResolutionKind.Node10,
      esModuleInterop: true,
      strict: true,
    },
  });
  const errors = (compiled.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === typescript.DiagnosticCategory.Error,
  );
  assert.deepEqual(errors, []);

  const outputPath = path.join(tempRoot, relativePath.replace(/\.ts$/u, ".js"));
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, compiled.outputText, "utf8");
}

writeFileSync(path.join(tempRoot, "package.json"), '{"type":"commonjs"}\n');
const requireFromTemp = createRequire(path.join(tempRoot, "package.json"));
const marketRequest = requireFromTemp("./src/lib/market/market.request.js");

const operationalHeaders = Object.freeze({
  "x-ysim-sandbox-secret": "sandbox-secret",
  "x-ysim-test-secret": "test-secret",
  "x-ysim-test-key": "test-key",
  "x-ysim-reconciliation-secret": "reconciliation-secret",
  "x-ysim-webhook-token": "webhook-token",
});

const marketAndUnknownHeaders = Object.freeze({
  "x-ysim-test-country": "LA",
  "x-ysim-market-internal-rewrite": "1",
  "x-ysim-market-internal-token": "attacker-token",
  "x-ysim-market-id": "lo-la",
  "x-ysim-locale": "lo",
  "x-ysim-currency": "LAK",
  "x-ysim-market-source": "attacker",
  "x-ysim-public-pathname": "//evil.example",
  "x-ysim-public-locale-route": "lo",
  "x-ysim-arbitrary": "attacker",
});

const sanitized = marketRequest.stripUntrustedYsimHeaders(
  new Headers({
    ...operationalHeaders,
    ...marketAndUnknownHeaders,
    accept: "application/json",
  }),
);

for (const [name, value] of Object.entries(operationalHeaders)) {
  assert.equal(sanitized.get(name), value, `${name} must reach its route`);
}

for (const name of Object.keys(marketAndUnknownHeaders)) {
  assert.equal(sanitized.get(name), null, `${name} must be stripped`);
}

assert.equal(sanitized.get("accept"), "application/json");

assert.match(source, /PRESERVED_OPERATIONAL_AUTH_HEADERS/u);
assert.doesNotMatch(
  source,
  /if \(name\.toLowerCase\(\)\.startsWith\("x-ysim-"\)\)/u,
);

console.log("PASS operational auth header allowlist reaches route handlers");
console.log("PASS market-routing and unknown x-ysim headers remain stripped");
console.log("PASS F07-PRD-002M-R2 operational auth collision regression");
