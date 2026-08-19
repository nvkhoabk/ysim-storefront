import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const nextConfigSource = await readFile("next.config.ts", "utf8");
const heroSource = await readFile(
  "src/components/destination-products/DestinationCountryHero.tsx",
  "utf8",
);

assert.equal(
  packageJson.scripts?.dev,
  "next dev --webpack",
  "The default development command must avoid the reproduced Turbopack 404.",
);
assert.equal(packageJson.scripts?.build, "next build");
assert.equal(packageJson.scripts?.start, "next start");

const qualitiesMatch = nextConfigSource.match(/qualities\s*:\s*\[([^\]]+)\]/);
assert.ok(qualitiesMatch, "next.config.ts must configure image qualities.");
const configuredQualities = new Set(
  qualitiesMatch[1]
    .split(",")
    .map((value) => Number(value.trim()))
    .filter(Number.isFinite),
);
assert.ok(
  configuredQualities.has(75),
  "Default image quality 75 must remain allowed.",
);
assert.ok(
  configuredQualities.has(82),
  "Destination hero image quality 82 must be allowed.",
);
assert.match(
  heroSource,
  /quality\s*:\s*82/,
  "The destination hero must retain its reviewed quality value.",
);

console.log("DEFAULT_DEV_COMMAND_USES_WEBPACK=PASS");
console.log("PRODUCTION_BUILD_AND_START_COMMANDS_UNCHANGED=PASS");
console.log("DESTINATION_HERO_IMAGE_QUALITY_82_CONFIGURED=PASS");
console.log("F08_DEV_RUNTIME_AND_HERO_QUALITY_ASSERTIONS=PASS_3_OF_3");
