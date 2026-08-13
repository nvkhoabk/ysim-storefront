import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  GPayVAOrderBindingError,
  persistGPayVAOrderBinding,
  resolveGPayVAOrderBinding,
} from "../src/features/payments/gpay-va/gpay-va.order-binding.ts";

let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

const testRoot = await mkdtemp(
  path.join(os.tmpdir(), "ysim-gpay-va-account-mapping-"),
);
const previousIndexDirectory = process.env.GPAY_VA_ORDER_INDEX_DIR;
const previousNodeEnvironment = process.env.NODE_ENV;

try {
  const accountNumber = "970400000000000001";
  const binding = {
    accountNumber,
    orderId: 6394,
    reference: "YSIM-6394-ABCDEF123456",
    equalAmount: 39000,
  };

  process.env.NODE_ENV = "test";
  process.env.GPAY_VA_ORDER_INDEX_DIR = testRoot;

  await persistGPayVAOrderBinding(binding);
  assert.deepEqual(await resolveGPayVAOrderBinding(accountNumber), {
    orderId: binding.orderId,
    reference: binding.reference,
    equalAmount: binding.equalAmount,
  });
  pass("ACCOUNT_NUMBER_RESOLVES_EXACT_ORDER_AND_AMOUNT_CONTRACT");

  const entries = await readdir(testRoot);
  const expectedDigest = createHash("sha256")
    .update(accountNumber, "utf8")
    .digest("hex");
  assert.deepEqual(entries, [`${expectedDigest}.json`]);

  const recordPath = path.join(testRoot, entries[0]);
  const recordText = await readFile(recordPath, "utf8");
  assert.equal(recordText.includes(accountNumber), false);
  assert.equal(entries[0].includes(accountNumber), false);
  assert.equal(JSON.parse(recordText).accountNumberSha256, expectedDigest);

  const recordStat = await stat(recordPath);
  assert.equal(recordStat.isFile(), true);
  if (process.platform !== "win32") {
    assert.equal(recordStat.mode & 0o777, 0o600);
    assert.equal((await lstat(testRoot)).mode & 0o777, 0o700);
  }
  pass("INDEX_PATH_AND_RECORD_DO_NOT_EXPOSE_RAW_VA_ACCOUNT");

  await persistGPayVAOrderBinding(binding);
  assert.deepEqual(await readdir(testRoot), [`${expectedDigest}.json`]);
  pass("EXACT_BINDING_REPLAY_IS_IDEMPOTENT");

  await assert.rejects(
    persistGPayVAOrderBinding({
      ...binding,
      orderId: 6395,
      reference: "YSIM-6395-ABCDEF123456",
    }),
    (error) =>
      error instanceof GPayVAOrderBindingError &&
      error.code === "GPAY_VA_ORDER_BINDING_CONFLICT",
  );
  pass("ACCOUNT_NUMBER_CANNOT_BIND_TO_DIFFERENT_ORDER");

  await assert.rejects(
    resolveGPayVAOrderBinding("970400000000000002"),
    (error) =>
      error instanceof GPayVAOrderBindingError &&
      error.code === "GPAY_VA_ORDER_BINDING_NOT_FOUND",
  );
  pass("UNKNOWN_ACCOUNT_FAILS_CLOSED_WITH_NOT_FOUND");

  process.env.GPAY_VA_ORDER_INDEX_DIR = "relative/index";
  await assert.rejects(
    resolveGPayVAOrderBinding(accountNumber),
    (error) =>
      error instanceof GPayVAOrderBindingError &&
      error.code === "GPAY_VA_ORDER_BINDING_INVALID",
  );
  pass("RELATIVE_INDEX_DIRECTORY_IS_REJECTED");

  delete process.env.GPAY_VA_ORDER_INDEX_DIR;
  process.env.NODE_ENV = "production";
  await assert.rejects(
    resolveGPayVAOrderBinding(accountNumber),
    (error) =>
      error instanceof GPayVAOrderBindingError &&
      error.code === "GPAY_VA_ORDER_BINDING_INVALID",
  );
  pass("PRODUCTION_REQUIRES_EXPLICIT_DURABLE_INDEX_DIRECTORY");

  process.env.NODE_ENV = "test";
  process.env.GPAY_VA_ORDER_INDEX_DIR = testRoot;
  await writeFile(recordPath, "not-json\n", { mode: 0o600 });
  await assert.rejects(
    resolveGPayVAOrderBinding(accountNumber),
    (error) =>
      error instanceof GPayVAOrderBindingError &&
      error.code === "GPAY_VA_ORDER_BINDING_INVALID",
  );
  pass("MALFORMED_BINDING_RECORD_FAILS_CLOSED");

  const routeSource = await readFile(
    "src/app/api/payments/gpay/virtual-account/webhook/route.ts",
    "utf8",
  );
  const providerSource = await readFile(
    "src/features/payments/gpay-va/gpay-va.provider.ts",
    "utf8",
  );
  const bindingSource = await readFile(
    "src/features/payments/gpay-va/gpay-va.order-binding.ts",
    "utf8",
  );

  assert.match(routeSource, /`message=\$\{payload\.message \|\| ""\}`/u);
  assert.doesNotMatch(routeSource, /function orderReference/u);
  assert.doesNotMatch(routeSource, /orderReference\(payload\.message/u);
  assert.doesNotMatch(routeSource, /ORDER_REFERENCE_NOT_FOUND/u);
  assert.equal(routeSource.match(/payload\.message/gu)?.length, 1);
  pass("MESSAGE_REMAINS_SIGNED_BUT_IS_NOT_USED_FOR_ORDER_LOOKUP");

  const signatureIndex = routeSource.indexOf(
    "await verifyGPayVAWebhookSignature",
  );
  const bindingIndex = routeSource.indexOf(
    "await resolveGPayVAOrderBinding(payload.account_number)",
  );
  const orderIndex = routeSource.indexOf(
    "await getWooCommerceAdminOrder(reference.orderId)",
  );
  const amountIndex = routeSource.indexOf(
    "payload.amount !== reference.equalAmount",
  );
  const automationIndex = routeSource.indexOf(
    "await runGPayCommerceAutomation",
  );

  assert.ok(signatureIndex > 0 && signatureIndex < bindingIndex);
  assert.ok(bindingIndex < orderIndex);
  assert.ok(orderIndex < amountIndex && amountIndex < automationIndex);
  assert.match(routeSource, /expectedProvider !== "gpay_virtual_account"/u);
  assert.match(routeSource, /expectedAccount !== payload\.account_number/u);
  assert.match(routeSource, /expectedEqualAmount !== reference\.equalAmount/u);
  pass("SIGNED_ACCOUNT_LOOKUP_PRECEDES_EXACT_PROVIDER_AND_AMOUNT_CHECKS");

  assert.match(providerSource, /await persistGPayVAOrderBinding/u);
  assert.match(providerSource, /accountNumber: data\.account_number \|\| ""/u);
  assert.match(bindingSource, /fsConstants\.O_EXCL/u);
  assert.match(bindingSource, /fsConstants\.O_NOFOLLOW/u);
  assert.doesNotMatch(bindingSource, /getGPayVirtualAccountDetail|fetch\(/u);
  pass("VA_CREATION_PERSISTS_ATOMIC_LOCAL_BINDING_WITHOUT_PROVIDER_READ");

  assert.doesNotMatch(
    `${routeSource}\n${providerSource}\n${bindingSource}`,
    /FULFILLMENT_EXECUTION_ENABLED\s*=\s*true|GIGAGO_ENABLED\s*=\s*true|CUSTOMER_EMAIL_DELIVERY_ENABLED\s*=\s*true/u,
  );
  pass("PATCH_DOES_NOT_ENABLE_FULFILLMENT_GIGAGO_OR_CUSTOMER_EMAIL");
} finally {
  if (previousIndexDirectory === undefined) {
    delete process.env.GPAY_VA_ORDER_INDEX_DIR;
  } else {
    process.env.GPAY_VA_ORDER_INDEX_DIR = previousIndexDirectory;
  }

  if (previousNodeEnvironment === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnvironment;
  }

  await rm(testRoot, { recursive: true, force: true });
}

console.log(`GPAY_VA_ACCOUNT_NUMBER_MAPPING_RESULT=PASS_ALL_${passed}`);
