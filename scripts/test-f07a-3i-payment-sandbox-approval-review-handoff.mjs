// F07A-3I_PAYMENT_SANDBOX_APPROVAL_REVIEW_HANDOFF_CANDIDATE_R3

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

const lib = read("src/lib/payments/payment-sandbox-approval-review-handoff.ts");
const types = read("src/lib/payments/payment-sandbox-approval-review-handoff.types.ts");
const page = read("src/app/ui-preview/payment-sandbox-approval-review-handoff/page.tsx");
const registry = read("src/i18n/payment-sandbox-approval-review-handoff/payment-sandbox-approval-review-handoff.registry.ts");
const catalogs = ["vi", "en", "lo"].map((locale) =>
  read(`src/i18n/payment-sandbox-approval-review-handoff/messages/${locale}.ts`),
);
const upstream = read("src/lib/payments/payment-sandbox-approval-request.ts");

const extractKeys = (source) =>
  [...source.matchAll(/^\s*"([^"]+)":/gmu)].map((match) => match[1]).sort();
const [viKeys, enKeys, loKeys] = catalogs.map(extractKeys);

assert(JSON.stringify(viKeys) === JSON.stringify(enKeys) && JSON.stringify(enKeys) === JSON.stringify(loKeys), "Vietnamese English and Lao review-handoff catalog parity");
assert(/[\u0E80-\u0EFF]/u.test(catalogs[2]), "Lao review-handoff UI catalog contains Lao Unicode");
assert(registry.includes('value === "checklist"') && registry.includes('value === "export-envelope"') && registry.includes('value === "audit"'), "locale switch preserves all review-handoff views and shell locale");
assert(page.includes('previewPath: "/ui-preview/payment-sandbox-approval-review-handoff"') && page.includes("searchParams"), "review-handoff navigation remains preview-only and query-based");
assert(/import\s*\(\s*["\']@\/lib\/payments\/payment-sandbox-approval-request["\']\s*\)/.test(page) && page.includes("createPaymentSandboxApprovalReviewHandoff(upstreamRequest)"), "review handoff reuses F07A-3H without duplicating approval-request construction");
assert(lib.includes("SAFE_FIELD_KEYS") && lib.includes("NO_RAW_UPSTREAM_PAYLOAD_RETENTION") && !types.includes("upstreamApprovalRequest") && !types.includes("rawPayload"), "handoff retains only a safe-field summary and no raw upstream payload");
assert(lib.includes('signed: false as const') && lib.includes('containsSecret: false as const') && lib.includes('submitted: false as const'), "export envelope remains unsigned non-secret and unsubmitted");
assert(types.includes("reviewerId: null") && types.includes("decision: null") && lib.includes("reviewerAssignmentCreated: false"), "reviewer assignment and review decision remain absent");
assert(lib.includes("approvalCreated: false") && lib.includes("activationTokenCreated: false") && lib.includes("providerRequestCreated: false") && lib.includes("registryMutationCreated: false"), "approval activation provider execution and registry mutation artifacts remain absent");
assert(!/fetch\s*\(|axios|woocommerce|gpay|onepay|umoney|process\.env|private key|begin certificate/iu.test(lib + page), "review-handoff preview does not inspect secrets call providers or mutate commerce");
assert(upstream.includes("F07A-3H") || upstream.includes("F07A_3H") || upstream.includes("PAYMENT_SANDBOX_APPROVAL_REQUEST"), "F07A-3H upstream contract remains available");
assert(types.includes('productionEligible: false') && types.includes('executionEligible: false'), "production and execution stay blocked");
assert(process.platform === "win32" || process.platform === "linux" || process.platform === "darwin", `cross-platform execution contract: platform=${process.platform}`);
console.log("PASS: F07A-3I payment sandbox approval review handoff candidate contract.");
