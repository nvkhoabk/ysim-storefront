#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  expectedGigagoEnvironment,
  gigagoEnvironmentMatchesMode,
} from "../src/lib/fulfillment/gigago/gigago-environment-policy.ts";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const serviceSource = await readFile(
  path.join(
    repositoryRoot,
    "src/lib/fulfillment/gigago/gigago-fulfillment-service.ts",
  ),
  "utf8",
);

const cases = [
  ["sandbox", "demo", true],
  ["sandbox", "live", false],
  ["production", "demo", false],
  ["production", "live", true],
];

for (const [environment, mode, allowed] of cases) {
  assert.equal(
    gigagoEnvironmentMatchesMode(environment, mode),
    allowed,
    `${environment}/${mode}`,
  );
}

assert.equal(expectedGigagoEnvironment("demo"), "sandbox");
assert.equal(expectedGigagoEnvironment("live"), "production");
assert.equal(
  serviceSource.match(
    /assertGigagoEnvironmentForMode\(config\.environment, mode\);/gu,
  )?.length,
  3,
  "preview, submit and status must enforce the same environment policy",
);
assert.doesNotMatch(
  serviceSource,
  /config\.environment !== "sandbox"/u,
  "legacy sandbox-only production blocker must be removed",
);

console.log("GIGAGO_ENVIRONMENT_MODE_MATRIX=PASS_4_OF_4");
console.log("GIGAGO_PRODUCTION_LIVE_MODE=PASS");
console.log("GIGAGO_CROSS_ENVIRONMENT_COMBINATIONS=BLOCKED_2_OF_2");
console.log("GIGAGO_SERVICE_GUARD_CALL_SITES=PASS_3_OF_3");
console.log("F07_PRD_GIGAGO_PRODUCTION_CORRECTIVE_R1_RESULT=PASS");
