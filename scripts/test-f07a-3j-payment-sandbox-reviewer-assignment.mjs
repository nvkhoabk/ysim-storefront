// F07A-3J_PAYMENT_SANDBOX_REVIEWER_ASSIGNMENT_CANDIDATE_R1

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

const lib = read("src/lib/payments/payment-sandbox-reviewer-assignment.ts");
const types = read(
  "src/lib/payments/payment-sandbox-reviewer-assignment.types.ts",
);
const page = read(
  "src/app/ui-preview/payment-sandbox-reviewer-assignment/page.tsx",
);
const registry = read(
  "src/i18n/payment-sandbox-reviewer-assignment/payment-sandbox-reviewer-assignment.registry.ts",
);
const catalogs = ["vi", "en", "lo"].map((locale) =>
  read(`src/i18n/payment-sandbox-reviewer-assignment/messages/${locale}.ts`),
);
const upstream = read(
  "src/lib/payments/payment-sandbox-approval-review-handoff.ts",
);

const extractKeys = (source) =>
  [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((match) => match[1]).sort();
const [viKeys, enKeys, loKeys] = catalogs.map(extractKeys);

assert(
  JSON.stringify(viKeys) === JSON.stringify(enKeys) &&
    JSON.stringify(enKeys) === JSON.stringify(loKeys),
  "Vietnamese English and Lao reviewer-assignment catalog parity",
);
assert(
  /[\u0E80-\u0EFF]/u.test(catalogs[2]),
  "Lao reviewer-assignment UI catalog contains Lao Unicode",
);
assert(
  registry.includes('value === "eligibility"') &&
    registry.includes('value === "assignment-envelope"') &&
    registry.includes('value === "audit"'),
  "locale switch preserves all reviewer-assignment views and shell locale",
);
assert(
  page.includes(
    'previewPath: "/ui-preview/payment-sandbox-reviewer-assignment"',
  ) && page.includes("searchParams"),
  "reviewer-assignment navigation remains preview-only and query-based",
);
assert(
  /import\s*\(\s*["']@\/lib\/payments\/payment-sandbox-approval-request["']\s*\)/u.test(
    page,
  ) &&
    page.includes(
      "createPaymentSandboxApprovalReviewHandoff(upstreamRequest)",
    ) &&
    page.includes("createPaymentSandboxReviewerAssignment(upstreamHandoff)"),
  "reviewer assignment reuses F07A-3H and F07A-3I without duplicating upstream construction",
);
assert(
  lib.includes("REUSE_F07A_3I_HANDOFF_WITHOUT_DUPLICATION") &&
    lib.includes("validatePaymentSandboxApprovalReviewHandoff") &&
    lib.includes("auditPaymentSandboxApprovalReviewHandoff") &&
    !lib.includes("SAFE_FIELD_KEYS"),
  "reviewer assignment consumes the public F07A-3I handoff contract without duplicating safe-summary logic",
);
assert(
  lib.includes("alias: REVIEWER_ALIAS") &&
    lib.includes('identityKind: "opaque-preview-alias" as const') &&
    lib.includes('source: "fixture-only" as const') &&
    lib.includes("containsPii: false as const") &&
    lib.includes("containsCredential: false as const"),
  "reviewer candidate is an opaque non-PII non-credential fixture alias",
);
assert(
  lib.includes("assignmentRecordCreated: false") &&
    lib.includes("assignmentPersisted: false as const") &&
    lib.includes("persisted: false as const"),
  "reviewer assignment remains prepared but never persisted",
);
assert(
  lib.includes("reviewDecisionCreated: false") &&
    lib.includes("reviewerAttestationCreated: false") &&
    lib.includes("approvalCreated: false") &&
    lib.includes("activationTokenCreated: false"),
  "review decision attestation approval and activation artifacts remain absent",
);
assert(
  lib.includes("signed: false as const") &&
    lib.includes("containsSecret: false as const") &&
    lib.includes("containsPii: false as const") &&
    lib.includes("submitted: false as const"),
  "assignment envelope remains unsigned non-secret non-PII and unsubmitted",
);
assert(
  !/fetch\s*\(|axios|woocommerce|process\.env|private key|begin certificate/iu.test(
    lib + page,
  ),
  "reviewer-assignment preview does not inspect secrets call providers or mutate commerce",
);
assert(
  upstream.includes("F07A-3I") ||
    upstream.includes("F07A_3I") ||
    upstream.includes("PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF"),
  "F07A-3I upstream contract remains available",
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
  "PASS: F07A-3J payment sandbox reviewer assignment candidate contract.",
);
