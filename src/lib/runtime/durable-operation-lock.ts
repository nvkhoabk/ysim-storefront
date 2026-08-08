import { randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { lstat, mkdir, open, readdir, rename, unlink } from "node:fs/promises";
import path from "node:path";

export class DurableOperationLockError extends Error {
  readonly code:
    "DURABLE_OPERATION_LOCK_BUSY" | "DURABLE_OPERATION_LOCK_INVALID";

  constructor(
    code: "DURABLE_OPERATION_LOCK_BUSY" | "DURABLE_OPERATION_LOCK_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "DurableOperationLockError";
    this.code = code;
  }
}

export interface DurableOperationLock {
  readonly path: string;
  readonly reclaimedStaleLock: boolean;
  release(): Promise<void>;
}

interface DurableOperationLockRecord {
  readonly version: "durable-operation-lock-v1";
  readonly namespace: string;
  readonly resource: string;
  readonly token: string;
  readonly acquiredAt: string;
  readonly pid: number;
}

interface AcquireDurableOperationLockOptions {
  readonly directory: string;
  readonly namespace: string;
  readonly resource: string;
  readonly staleAfterMs: number;
  readonly waitTimeoutMs?: number;
  readonly retryIntervalMs?: number;
  readonly isProcessAlive?: (pid: number) => boolean;
}

const SAFE_COMPONENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;
const COORDINATION_DRAIN_TIMEOUT_MS = 5_000;

function assertOptions(options: AcquireDurableOperationLockOptions): void {
  if (!path.isAbsolute(options.directory)) {
    throw new DurableOperationLockError(
      "DURABLE_OPERATION_LOCK_INVALID",
      "Durable lock directory phải là đường dẫn tuyệt đối.",
    );
  }

  if (
    !SAFE_COMPONENT.test(options.namespace) ||
    !SAFE_COMPONENT.test(options.resource) ||
    !Number.isSafeInteger(options.staleAfterMs) ||
    options.staleAfterMs < 1_000 ||
    options.staleAfterMs > 86_400_000
  ) {
    throw new DurableOperationLockError(
      "DURABLE_OPERATION_LOCK_INVALID",
      "Cấu hình durable lock không hợp lệ.",
    );
  }
}

function processIsAlive(pid: number): boolean {
  if (!Number.isSafeInteger(pid) || pid <= 0) {
    return true;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ESRCH") {
      return false;
    }

    // EPERM means the process exists but is owned by another user. Unknown
    // errors also fail closed instead of reclaiming a possibly live lock.
    return true;
  }
}

function isExpectedRecord(
  value: unknown,
  options: AcquireDurableOperationLockOptions,
): value is DurableOperationLockRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Partial<DurableOperationLockRecord>;

  return (
    record.version === "durable-operation-lock-v1" &&
    record.namespace === options.namespace &&
    record.resource === options.resource &&
    typeof record.token === "string" &&
    record.token.length >= 16 &&
    typeof record.acquiredAt === "string" &&
    Number.isSafeInteger(record.pid) &&
    Number(record.pid) > 0
  );
}

