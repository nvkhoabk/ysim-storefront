import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  access,
  appendFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

import {
  acquireDurableOperationLock,
  DurableOperationLockError,
} from "../src/lib/runtime/durable-operation-lock.ts";
import { classifyGPayPaidOrderTransaction } from "../src/lib/fulfillment/gigago/gpay-payment-idempotency.ts";

let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

async function waitForFile(file, timeoutMs = 3_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await access(file, fsConstants.F_OK);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  throw new Error(`Timed out waiting for ${file}`);
}

function runLockWorker({ moduleUrl, directory, marker, label, holdMs }) {
  const source = `
    import { appendFile } from "node:fs/promises";
    import { acquireDurableOperationLock } from ${JSON.stringify(moduleUrl)};
    const lock = await acquireDurableOperationLock({
      directory: process.env.F07_LOCK_DIRECTORY,
      namespace: "payment-worker-test",
      resource: "order-4300",
      staleAfterMs: 30000,
      waitTimeoutMs: 5000,
      retryIntervalMs: 20,
    });
    await appendFile(process.env.F07_LOCK_MARKER, process.env.F07_LOCK_LABEL + "-enter\\n");
    await new Promise((resolve) => setTimeout(resolve, Number(process.env.F07_LOCK_HOLD_MS)));
    await appendFile(process.env.F07_LOCK_MARKER, process.env.F07_LOCK_LABEL + "-exit\\n");
    await lock.release();
  `;

  const child = spawn(
    process.execPath,
    ["--input-type=module", "--eval", source],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        F07_LOCK_DIRECTORY: directory,
        F07_LOCK_MARKER: marker,
        F07_LOCK_LABEL: label,
        F07_LOCK_HOLD_MS: String(holdMs),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));

  return {
    child,
    completion: new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(
            new Error(
              `Lock worker ${label} exited ${code}. stdout=${stdout} stderr=${stderr}`,
            ),
          );
        }
      });
    }),
  };
}

const testRoot = await mkdtemp(
  path.join(os.tmpdir(), "ysim-f07-payment-hardening-"),
);

