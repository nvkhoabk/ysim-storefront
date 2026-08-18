import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const sourceRoot = path.join(repositoryRoot, "src");

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(absolutePath)));
    } else if (/\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

const sourceFiles = await collectSourceFiles(sourceRoot);
const sourceRecords = await Promise.all(
  sourceFiles.map(async (absolutePath) => ({
    absolutePath,
    relativePath: path
      .relative(repositoryRoot, absolutePath)
      .replaceAll("\\", "/"),
    source: await readFile(absolutePath, "utf8"),
  })),
);

const destinationFragmentFindings = sourceRecords.flatMap((record) =>
  [...record.source.matchAll(/\/destinations#[a-z0-9-]+/gi)].map(
    (match) => `${record.relativePath}:${match[0]}`,
  ),
);

assert.deepEqual(
  destinationFragmentFindings,
  [],
  `Destination navigation must not use URL fragments:\n${destinationFragmentFindings.join(
    "\n",
  )}`,
);
console.log("SOURCE_WIDE_DESTINATION_FRAGMENT_SCAN=PASS");

const expectedCountryTargets = [
  "/destinations/japan",
  "/destinations/south-korea",
  "/destinations/thailand",
  "/destinations/singapore",
  "/destinations/united-states",
];

const navigationSource = await readFile(
  path.join(sourceRoot, "config/storefront-navigation.ts"),
  "utf8",
);
const localizedShellSource = await readFile(
  path.join(sourceRoot, "i18n/shell/shell.config.ts"),
  "utf8",
);
const heroSource = await readFile(
  path.join(sourceRoot, "config/storefront-heroes.ts"),
  "utf8",
);

for (const target of expectedCountryTargets) {
  assert.ok(
    navigationSource.includes(target),
    `Default navigation is missing canonical target ${target}`,
  );
  assert.ok(
    localizedShellSource.includes(target),
    `Localized navigation is missing canonical target ${target}`,
  );
}
console.log("CANONICAL_COUNTRY_NAVIGATION_TARGETS=PASS_5_OF_5");

for (const target of [
  "/destinations?continent=europe",
  "/destinations?continent=north-america",
  "/esim?category=global",
]) {
  assert.ok(
    navigationSource.includes(target),
    `Default navigation is missing region target ${target}`,
  );
  assert.ok(
    localizedShellSource.includes(target),
    `Localized navigation is missing region target ${target}`,
  );
}
console.log("REGION_AND_GLOBAL_NAVIGATION_TARGETS=PASS_3_OF_3");

for (const target of [
  "/destinations/japan",
  "/destinations/south-korea",
  "/destinations/thailand",
]) {
  assert.ok(
    heroSource.includes(target),
    `Hero suggestion is missing ${target}`,
  );
}
console.log("HERO_SUGGESTION_CANONICAL_TARGETS=PASS_3_OF_3");

assert.ok(!navigationSource.includes("/support#technical-support"));
assert.ok(!localizedShellSource.includes("/support#technical-support"));
assert.ok(navigationSource.includes("/support#contact"));
assert.ok(localizedShellSource.includes("/support#contact"));
assert.ok(localizedShellSource.includes("/support#faq"));
console.log("SUPPORT_NAVIGATION_ANCHORS_RESOLVE_TO_RENDERED_SECTIONS=PASS");

const requiredFiles = [
  "src/components/support/refactor/SupportContactChannels.tsx",
  "src/components/support/refactor/FaqAccordion.tsx",
];

for (const relativePath of requiredFiles) {
  await stat(path.join(repositoryRoot, relativePath));
}

const contactSource = await readFile(
  path.join(repositoryRoot, requiredFiles[0]),
  "utf8",
);
const faqSource = await readFile(
  path.join(repositoryRoot, requiredFiles[1]),
  "utf8",
);
assert.ok(contactSource.includes('id="contact"'));
assert.ok(faqSource.includes('id="faq"'));
console.log("SUPPORT_RENDERED_SECTION_IDS=PASS_2_OF_2");

console.log("F08_NAVIGATION_ROUTE_TARGET_ASSERTIONS=15");
console.log("F08_NAVIGATION_ROUTE_TARGET_RESULT=PASS");
