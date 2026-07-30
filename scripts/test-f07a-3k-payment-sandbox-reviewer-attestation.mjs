// F07A-3K_PAYMENT_SANDBOX_REVIEWER_ATTESTATION_CANDIDATE_R1

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

const lib = read("src/lib/payments/payment-sandbox-reviewer-attestation.ts");
const types = read(
  "src/lib/payments/payment-sandbox-reviewer-attestation.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-reviewer-attestation/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-reviewer-attestation/payment-sandbox-reviewer-attestation.registry.ts",
);
const catalogs = ["vi", "en", "lo"].map((locale) =>
  read(`src/i18n/payment-sandbox-reviewer-attestation/messages/${locale}.ts`),
);
const upstream = read(
  "src/lib/payments/payment-sandbox-reviewer-assignment.ts",
);

const extractKeys = (source) =>
  [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((match) => match[1]).sort();
const [viKeys, enKeys, loKeys] = catalogs.map(extractKeys);

assert(
  JSON.stringify(viKeys) === JSON.stringify(enKeys) &&
    JSON.stringify(enKeys) === JSON.stringify(loKeys),
  "Vietnamese English and Lao reviewer-attestation catalog parity",
);
assert(
  /[\u0E80-\u0EFF]/u.test(catalogs[2]),
  "Lao reviewer-attestation UI catalog contains Lao Unicode",
);
assert(
  registry.includes('value === "eligibility"') &&
    registry.includes('value === "attestation-envelope"') &&
    registry.includes('value === "audit"'),
  "locale switch preserves all reviewer-attestation views and shell locale",
);
assert(
  page.includes(
    'previewPath: "/ui-preview/payment-sandbox-reviewer-attestation"',
  ) && page.includes("searchParams"),
  "reviewer-attestation navigation remains preview-only and query-based",
);
assert(
  /import\s*\(\s*["']@\/lib\/payments\/payment-sandbox-approval-request["']\s*\)/u.test(
    page,
  ) &&
    page.includes(
      "createPaymentSandboxApprovalReviewHandoff(upstreamRequest)",
    ) &&
    page.includes("createPaymentSandboxReviewerAssignment(upstreamHandoff)") &&
    page.includes("createPaymentSandboxReviewerAttestation"),
  "reviewer attestation reuses F07A-3H, F07A-3I, and F07A-3J without duplicating upstream construction",
);
assert(
  lib.includes("REUSE_F07A_3J_ASSIGNMENT_WITHOUT_DUPLICATION") &&
    lib.includes("validatePaymentSandboxReviewerAssignment") &&
    lib.includes("auditPaymentSandboxReviewerAssignment") &&
    !lib.includes("SAFE_FIELD_KEYS"),
  "reviewer attestation consumes the public F07A-3J assignment contract without duplicating upstream logic",
);
assert(
  lib.includes(
    'ATTESTATION_STATEMENT = "review-packet-inspected-preview-only"',
  ) &&
    lib.includes("attestationSigned: false as const") &&
    lib.includes("attestationPersisted: false as const"),
  "reviewer attestation remains prepared but never signed or persisted",
);
assert(
  lib.includes("reviewDecisionCreated: false") &&
    lib.includes("approvalCreated: false") &&
    lib.includes("activationTokenCreated: false") &&
    lib.includes("providerRequestCreated: false"),
  "review decision approval activation and provider execution artifacts remain absent",
);
assert(
  lib.includes("signed: false as const") &&
    lib.includes("containsSecret: false as const") &&
    lib.includes("containsPii: false as const") &&
    lib.includes("submitted: false as const"),
  "attestation envelope remains unsigned non-secret non-PII and unsubmitted",
);
assert(
  !/fetch\s*\(|axios|woocommerce|process\.env|private key|begin certificate/iu.test(
    lib + page,
  ),
  "reviewer-attestation preview does not inspect secrets call providers or mutate commerce",
);
assert(
  upstream.includes("F07A-3J") ||
    upstream.includes("F07A_3J") ||
    upstream.includes("PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT"),
  "F07A-3J upstream contract remains available",
);
assert(
  types.includes("productionEligible: false") &&
    types.includes("executionEligible: false"),
  "production and execution stay blocked",
);
assert(
  !/\b(?:const|let|var)\s+module\b/u.test(page),
  "Next.js forbidden module-variable regression remains absent",
);
assert(
  process.platform === "win32" ||
    process.platform === "linux" ||
    process.platform === "darwin",
  `cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3K payment sandbox reviewer attestation candidate contract.",
);