try {
  const staleDirectory = path.join(testRoot, "stale");
  const staleNamespaceDirectory = path.join(staleDirectory, "stale-test");
  const stalePath = path.join(staleNamespaceDirectory, "order-4200.lock");
  await mkdir(staleNamespaceDirectory, { recursive: true });
  await writeFile(
    stalePath,
    `${JSON.stringify({
      version: "durable-operation-lock-v1",
      namespace: "stale-test",
      resource: "order-4200",
      token: "stale-owner-token-0000000000000000",
      acquiredAt: new Date(Date.now() - 60_000).toISOString(),
      pid: 999_999_999,
    })}\n`,
    { mode: 0o600 },
  );

  const reclaimed = await acquireDurableOperationLock({
    directory: staleDirectory,
    namespace: "stale-test",
    resource: "order-4200",
    staleAfterMs: 1_000,
    isProcessAlive: () => false,
  });
  assert.equal(reclaimed.reclaimedStaleLock, true);
  await reclaimed.release();
  pass("DEAD_PID_STALE_LOCK_RECLAIMED_ATOMICALLY");

  const raceDirectory = path.join(testRoot, "stale-race");
  const raceNamespaceDirectory = path.join(raceDirectory, "stale-race-test");
  const raceResource = "order-4203";
  const racePath = path.join(raceNamespaceDirectory, `${raceResource}.lock`);
  const raceGatePath = path.join(
    raceNamespaceDirectory,
    `${raceResource}.reclaim`,
  );
  const blockingIntentPath = path.join(
    raceNamespaceDirectory,
    `${raceResource}.intent-${process.pid}-${randomUUID()}`,
  );
  await mkdir(raceNamespaceDirectory, { recursive: true });
  await writeFile(
    racePath,
    `${JSON.stringify({
      version: "durable-operation-lock-v1",
      namespace: "stale-race-test",
      resource: raceResource,
      token: "stale-race-owner-token-000000000000",
      acquiredAt: new Date(Date.now() - 60_000).toISOString(),
      pid: 999_999_998,
    })}\n`,
    { mode: 0o600 },
  );
  await writeFile(blockingIntentPath, "test-blocking-intent\n", {
    mode: 0o600,
  });

  let raceResolved = 0;
  const acquireRaceLock = () =>
    acquireDurableOperationLock({
      directory: raceDirectory,
      namespace: "stale-race-test",
      resource: raceResource,
      staleAfterMs: 1_000,
      waitTimeoutMs: 5_000,
      retryIntervalMs: 10,
      isProcessAlive: () => false,
    }).then((lock) => {
      raceResolved += 1;
      return lock;
    });

  const raceA = acquireRaceLock();
  await waitForFile(raceGatePath);
  const raceB = acquireRaceLock();
  await unlink(blockingIntentPath);

  const firstRaceLock = await Promise.race([
    raceA.then((lock) => ({ label: "A", lock })),
    raceB.then((lock) => ({ label: "B", lock })),
  ]);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(raceResolved, 1);
  await firstRaceLock.lock.release();

  const secondRaceLock =
    firstRaceLock.label === "A" ? await raceB : await raceA;
  assert.equal(raceResolved, 2);
  await secondRaceLock.release();
  pass("CONCURRENT_STALE_RECLAIM_PRESERVES_NEW_OWNER");

  const orphanGateDirectory = path.join(testRoot, "orphan-gate");
  const orphanGateNamespace = path.join(
    orphanGateDirectory,
    "orphan-gate-test",
  );
  await mkdir(orphanGateNamespace, { recursive: true });
  const orphanGatePath = path.join(orphanGateNamespace, "order-4204.reclaim");
  await writeFile(orphanGatePath, "orphaned-recovery-gate\n", { mode: 0o600 });
  await assert.rejects(
    acquireDurableOperationLock({
      directory: orphanGateDirectory,
      namespace: "orphan-gate-test",
      resource: "order-4204",
      staleAfterMs: 1_000,
    }),
    (error) =>
      error instanceof DurableOperationLockError &&
      error.code === "DURABLE_OPERATION_LOCK_BUSY",
  );
  pass("ORPHAN_RECOVERY_GATE_FAILS_CLOSED");
  await unlink(orphanGatePath);

  const liveDirectory = path.join(testRoot, "live");
  const liveLock = await acquireDurableOperationLock({
    directory: liveDirectory,
    namespace: "live-test",
    resource: "order-4201",
    staleAfterMs: 1_000,
  });

  await assert.rejects(
    acquireDurableOperationLock({
      directory: liveDirectory,
      namespace: "live-test",
      resource: "order-4201",
      staleAfterMs: 1_000,
      isProcessAlive: () => false,
    }),
    (error) =>
      error instanceof DurableOperationLockError &&
      error.code === "DURABLE_OPERATION_LOCK_BUSY",
  );
  await liveLock.release();
  pass("FRESH_LOCK_NEVER_RECLAIMED");

  const malformedDirectory = path.join(testRoot, "malformed");
  const malformedNamespaceDirectory = path.join(
    malformedDirectory,
    "malformed-test",
  );
  await mkdir(malformedNamespaceDirectory, { recursive: true });
  await writeFile(
    path.join(malformedNamespaceDirectory, "order-4202.lock"),
    "not-json\n",
  );
  await assert.rejects(
    acquireDurableOperationLock({
      directory: malformedDirectory,
      namespace: "malformed-test",
      resource: "order-4202",
      staleAfterMs: 1_000,
      isProcessAlive: () => false,
    }),
    (error) =>
      error instanceof DurableOperationLockError &&
      error.code === "DURABLE_OPERATION_LOCK_INVALID",
  );
  pass("MALFORMED_STALE_LOCK_FAILS_CLOSED");

  const workerDirectory = path.join(testRoot, "workers");
  const marker = path.join(testRoot, "worker-order.txt");
  const moduleUrl = pathToFileURL(
    path.resolve("src/lib/runtime/durable-operation-lock.ts"),
  ).href;
  const workerA = runLockWorker({
    moduleUrl,
    directory: workerDirectory,
    marker,
    label: "A",
    holdMs: 250,
  });
  await waitForFile(marker);
  const workerB = runLockWorker({
    moduleUrl,
    directory: workerDirectory,
    marker,
    label: "B",
    holdMs: 10,
  });
  await Promise.all([workerA.completion, workerB.completion]);
  assert.deepEqual((await readFile(marker, "utf8")).trim().split("\n"), [
    "A-enter",
    "A-exit",
    "B-enter",
    "B-exit",
  ]);
  pass("TWO_NODE_PROCESSES_SERIALIZE_PAYMENT_RECORDING");

  assert.equal(
    classifyGPayPaidOrderTransaction({
      orderPaid: false,
      existingTransactionId: null,
      incomingTransactionId: "GPAY-TX-1",
    }),
    "not-paid",
  );
  assert.equal(
    classifyGPayPaidOrderTransaction({
      orderPaid: true,
      existingTransactionId: "GPAY-TX-1",
      incomingTransactionId: "GPAY-TX-1",
    }),
    "same-transaction-duplicate",
  );
  assert.equal(
    classifyGPayPaidOrderTransaction({
      orderPaid: true,
      existingTransactionId: "GPAY-TX-1",
      incomingTransactionId: "GPAY-TX-2",
    }),
    "different-transaction-review",
  );
  pass("PAID_ORDER_TRANSACTION_DISPOSITION_FAILS_CLOSED");

  const automationSource = await readFile(
    "src/lib/fulfillment/gigago/gpay-commerce-automation.ts",
    "utf8",
  );
  assert.doesNotMatch(automationSource, /const inFlight\s*=\s*new Map/u);
  assert.match(automationSource, /await acquireGPayPaymentRecordLock/u);
  assert.match(automationSource, /PAYMENT_ALREADY_RECORDED_SAME_TRANSACTION/u);
  assert.match(automationSource, /ORDER_ALREADY_PAID_DIFFERENT_TRANSACTION/u);
  assert.match(automationSource, /await persistDifferentTransactionReview/u);
  pass("AUTOMATION_USES_DURABLE_LOCK_AND_TRANSACTION_DISPOSITION");

  const createLockSource = await readFile(
    "src/features/payments/gpay-va/gpay-va.create-lock.ts",
    "utf8",
  );
  const providerSource = await readFile(
    "src/features/payments/gpay-va/gpay-va.provider.ts",
    "utf8",
  );
  assert.match(createLockSource, /acquireDurableOperationLock/u);
  assert.match(providerSource, /lockedCreateState === "creating"/u);
  assert.match(providerSource, /lockedCreateState === "uncertain"/u);
  pass("STALE_CREATE_LOCK_RECOVERY_PRESERVES_WOO_FAIL_CLOSED_STATE");

  for (const route of [
    "src/app/api/payments/gpay/webhook/route.ts",
    "src/app/api/payments/gpay/virtual-account/webhook/route.ts",
  ]) {
    const source = await readFile(route, "utf8");
    assert.match(source, /GPayPaymentRecordLockError/u);
    assert.match(source, /status:\s*503/u);
    assert.match(source, /acknowledged:\s*false/u);
  }
  pass("LOCK_CONTENTION_RETURNS_RETRYABLE_NON_ACK_RESPONSE");

  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(packageJson.dependencies.next, "16.2.11");
  assert.equal(packageJson.devDependencies["eslint-config-next"], "16.2.11");
  assert.deepEqual(packageJson.overrides, {
    nanoid: "3.3.18",
    postcss: "8.5.26",
    sharp: "0.35.3",
  });
  pass("PATCHED_PRODUCTION_DEPENDENCIES_PINNED");

  const coordinationResidue = (
    await readdir(testRoot, { recursive: true })
  ).filter(
    (entry) =>
      entry.includes(".intent-") ||
      entry.endsWith(".reclaim") ||
      entry.includes(".stale-"),
  );
  assert.deepEqual(coordinationResidue, []);
  pass("LOCK_COORDINATION_ARTIFACTS_CLEANED");

  await appendFile(path.join(testRoot, "completed"), "ok\n");
} finally {
  await rm(testRoot, { recursive: true, force: true });
}

console.log(`F07_PRD_PAYMENT_CORE_HARDENING_RESULT=PASS_ALL_${passed}`);