async function readExistingRecord(
  lockPath: string,
  options: AcquireDurableOperationLockOptions,
): Promise<DurableOperationLockRecord | null> {
  let handle: Awaited<ReturnType<typeof open>>;

  try {
    handle = await open(
      lockPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw new DurableOperationLockError(
      "DURABLE_OPERATION_LOCK_INVALID",
      "Không thể đọc durable lock hiện hữu một cách an toàn.",
    );
  }

  try {
    const lockStat = await handle.stat();

    if (!lockStat.isFile()) {
      throw new DurableOperationLockError(
        "DURABLE_OPERATION_LOCK_INVALID",
        "Durable lock hiện hữu không phải regular file.",
      );
    }

    const parsed = JSON.parse(await handle.readFile("utf8")) as unknown;

    if (!isExpectedRecord(parsed, options)) {
      throw new DurableOperationLockError(
        "DURABLE_OPERATION_LOCK_INVALID",
        "Durable lock hiện hữu không đúng contract.",
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof DurableOperationLockError) {
      throw error;
    }

    throw new DurableOperationLockError(
      "DURABLE_OPERATION_LOCK_INVALID",
      "Durable lock hiện hữu không chứa JSON hợp lệ.",
    );
  } finally {
    await handle.close();
  }
}

async function pathExistsNoFollow(candidatePath: string): Promise<boolean> {
  try {
    await lstat(candidatePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw new DurableOperationLockError(
      "DURABLE_OPERATION_LOCK_INVALID",
      "Không thể kiểm tra durable lock coordination path.",
    );
  }
}

interface MutationIntent {
  readonly path: string;
  release(): Promise<void>;
}

async function createMutationIntent({
  lockDirectory,
  resource,
}: {
  lockDirectory: string;
  resource: string;
}): Promise<MutationIntent> {
  const intentPath = path.join(
    lockDirectory,
    `${resource}.intent-${process.pid}-${randomUUID()}`,
  );
  const handle = await open(
    intentPath,
    fsConstants.O_CREAT |
      fsConstants.O_EXCL |
      fsConstants.O_WRONLY |
      fsConstants.O_NOFOLLOW,
    0o600,
  );

  try {
    await handle.writeFile("durable-operation-lock-intent-v1\n", "utf8");
    await handle.sync();
  } catch (error) {
    await handle.close().catch(() => undefined);
    await unlink(intentPath).catch(() => undefined);
    throw error;
  }

  await handle.close();

  let released = false;

  return {
    path: intentPath,

    async release() {
      if (released) {
        return;
      }

      released = true;
      await unlink(intentPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
    },
  };
}

async function acquireRecoveryGate(
  gatePath: string,
): Promise<
  | { readonly acquired: false }
  | { readonly acquired: true; release(): Promise<void> }
> {
  let handle: Awaited<ReturnType<typeof open>>;

  try {
    handle = await open(
      gatePath,
      fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        fsConstants.O_WRONLY |
        fsConstants.O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      return { acquired: false };
    }

    throw new DurableOperationLockError(
      "DURABLE_OPERATION_LOCK_INVALID",
      "Không thể tạo durable lock recovery gate.",
    );
  }

  try {
    await handle.writeFile(
      `${JSON.stringify({
        version: "durable-operation-lock-recovery-v1",
        pid: process.pid,
        acquiredAt: new Date().toISOString(),
        token: randomUUID(),
      })}\n`,
      "utf8",
    );
    await handle.sync();
  } catch (error) {
    await handle.close().catch(() => undefined);
    await unlink(gatePath).catch(() => undefined);
    throw error;
  }

  await handle.close();
  let released = false;

  return {
    acquired: true,

    async release() {
      if (released) {
        return;
      }

      released = true;
      await unlink(gatePath);
    },
  };
}

async function waitForMutationIntentsToDrain({
  lockDirectory,
  resource,
  retryIntervalMs,
}: {
  lockDirectory: string;
  resource: string;
  retryIntervalMs: number;
}): Promise<void> {
  const intentPrefix = `${resource}.intent-`;
  const deadline = Date.now() + COORDINATION_DRAIN_TIMEOUT_MS;

  while (true) {
    const entries = await readdir(lockDirectory, { withFileTypes: true });
    const intents = entries.filter((entry) =>
      entry.name.startsWith(intentPrefix),
    );

    if (intents.some((entry) => !entry.isFile())) {
      throw new DurableOperationLockError(
        "DURABLE_OPERATION_LOCK_INVALID",
        "Durable lock mutation intent không phải regular file.",
      );
    }

    if (intents.length === 0) {
      return;
    }

    if (Date.now() >= deadline) {
      throw new DurableOperationLockError(
        "DURABLE_OPERATION_LOCK_BUSY",
        "Durable lock recovery đang chờ mutation intent hiện hữu kết thúc.",
      );
    }

    await sleep(retryIntervalMs);
  }
}

async function reclaimStaleLock({
  lockPath,
  lockDirectory,
  recoveryGatePath,
  options,
  retryIntervalMs,
}: {
  lockPath: string;
  lockDirectory: string;
  recoveryGatePath: string;
  options: AcquireDurableOperationLockOptions;
  retryIntervalMs: number;
}): Promise<"reclaimed" | "missing" | "busy"> {
  const recoveryGate = await acquireRecoveryGate(recoveryGatePath);

  if (!recoveryGate.acquired) {
    return "busy";
  }

  try {
    // Every create/release mutation publishes an intent before checking this
    // gate. Once all pre-existing intents drain, no new mutation can touch the
    // resource path until the gate is removed.
    await waitForMutationIntentsToDrain({
      lockDirectory,
      resource: options.resource,
      retryIntervalMs,
    });

    const record = await readExistingRecord(lockPath, options);

    if (!record) {
      return "missing";
    }

    const acquiredAtMs = Date.parse(record.acquiredAt);

    if (!Number.isFinite(acquiredAtMs)) {
      throw new DurableOperationLockError(
        "DURABLE_OPERATION_LOCK_INVALID",
        "Durable lock hiện hữu có acquiredAt không hợp lệ.",
      );
    }

    const ageMs = Date.now() - acquiredAtMs;
    const ownerAlive = (options.isProcessAlive ?? processIsAlive)(record.pid);

    if (ageMs < options.staleAfterMs || ownerAlive) {
      return "busy";
    }

    const quarantinePath = `${lockPath}.stale-${record.token}-${randomUUID()}`;

    try {
      await rename(lockPath, quarantinePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return "missing";
      }

      throw error;
    }

    await unlink(quarantinePath);
    return "reclaimed";
  } finally {
    await recoveryGate.release();
  }
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function acquireDurableOperationLock(
  options: AcquireDurableOperationLockOptions,
): Promise<DurableOperationLock> {
  assertOptions(options);

  const waitTimeoutMs = Math.max(0, options.waitTimeoutMs ?? 0);
  const retryIntervalMs = Math.max(10, options.retryIntervalMs ?? 50);
  const deadline = Date.now() + waitTimeoutMs;
  const lockDirectory = path.join(options.directory, options.namespace);
  const lockPath = path.join(lockDirectory, `${options.resource}.lock`);
  const recoveryGatePath = path.join(
    lockDirectory,
    `${options.resource}.reclaim`,
  );
  let reclaimedStaleLock = false;

  await mkdir(lockDirectory, { recursive: true, mode: 0o700 });

  while (true) {
    const token = randomUUID();
    const mutationIntent = await createMutationIntent({
      lockDirectory,
      resource: options.resource,
    });
    let handle: Awaited<ReturnType<typeof open>>;

    try {
      if (await pathExistsNoFollow(recoveryGatePath)) {
        if (Date.now() < deadline) {
          await mutationIntent.release();
          await sleep(Math.min(retryIntervalMs, deadline - Date.now()));
          continue;
        }

        throw new DurableOperationLockError(
          "DURABLE_OPERATION_LOCK_BUSY",
          "Durable lock recovery gate đang được worker khác giữ.",
        );
      }

      try {
        handle = await open(
          lockPath,
          fsConstants.O_CREAT |
            fsConstants.O_EXCL |
            fsConstants.O_WRONLY |
            fsConstants.O_NOFOLLOW,
          0o600,
        );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
          throw error;
        }

        await mutationIntent.release();
        const reclaim = await reclaimStaleLock({
          lockPath,
          lockDirectory,
          recoveryGatePath,
          options,
          retryIntervalMs,
        });

        if (reclaim === "reclaimed") {
          reclaimedStaleLock = true;
          continue;
        }

        if (reclaim === "missing") {
          continue;
        }

        if (Date.now() < deadline) {
          await sleep(Math.min(retryIntervalMs, deadline - Date.now()));
          continue;
        }

        throw new DurableOperationLockError(
          "DURABLE_OPERATION_LOCK_BUSY",
          "Một worker khác đang giữ durable operation lock.",
        );
      }
    } catch (error) {
      await mutationIntent.release().catch(() => undefined);
      throw error;
    }

    const record: DurableOperationLockRecord = {
      version: "durable-operation-lock-v1",
      namespace: options.namespace,
      resource: options.resource,
      token,
      acquiredAt: new Date().toISOString(),
      pid: process.pid,
    };

    try {
      await handle.writeFile(`${JSON.stringify(record)}\n`, "utf8");
      await handle.sync();
    } catch (error) {
      await handle.close().catch(() => undefined);
      await unlink(lockPath).catch(() => undefined);
      await mutationIntent.release().catch(() => undefined);
      throw error;
    }

    await mutationIntent.release();

    let handleClosed = false;
    let released = false;

    return {
      path: lockPath,
      reclaimedStaleLock,

      async release() {
        if (released) {
          return;
        }

        if (!handleClosed) {
          await handle.close();
          handleClosed = true;
        }

        const releaseDeadline = Date.now() + COORDINATION_DRAIN_TIMEOUT_MS;

        while (true) {
          const releaseIntent = await createMutationIntent({
            lockDirectory,
            resource: options.resource,
          });

          try {
            if (await pathExistsNoFollow(recoveryGatePath)) {
              if (Date.now() >= releaseDeadline) {
                throw new DurableOperationLockError(
                  "DURABLE_OPERATION_LOCK_BUSY",
                  "Không thể giải phóng durable lock khi recovery gate còn hoạt động.",
                );
              }

              await releaseIntent.release();
              await sleep(retryIntervalMs);
              continue;
            }

            const current = await readExistingRecord(lockPath, options);

            if (!current) {
              released = true;
              return;
            }

            if (current.token !== token) {
              throw new DurableOperationLockError(
                "DURABLE_OPERATION_LOCK_INVALID",
                "Không giải phóng durable lock vì ownership token không khớp.",
              );
            }

            await unlink(lockPath);
            released = true;
            return;
          } finally {
            await releaseIntent.release();
          }
        }
      },
    };
  }
}
