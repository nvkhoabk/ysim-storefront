import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function sourceFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:[cm]?[jt]sx?|json)$/.test(entry.name) ? [path] : [];
  });
}

const removedDirectories = [
  "src/app/ui-preview",
  "src/app/api/ui-preview",
  "src/components/ui-preview",
  "public/ui-preview",
];

for (const directory of removedDirectories) {
  assert.equal(
    existsSync(join(root, directory)),
    false,
    `${directory} must not exist`,
  );
}

const sourceReferences = sourceFiles(join(root, "src"))
  .filter((path) => readFileSync(path, "utf8").includes("ui-preview"))
  .map((path) => relative(root, path).replaceAll("\\", "/"));

assert.deepEqual(
  sourceReferences,
  ["src/proxy.ts"],
  `Only the 404 guard may mention ui-preview; found: ${sourceReferences.join(", ")}`,
);

const proxy = readFileSync(join(root, "src/proxy.ts"), "utf8");
assert.match(proxy, /pathname === "\/ui-preview"/);
assert.match(proxy, /pathname\.startsWith\("\/api\/ui-preview\/"\)/);
assert.match(proxy, /status:\s*404/);

for (const asset of [
  "public/assets/storefront/flags/jp.svg",
  "public/assets/storefront/products/global-esim.svg",
  "public/assets/storefront/content/install-esim.svg",
  "public/assets/storefront/destinations/japan.svg",
]) {
  const path = join(root, asset);
  assert.equal(
    existsSync(path) && statSync(path).isFile(),
    true,
    `${asset} is required`,
  );
}

const paymentClient = readFileSync(
  join(root, "src/features/payments/candidate/payment-candidate-client.ts"),
  "utf8",
);
assert.match(paymentClient, /"\/api\/payments\/create"/);
assert.doesNotMatch(paymentClient, /api\/ui-preview/);

const orderClient = readFileSync(
  join(
    root,
    "src/components/order/refactor/integration/OrderCandidateClient.tsx",
  ),
  "utf8",
);
assert.match(orderClient, /features\/orders\/order\.actions/);

for (const manifestName of [
  ".next/server/app-paths-manifest.json",
  ".next/routes-manifest.json",
]) {
  const manifestPath = join(root, manifestName);
  if (!existsSync(manifestPath)) continue;
  assert.doesNotMatch(readFileSync(manifestPath, "utf8"), /ui-preview/);
}

console.log("F08 UI-preview removal checks passed.");
